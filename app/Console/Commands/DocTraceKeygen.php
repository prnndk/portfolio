<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DocTraceKeygen extends Command
{
    protected $signature = 'doc-trace:keygen';

    protected $description = 'Print a new generation of document trace keys to add to .env (keep the old generations)';

    public function handle(): int
    {
        $next = max(array_keys(config('doc-trace.keys')) ?: [0]) + 1;
        $pair = sodium_crypto_sign_keypair();

        $this->line('# Back these up outside the server. Losing them makes every issued document unverifiable.');
        $this->line("DOC_TRACE_KEY_VERSION=$next");
        $this->line("DOC_TRACE_HMAC_KEY_$next=".base64_encode(random_bytes(32)));
        $this->line("DOC_SEAL_SECRET_KEY_$next=".base64_encode(sodium_crypto_sign_secretkey($pair)));
        $this->line("DOC_SEAL_PUBLIC_KEY_$next=".base64_encode(sodium_crypto_sign_publickey($pair)));

        return self::SUCCESS;
    }
}
