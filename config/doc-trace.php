<?php

// Keys live in .env as DOC_TRACE_HMAC_KEY_<n>, DOC_SEAL_SECRET_KEY_<n>, DOC_SEAL_PUBLIC_KEY_<n>.
// Records are permanent, so old generations are never removed: they only stop being used to issue.
// Generate a new generation with `php artisan doc-trace:keygen`.
$keys = [];
foreach (range(1, 9) as $v) {
    if (env("DOC_TRACE_HMAC_KEY_$v")) {
        $keys[$v] = [
            'hmac' => env("DOC_TRACE_HMAC_KEY_$v"),
            'seal_secret' => env("DOC_SEAL_SECRET_KEY_$v"),
            'seal_public' => env("DOC_SEAL_PUBLIC_KEY_$v"),
        ];
    }
}

return [
    'key_version' => (int) env('DOC_TRACE_KEY_VERSION', 1),
    'keys' => $keys,
    // Hamming distance (of 64 bits) under which two perceptual hashes count as the same picture.
    'phash_distance' => 8,
];
