<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Anyone may create a trace, so keep guests tight and let the signed-in admin work freely.
        RateLimiter::for('doc-trace-create', fn (Request $r) => $r->user()
            ? Limit::perMinute(60)->by('u'.$r->user()->id)
            : Limit::perHour(10)->by($r->ip()));

        // Passphrase guesses are throttled per document and client.
        RateLimiter::for('doc-unlock', fn (Request $r) => Limit::perMinute(5)->by($r->route('code').'|'.$r->ip()));
    }
}
