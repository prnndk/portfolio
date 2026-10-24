<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentTraceRequest;
use App\Models\DocumentTrace;
use App\Services\DocumentTrace\TraceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTraceController extends Controller
{
    public function __construct(private TraceService $traces) {}

    public function store(StoreDocumentTraceRequest $request): JsonResponse
    {
        $made = $this->traces->create($request->validated(), $request->user()?->id);

        return response()->json([
            'code' => $made['trace']->code,
            'page_codes' => $made['page_codes'],
            'verify_url' => route('verify.show', $made['trace']->code),
            'finalize_token' => $made['token'],
            'public_key' => $this->traces->publicKey(),
        ], 201);
    }

    public function finalize(Request $request, string $code): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'sha256' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/'],
            'phashes' => ['nullable', 'array', 'max:500'],
            'phashes.*' => ['string', 'regex:/^[a-f0-9]{16}$/'],
        ]);

        $trace = DocumentTrace::where('code', $code)->whereNull('finalized_at')->firstOrFail();
        abort_unless(
            $trace->finalize_token_hash && hash_equals($trace->finalize_token_hash, hash('sha256', $data['token'])),
            403,
        );
        abort_if(count($data['phashes'] ?? []) > $trace->page_count, 422, 'Too many page hashes.');

        return response()->json(['seal' => $this->traces->finalize($trace, $data['sha256'], $data['phashes'] ?? null)]);
    }

    public function revoke(Request $request, string $code): JsonResponse
    {
        $trace = $this->authorizeCreator($request, $code);
        $trace->update(['revoked_at' => $trace->revoked_at ?? now()]);

        return response()->json(['revoked' => true]);
    }

    /** Receives hashes and codes extracted in the browser, never the file itself. */
    public function check(Request $request): JsonResponse
    {
        $input = $request->validate([
            'sha256' => ['nullable', 'string', 'regex:/^[a-fA-F0-9]{64}$/'],
            'code' => ['nullable', 'string', 'max:10'],
            'page_codes' => ['nullable', 'array', 'max:500'],
            'page_codes.*' => ['string', 'size:8'],
            'phashes' => ['nullable', 'array', 'max:500'],
            'phashes.*' => ['string', 'regex:/^[a-fA-F0-9]{16}$/'],
        ]);

        $result = $this->traces->lookup($input);
        $this->traces->logVerification($result, $request->ip());

        return response()->json($this->traces->present($result) + ['public_key' => $this->traces->publicKey()]);
    }

    /** Hands out the encrypted details only to someone who proves they know the passphrase. */
    public function unlock(Request $request, string $code): JsonResponse
    {
        $trace = $this->authorizeCreator($request, $code, finalizedOnly: true);

        return response()->json([
            'ciphertext' => $trace->makeVisible('details_ciphertext')->details_ciphertext,
            'iv' => $trace->makeVisible('details_iv')->details_iv,
        ]);
    }

    /** Landing page for the QR code printed on the document. */
    public function show(string $code): Response
    {
        $trace = DocumentTrace::whereNotNull('finalized_at')->where('code', strtoupper($code))->first();
        $result = $trace
            ? ['status' => $trace->isRevoked() ? 'revoked' : 'registered', 'matched_by' => 'code', 'trace' => $trace, 'pages' => range(1, $trace->page_count), 'seal_valid' => $this->traces->sealValid($trace)]
            : ['status' => 'unknown', 'matched_by' => null, 'trace' => null, 'pages' => [], 'seal_valid' => false];

        return Inertia::render('Public/Tools/Verify', [
            'initial' => $this->traces->present($result),
            'publicKey' => $this->traces->publicKey(),
        ]);
    }

    private function authorizeCreator(Request $request, string $code, bool $finalizedOnly = false): DocumentTrace
    {
        $data = $request->validate(['auth_key' => ['required', 'string', 'size:44']]);
        $query = DocumentTrace::where('code', strtoupper($code));
        $trace = ($finalizedOnly ? $query->whereNotNull('finalized_at') : $query)->firstOrFail();
        abort_unless(Hash::check($data['auth_key'], $trace->auth_hash), 403, 'Wrong passphrase.');

        return $trace;
    }
}
