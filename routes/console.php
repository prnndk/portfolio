<?php

use App\Models\DocumentTrace;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Drafts that never reached the seal step were never valid documents; finalized records are kept forever.
Schedule::call(fn () => DocumentTrace::whereNull('finalized_at')->where('created_at', '<', now()->subDay())->delete())->daily();
