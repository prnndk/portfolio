<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentTrace;
use App\Models\DocumentVerification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTraceController extends Controller
{
    public function index(): Response
    {
        $traces = DocumentTrace::whereNotNull('finalized_at')->latest('issued_at')->paginate(20)
            ->through(fn (DocumentTrace $t) => [
                'id' => $t->id,
                'code' => $t->code,
                'kind' => $t->kind,
                'mode' => $t->mode,
                'recipient_name' => $t->recipient_name,
                'page_count' => $t->page_count,
                'issued_at' => $t->issued_at->toIso8601String(),
                'revoked' => $t->isRevoked(),
                'by_admin' => $t->user_id !== null,
            ]);

        return Inertia::render('Admin/DocumentTraces/Index', ['traces' => $traces]);
    }

    public function show(DocumentTrace $trace): Response
    {
        return Inertia::render('Admin/DocumentTraces/Show', [
            'trace' => $trace->only(['id', 'code', 'kind', 'mode', 'recipient_name', 'issuer_name', 'page_count', 'sha256', 'settings', 'key_version'])
                + ['issued_at' => $trace->issued_at->toIso8601String(), 'revoked_at' => $trace->revoked_at?->toIso8601String()],
            'pages' => $trace->pages->map->only(['page_no', 'page_code']),
            'verifications' => DocumentVerification::where('document_trace_id', $trace->id)->latest('created_at')->limit(50)
                ->get(['result', 'matched_by', 'created_at']),
        ]);
    }

    public function revoke(DocumentTrace $trace): RedirectResponse
    {
        $trace->update(['revoked_at' => $trace->revoked_at ?? now()]);

        return back();
    }
}
