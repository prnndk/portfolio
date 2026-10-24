<?php

use App\Models\DocumentTrace;
use App\Models\User;
use App\Services\DocumentTrace\TraceService;
use Inertia\Testing\AssertableInertia as Assert;

function setKeys(int $version = 1, bool $keepOld = false): void
{
    $pair = sodium_crypto_sign_keypair();
    $keys = $keepOld ? config('doc-trace.keys') : [];
    $keys[$version] = [
        'hmac' => base64_encode(random_bytes(32)),
        'seal_secret' => base64_encode(sodium_crypto_sign_secretkey($pair)),
        'seal_public' => base64_encode(sodium_crypto_sign_publickey($pair)),
    ];
    config(['doc-trace.keys' => $keys, 'doc-trace.key_version' => $version]);
}

function tracePayload(array $over = []): array
{
    return $over + [
        'rights' => true,
        'kind' => 'pdf',
        'mode' => 'both',
        'recipient_name' => 'Budi Santoso',
        'issuer_name' => 'Arya',
        'page_count' => 3,
        'settings' => ['text' => 'CONFIDENTIAL'],
        'details_ciphertext' => base64_encode('ciphertext-bytes'),
        'details_iv' => base64_encode(random_bytes(12)),
        'details_salt' => base64_encode(random_bytes(16)),
        'details_kdf' => ['alg' => 'PBKDF2-SHA256', 'iter' => 600000],
        'auth_key' => base64_encode(str_repeat('k', 32)),
    ];
}

/** Creates and finalizes a trace the way the browser does; returns [create response data, sha256]. */
function issue(array $over = [], ?array $phashes = null): array
{
    $sha = hash('sha256', random_bytes(16));
    $res = test()->postJson('/tools/trace', tracePayload($over))->assertCreated();
    $data = $res->json();
    test()->postJson("/tools/trace/{$data['code']}/finalize", ['token' => $data['finalize_token'], 'sha256' => $sha, 'phashes' => $phashes])
        ->assertOk()->assertJsonStructure(['seal']);

    return [$data, $sha];
}

beforeEach(fn () => setKeys());

test('page codes are deterministic and different on every page', function () {
    [$data] = issue();
    $svc = app(TraceService::class);

    expect($data['page_codes'])->toHaveCount(3)->and(array_unique($data['page_codes']))->toHaveCount(3)
        ->and($data['page_codes'][1])->toBe($svc->pageCode($data['code'], 2, 1))
        ->and($data['code'])->toHaveLength(10);
});

test('a guest can create a trace and the exact file verifies as authentic', function () {
    [$data, $sha] = issue();

    $this->postJson('/tools/verify', ['sha256' => $sha])
        ->assertOk()
        ->assertJsonPath('status', 'authentic')
        ->assertJsonPath('matched_by', 'sha256')
        ->assertJsonPath('seal_valid', true)
        ->assertJsonPath('trace.code', $data['code'])
        ->assertJsonPath('trace.recipient_name', 'Budi Santoso')
        ->assertJsonPath('trace.has_details', true)
        ->assertJsonPath('pages', [1, 2, 3]);
});

test('verify never leaks the ciphertext, the auth hash or any email', function () {
    [, $sha] = issue();
    $body = $this->postJson('/tools/verify', ['sha256' => $sha])->assertOk()->getContent();

    expect($body)->not->toContain('ciphertext')->not->toContain('auth_hash')->not->toContain('email')->not->toContain(base64_encode('ciphertext-bytes'));
});

test('recipient name is encrypted at rest', function () {
    issue();

    expect(DB::table('document_traces')->value('recipient_name'))->not->toContain('Budi');
});

test('a changed seal or hash is reported as modified, not authentic', function () {
    [$data, $sha] = issue();
    DocumentTrace::where('code', $data['code'])->update(['sha256' => str_repeat('a', 64)]);

    $this->postJson('/tools/verify', ['sha256' => str_repeat('a', 64)])
        ->assertJsonPath('status', 'modified')
        ->assertJsonPath('seal_valid', false);
});

test('a modified file is still traced to its document through the page code', function () {
    [$data] = issue();

    $this->postJson('/tools/verify', ['sha256' => str_repeat('b', 64), 'page_codes' => [$data['page_codes'][1]]])
        ->assertJsonPath('status', 'modified')
        ->assertJsonPath('matched_by', 'page_code')
        ->assertJsonPath('trace.code', $data['code'])
        ->assertJsonPath('pages', [2]);
});

test('a bare code is registered but not proof of the file', function () {
    [$data] = issue();

    $this->postJson('/tools/verify', ['code' => strtolower($data['code'])])
        ->assertJsonPath('status', 'registered')
        ->assertJsonPath('matched_by', 'code');
});

test('a code read out of an uploaded file that fails the hash check means the file was altered', function () {
    [$data] = issue();

    $this->postJson('/tools/verify', ['code' => $data['code'], 'sha256' => str_repeat('e', 64), 'phashes' => ['0000000000000001']])
        ->assertJsonPath('status', 'modified')
        ->assertJsonPath('matched_by', 'code');
});

test('perceptual hashes find a recompressed picture', function () {
    [$data] = issue(['kind' => 'image', 'page_count' => 1], ['f0f0f0f0f0f0f0f0']);

    // 3 bits flipped is within the tolerance, 40 bits is not
    $this->postJson('/tools/verify', ['phashes' => ['f0f0f0f0f0f0f0f7']])
        ->assertJsonPath('status', 'modified')->assertJsonPath('matched_by', 'phash')->assertJsonPath('trace.code', $data['code']);
    $this->postJson('/tools/verify', ['phashes' => ['0f0f0f0f0f0f0f0f']])->assertJsonPath('status', 'unknown');
});

test('unknown files are reported as unknown', function () {
    $this->postJson('/tools/verify', ['sha256' => str_repeat('c', 64)])->assertOk()->assertJsonPath('status', 'unknown')->assertJsonPath('trace', null);
});

test('an unfinalized draft is not a valid document', function () {
    $res = $this->postJson('/tools/trace', tracePayload())->assertCreated()->json();

    $this->postJson('/tools/verify', ['code' => $res['code'], 'page_codes' => $res['page_codes']])->assertJsonPath('status', 'unknown');
    $this->get("/v/{$res['code']}")->assertInertia(fn (Assert $p) => $p->where('initial.status', 'unknown'));
});

test('finalize needs the one-time token and works only once', function () {
    $res = $this->postJson('/tools/trace', tracePayload())->json();
    $body = ['sha256' => str_repeat('d', 64)];

    $this->postJson("/tools/trace/{$res['code']}/finalize", $body + ['token' => 'nope'])->assertForbidden();
    $this->postJson("/tools/trace/{$res['code']}/finalize", $body + ['token' => $res['finalize_token']])->assertOk();
    $this->postJson("/tools/trace/{$res['code']}/finalize", $body + ['token' => $res['finalize_token']])->assertNotFound();
});

test('old key generations keep verifying after a new generation is issued', function () {
    [, $sha] = issue();
    setKeys(2, keepOld: true);

    $this->postJson('/tools/verify', ['sha256' => $sha])->assertJsonPath('status', 'authentic')->assertJsonPath('seal_valid', true);
    [, $sha2] = issue();
    $this->postJson('/tools/verify', ['sha256' => $sha2])->assertJsonPath('status', 'authentic');
    expect(DocumentTrace::pluck('key_version')->all())->toBe([1, 2]);
});

test('creating needs a configured key generation', function () {
    config(['doc-trace.keys' => []]);

    $this->withoutExceptionHandling();
    expect(fn () => $this->postJson('/tools/trace', tracePayload()))->toThrow(RuntimeException::class);
});

test('details unlock only with the right passphrase key and are throttled', function () {
    [$data] = issue();
    $good = ['auth_key' => base64_encode(str_repeat('k', 32))];
    $bad = ['auth_key' => base64_encode(str_repeat('x', 32))];

    $this->postJson("/tools/verify/{$data['code']}/unlock", $good)->assertOk()->assertJsonStructure(['ciphertext', 'iv']);
    foreach (range(1, 4) as $_) {
        $this->postJson("/tools/verify/{$data['code']}/unlock", $bad)->assertForbidden();
    }
    $this->postJson("/tools/verify/{$data['code']}/unlock", $bad)->assertTooManyRequests();
});

test('the creator can revoke with the passphrase key and a revoked document says so', function () {
    [$data, $sha] = issue();

    $this->postJson("/tools/trace/{$data['code']}/revoke", ['auth_key' => base64_encode(str_repeat('x', 32))])->assertForbidden();
    $this->postJson("/tools/trace/{$data['code']}/revoke", ['auth_key' => base64_encode(str_repeat('k', 32))])->assertOk();

    $this->postJson('/tools/verify', ['sha256' => $sha])->assertJsonPath('status', 'revoked');
});

test('abuse controls reject bots, missing consent and oversized input', function () {
    $this->postJson('/tools/trace', tracePayload(['website' => 'http://spam']))->assertUnprocessable();
    $this->postJson('/tools/trace', tracePayload(['rights' => false]))->assertUnprocessable();
    $this->postJson('/tools/trace', tracePayload(['page_count' => 501]))->assertUnprocessable();
    $this->postJson('/tools/trace', tracePayload(['recipient_name' => str_repeat('a', 121)]))->assertUnprocessable();
    $this->postJson('/tools/trace', tracePayload(['details_kdf' => ['alg' => 'PBKDF2-SHA256', 'iter' => 10]]))->assertUnprocessable();
    $this->postJson('/tools/trace', tracePayload(['settings' => ['x' => str_repeat('a', 17000)]]))->assertUnprocessable();
});

test('guests are limited to 10 traces an hour', function () {
    foreach (range(1, 10) as $_) {
        $this->postJson('/tools/trace', tracePayload())->assertCreated();
    }
    $this->postJson('/tools/trace', tracePayload())->assertTooManyRequests();
});

test('verifications are logged without the raw ip', function () {
    [, $sha] = issue();
    $this->postJson('/tools/verify', ['sha256' => $sha]);

    $row = DB::table('document_verifications')->first();
    expect($row->result)->toBe('authentic')->and($row->ip_hash)->toHaveLength(64)->and($row->ip_hash)->not->toBe('127.0.0.1');
});

test('the QR landing page shows a registered record', function () {
    [$data] = issue();

    $this->get("/v/{$data['code']}")->assertOk()->assertInertia(
        fn (Assert $p) => $p->component('Public/Tools/Verify')->where('initial.status', 'registered')->where('initial.trace.code', $data['code']),
    );
});

test('the admin registry is for signed-in users and can revoke', function () {
    [$data] = issue();
    $trace = DocumentTrace::where('code', $data['code'])->first();

    $this->get('/admin/document-traces')->assertRedirect('/login');

    $this->actingAs(User::factory()->create());
    $this->get('/admin/document-traces')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Admin/DocumentTraces/Index')->has('traces.data', 1));
    $this->get("/admin/document-traces/{$trace->id}")->assertOk()->assertInertia(fn (Assert $p) => $p->has('pages', 3));
    $this->post("/admin/document-traces/{$trace->id}/revoke")->assertRedirect();
    expect($trace->fresh()->isRevoked())->toBeTrue();
});

test('hamming distance counts differing bits', function () {
    expect(TraceService::hamming('0000000000000000', '0000000000000007'))->toBe(3)
        ->and(TraceService::hamming('ffffffffffffffff', 'ffffffffffffffff'))->toBe(0);
});
