<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="Arya Gading Prinandika">
    <meta name="keywords"
        content="portfolio, arya gading, arya gading prinandika, gading, prinandika, gading prinandika,software engineer, laravel, react, golang, web development">
    <meta name="description"
        content="{{ $seo['description'] ?? 'Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development with Laravel, React, and Golang.' }}">

    {{-- Dynamic OpenGraph Meta Tags (SSR) - These are essential for social media crawlers --}}
    <meta property="og:type" content="{{ $seo['type'] ?? 'website' }}">
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

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.12 0.04 250);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="canonical" href="{{ url()->current() }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600|space-grotesk:500,600,700" rel="stylesheet" />

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>