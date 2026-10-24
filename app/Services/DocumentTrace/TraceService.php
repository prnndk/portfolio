<?php

namespace App\Services\DocumentTrace;

use App\Models\DocumentTrace;
use App\Models\DocumentTracePage;
use App\Models\DocumentVerification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class TraceService
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /** @param array<string, mixed> $data validated input from the trace form */
    public function create(array $data, ?int $userId): array
    {
        $version = $this->currentVersion();
        $code = $this->newCode();
        $token = Str::random(40);

        $trace = DB::transaction(function () use ($data, $userId, $version, $code, $token) {
            $trace = DocumentTrace::create([
                'code' => $code,
                'user_id' => $userId,
                'kind' => $data['kind'],
                'mode' => $data['mode'],
                'recipient_name' => $data['recipient_name'],
                'issuer_name' => $data['issuer_name'] ?? null,
                'details_ciphertext' => $data['details_ciphertext'] ?? null,
                'details_iv' => $data['details_iv'] ?? null,
                'details_salt' => $data['details_salt'],
                'details_kdf' => $data['details_kdf'],
                'auth_hash' => Hash::make($data['auth_key']),
                'page_count' => $data['page_count'],
                'key_version' => $version,
                'settings' => $data['settings'] ?? [],
                'finalize_token_hash' => hash('sha256', $token),
                'issued_at' => now(),
            ]);
            $trace->pages()->createMany(array_map(
                fn (int $n) => ['page_no' => $n, 'page_code' => $this->pageCode($code, $n, $version)],
                range(1, $data['page_count']),
            ));

            return $trace;
        });

        return [
            'trace' => $trace,
            'token' => $token,
            'page_codes' => $trace->pages->pluck('page_code')->all(),
        ];
    }

    /** @param list<string>|null $phashes one 16-char hex perceptual hash per page */
    public function finalize(DocumentTrace $trace, string $sha256, ?array $phashes): string
    {
        $seal = $this->sign($trace, $sha256);

        DB::transaction(function () use ($trace, $sha256, $phashes, $seal) {
            $trace->update([
                'sha256' => $sha256,
                'seal' => $seal,
                'finalize_token_hash' => null,
                'finalized_at' => now(),
            ]);
            foreach ($phashes ?? [] as $i => $hash) {
                DocumentTracePage::where('document_trace_id', $trace->id)->where('page_no', $i + 1)->update(['phash' => $hash]);
            }
        });

        return $seal;
    }

    public function pageCode(string $code, int $pageNo, int $version): string
    {
        return substr(self::base32(hash_hmac('sha256', "$code:$pageNo", $this->key($version)['hmac'], true)), 0, 8);
    }

    public function sealValid(DocumentTrace $trace): bool
    {
        if (! $trace->seal || ! $trace->sha256) {
            return false;
        }
        $sig = base64_decode($trace->seal, true);
        $public = base64_decode($this->key($trace->key_version)['seal_public'], true);

        return $sig !== false && $public !== false
            && sodium_crypto_sign_verify_detached($sig, $this->sealPayload($trace, $trace->sha256), $public);
    }

    /**
     * Finds the trace a file belongs to. Strongest evidence first: exact file hash, then per-page codes,
     * the document code, and finally perceptual hashes (survives recompression and light edits).
     *
     * @param  array{sha256?: ?string, code?: ?string, page_codes?: list<string>, phashes?: list<string>}  $in
     * @return array{status: string, matched_by: ?string, trace: ?DocumentTrace, pages: list<int>, seal_valid: bool}
     */
    public function lookup(array $in): array
    {
        $found = null;

        if (! empty($in['sha256'])) {
            $trace = DocumentTrace::whereNotNull('finalized_at')->where('sha256', strtolower($in['sha256']))->first();
            if ($trace) {
                $found = ['sha256', $trace, range(1, $trace->page_count)];
            }
        }

        if (! $found && ! empty($in['page_codes'])) {
            $hits = DocumentTracePage::whereIn('page_code', array_map('strtoupper', $in['page_codes']))
                ->whereHas('trace', fn ($q) => $q->whereNotNull('finalized_at'))
                ->get()->groupBy('document_trace_id');
            if ($hits->isNotEmpty()) {
                $best = $hits->sortByDesc(fn ($g) => $g->count())->first();
                $found = ['page_code', DocumentTrace::find($best->first()->document_trace_id), $best->pluck('page_no')->sort()->values()->all()];
            }
        }

        if (! $found && ! empty($in['code'])) {
            $trace = DocumentTrace::whereNotNull('finalized_at')->where('code', strtoupper($in['code']))->first();
            if ($trace) {
                $found = ['code', $trace, range(1, $trace->page_count)];
            }
        }

        if (! $found && ! empty($in['phashes'])) {
            $found = $this->lookupByPhash($in['phashes']);
        }

        if (! $found) {
            return ['status' => 'unknown', 'matched_by' => null, 'trace' => null, 'pages' => [], 'seal_valid' => false];
        }

        [$by, $trace, $pages] = $found;
        $sealValid = $this->sealValid($trace);
        // a bare code only proves the record exists; a hash match proves it is that exact file
        $status = match (true) {
            $trace->isRevoked() => 'revoked',
            $by === 'sha256' && $sealValid => 'authentic',
            // a lone code (typed in) proves a record exists; a code found inside an uploaded file that failed the hash check means that file was altered
            $by === 'code' && empty($in['sha256']) && empty($in['phashes']) => 'registered',
            default => 'modified',
        };

        return ['status' => $status, 'matched_by' => $by, 'trace' => $trace, 'pages' => $pages, 'seal_valid' => $sealValid];
    }

    public function logVerification(array $result, ?string $ip): void
    {
        DocumentVerification::create([
            'document_trace_id' => $result['trace']?->id,
            'result' => $result['status'],
            'matched_by' => $result['matched_by'],
            'ip_hash' => $ip ? hash_hmac('sha256', $ip, config('app.key')) : null,
        ]);
    }

    /** Public view of a lookup result: the recipient's name, never an email, the ciphertext or any hash. */
    public function present(array $result): array
    {
        $trace = $result['trace'];

        return [
            'status' => $result['status'],
            'matched_by' => $result['matched_by'],
            'seal_valid' => $result['seal_valid'],
            'pages' => $result['pages'],
            'trace' => $trace ? [
                'code' => $trace->code,
                'kind' => $trace->kind,
                'mode' => $trace->mode,
                'recipient_name' => $trace->recipient_name,
                'issuer_name' => $trace->issuer_name,
                'page_count' => $trace->page_count,
                'issued_at' => $trace->issued_at->toIso8601String(),
                'revoked_at' => $trace->revoked_at?->toIso8601String(),
                'has_details' => $trace->details_ciphertext !== null,
                // the browser needs these to derive keys from the passphrase; they are not secret
                'kdf' => $trace->details_kdf + ['salt' => $trace->details_salt],
            ] : null,
        ];
    }

    public function publicKey(): ?string
    {
        return $this->key($this->currentVersion())['seal_public'];
    }

    private function lookupByPhash(array $phashes): ?array
    {
        $max = (int) config('doc-trace.phash_distance');
        $votes = [];
        // ponytail: linear scan of every stored page hash, add an LSH band index if the registry passes ~1M pages
        DocumentTracePage::whereNotNull('phash')->select('document_trace_id', 'page_no', 'phash')->cursor()->each(
            function ($row) use ($phashes, $max, &$votes) {
                foreach ($phashes as $h) {
                    if (self::hamming($h, $row->phash) <= $max) {
                        $votes[$row->document_trace_id][] = $row->page_no;
                        break;
                    }
                }
            }
        );
        if (! $votes) {
            return null;
        }
        uasort($votes, fn ($a, $b) => count($b) <=> count($a));
        $id = array_key_first($votes);
        $trace = DocumentTrace::whereNotNull('finalized_at')->find($id);

        return $trace ? ['phash', $trace, collect($votes[$id])->unique()->sort()->values()->all()] : null;
    }

    private function sign(DocumentTrace $trace, string $sha256): string
    {
        $secret = base64_decode($this->key($trace->key_version)['seal_secret'], true);

        return base64_encode(sodium_crypto_sign_detached($this->sealPayload($trace, $sha256), $secret));
    }

    private function sealPayload(DocumentTrace $trace, string $sha256): string
    {
        return json_encode([
            'v' => $trace->key_version,
            'code' => $trace->code,
            'sha256' => $sha256,
            'pages' => $trace->page_count,
            'issued' => $trace->issued_at->getTimestamp(),
            'issuer' => $trace->issuer_name,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    private function newCode(): string
    {
        do {
            $code = substr(self::base32(random_bytes(7)), 0, 10);
        } while (DocumentTrace::where('code', $code)->exists());

        return $code;
    }

    private function currentVersion(): int
    {
        $v = (int) config('doc-trace.key_version');
        $this->key($v);

        return $v;
    }

    /** @return array{hmac: string, seal_secret: string, seal_public: string} */
    private function key(int $version): array
    {
        return config("doc-trace.keys.$version")
            ?? throw new RuntimeException("Document trace key generation $version is not configured. Run: php artisan doc-trace:keygen");
    }

    public static function hamming(string $a, string $b): int
    {
        $x = hex2bin($a) ^ hex2bin($b);
        $bits = 0;
        foreach (str_split($x) as $byte) {
            $bits += substr_count(decbin(ord($byte)), '1');
        }

        return $bits;
    }

    public static function base32(string $bytes): string
    {
        $bits = '';
        foreach (str_split($bytes) as $c) {
            $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 5) as $chunk) {
            $out .= self::ALPHABET[bindec(str_pad($chunk, 5, '0'))];
        }

        return $out;
    }
}
