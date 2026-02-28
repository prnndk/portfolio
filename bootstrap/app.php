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

        // Trust only requests coming from known private-network proxy IPs.
        // Using '*' would allow any direct client to spoof X-Forwarded-For.
        // Docker internal networks use the RFC-1918 ranges below; adjust if
        // you add a cloud load-balancer (add its CIDR or specific IP here).
        $middleware->trustProxies(at: [
            '127.0.0.1',
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16',
        ]);

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
