<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareSeoData;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Trust all proxies (Cloudflare, Nginx, etc.) for proper HTTPS detection
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            ShareSeoData::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception) {
            $status = $response->getStatusCode();

            if (in_array($status, [403, 404, 419, 429, 500, 503])) {
                $props = ['status' => $status];

                // Only include detailed error info in debug mode for security
                if (config('app.debug')) {
                    $props['message'] = $exception->getMessage();
                    $props['exception'] = get_class($exception);
                    $props['file'] = $exception->getFile();
                    $props['line'] = $exception->getLine();
                }

                return \Inertia\Inertia::render('error', $props)
                    ->toResponse(request())
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
