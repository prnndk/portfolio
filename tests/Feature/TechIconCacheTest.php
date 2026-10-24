<?php

use App\Models\TechStack;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

it('stores an external icon locally and clears icon_url', function () {
    Http::fake(['*' => Http::response('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')]);
    $stack = TechStack::create(['name' => 'Prisma', 'icon_url' => 'https://1.1.1.1/icons/prisma.svg']);

    expect($stack->cacheRemoteIcon())->toBeTrue();

    $stack->refresh();
    expect($stack->icon_url)->toBeNull();
    Storage::disk('public')->assertExists($stack->icon);
});

it('rejects svg with script and private hosts', function () {
    Http::fake(['*' => Http::response('<svg><script>alert(1)</script></svg>')]);
    $evil = TechStack::create(['name' => 'Evil', 'icon_url' => 'https://1.1.1.1/x.svg']);
    $internal = TechStack::create(['name' => 'Internal', 'icon_url' => 'https://127.0.0.1/x.svg']);

    expect($evil->cacheRemoteIcon())->toBeFalse()
        ->and($internal->cacheRemoteIcon())->toBeFalse()
        ->and($evil->fresh()->icon_url)->not->toBeNull();
});
