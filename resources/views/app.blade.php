<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="author" content="Arya Gading Prinandika">
    <meta name="theme-color" content="#0d0d0f" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)">
    <meta name="keywords"
        content="portfolio, arya gading, arya gading prinandika, gading, prinandika, gading prinandika,software engineer, laravel, react, golang, web development">
    <meta name="description"
        content="{{ $seo['description'] ?? 'Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development with Laravel, React, and Golang.' }}">

    {{-- Dynamic OpenGraph Meta Tags (SSR) - These are essential for social media crawlers --}}
    <meta property="og:type" content="{{ $seo['type'] ?? 'website' }}">
    <meta property="og:locale" content="en_US">
    <meta property="og:site_name" content="{{ config('app.name', 'Portfolio Gading') }}">
    <meta property="og:title" content="{{ $seo['title'] ?? config('app.name', 'Portfolio Gading') }}">
    <meta property="og:description"
        content="{{ $seo['description'] ?? 'Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development with Laravel, React, and Golang.' }}">
    <meta property="og:image" content="{{ $seo['image'] ?? config('app.url') . '/opengraph.png' }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{{ $seo['url'] ?? url()->current() }}">
    @if(isset($seo['published_time']))
        <meta property="article:published_time" content="{{ $seo['published_time'] }}">
    @endif
    @if(isset($seo['modified_time']))
        <meta property="article:modified_time" content="{{ $seo['modified_time'] }}">
    @endif
    @if(isset($seo['type']) && $seo['type'] === 'article')
        <meta property="article:author" content="Arya Gading Prinandika">
    @endif

    {{-- Twitter Card Meta Tags --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seo['title'] ?? config('app.name', 'Portfolio Gading') }}">
    <meta name="twitter:description"
        content="{{ Str::limit($seo['description'] ?? 'Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development.', 200) }}">
    <meta name="twitter:image" content="{{ $seo['image'] ?? config('app.url') . '/opengraph.png' }}">
    <meta name="twitter:creator" content="@aryagading">

    {{-- JSON-LD Structured Data (server-side for crawlers) --}}
    @if(isset($jsonLd) && !empty($jsonLd))
        @foreach($jsonLd as $schema)
            <script
                type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}</script>
        @endforeach
    @endif

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Loader gate: public pages only, and not for reduced motion. First visit of a session gets the full intro, later hard loads the quick one --}}
    <script>
        (function () {
            try {
                var skip = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    || /^\/(admin|login|register|dashboard|settings|forgot-password|reset-password|verify-email|confirm-password|two-factor-challenge)/.test(location.pathname);
                if (skip) return;
                document.documentElement.classList.add('is-loading');
                if (sessionStorage.getItem('preloaded')) document.documentElement.classList.add('is-quick');
                // failsafe: if the app bundle never mounts (offline, script error) don't leave the page covered
                setTimeout(function () { document.documentElement.classList.remove('is-loading', 'is-quick'); }, 12000);
            } catch (e) { }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(0.985 0.002 90);
        }

        html.dark {
            background-color: oklch(0.15 0.004 285);
        }

        /* Solid cover until the React preloader mounts, so the unstyled page never flashes */
        html.is-loading::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: 99;
            background: oklch(0.58 0.19 40);
        }

        html.dark.is-loading::before {
            background: oklch(0.7 0.19 40);
        }

        /* pulsing dot on the cover while the bundle downloads */
        html.is-loading::after {
            content: '';
            position: fixed;
            top: 50%;
            left: 50%;
            z-index: 99;
            width: 14px;
            height: 14px;
            margin: -7px 0 0 -7px;
            border-radius: 50%;
            background: #0d0d0f;
            animation: coverPulse 1s ease-in-out infinite;
        }

        @keyframes coverPulse {
            50% { transform: scale(2.2); opacity: 0.35; }
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="canonical" href="{{ url()->current() }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,600,700,800|inter:400,500,600|jetbrains-mono:400,500" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>