<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShareSeoData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $seo = $this->getSeoDataForRoute($request);

        // Share SEO data with all views
        view()->share('seo', $seo);

        // Share JSON-LD structured data
        $jsonLd = $this->getJsonLdForRoute($request, $seo);
        view()->share('jsonLd', $jsonLd);

        return $next($request);
    }

    /**
     * Get SEO data based on the current route
     */
    private function getSeoDataForRoute(Request $request): array
    {
        $appUrl = config('app.url');
        $defaultSeo = [
            'title' => config('app.name', 'Portfolio of Arya Gading Prinandika'),
            'description' => 'Digital Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development with Laravel, React, and Golang.',
            'image' => "{$appUrl}/opengraph.png",
            'url' => $request->url(),
            'type' => 'website',
        ];

        // Match specific routes
        $path = $request->path();

        // Blog post page
        if (preg_match('#^blog/([^/]+)$#', $path, $matches)) {
            $slug = $matches[1];
            $post = \App\Models\Post::where('slug', $slug)
                ->where('status', 'published')
                ->where('is_active', true)
                ->first();

            if ($post) {
                $image = "{$appUrl}/og/blog/{$slug}";

                return [
                    'title' => "{$post->title} | Blog",
                    'description' => $post->excerpt ?: substr(strip_tags($post->content), 0, 160),
                    'image' => $image,
                    'url' => "{$appUrl}/blog/{$slug}",
                    'type' => 'article',
                    'published_time' => $post->published_at?->toIso8601String(),
                    'modified_time' => $post->updated_at?->toIso8601String(),
                ];
            }
        }

        // Project page
        if (preg_match('#^projects/([^/]+)$#', $path, $matches)) {
            $slug = $matches[1];
            $project = \App\Models\Project::where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if ($project) {
                // Handle both uploaded image and external URL
                $image = null;
                if ($project->image) {
                    $image = "{$appUrl}/storage/{$project->image}";
                } elseif ($project->image_url) {
                    $image = $project->image_url;
                } else {
                    $image = "{$appUrl}/og/project/{$slug}";
                }

                return [
                    'title' => "{$project->title} | Projects",
                    'description' => substr(strip_tags($project->description), 0, 160),
                    'image' => $image,
                    'url' => "{$appUrl}/projects/{$slug}",
                    'type' => 'website',
                ];
            }
        }

        // Activities page
        if (preg_match('#^activities/(\d+)$#', $path, $matches)) {
            $id = $matches[1];
            $activity = \App\Models\Activity::where('id', $id)
                ->where('is_active', true)
                ->first();

            if ($activity) {
                return [
                    'title' => "{$activity->title} | Activities",
                    'description' => $activity->description ? substr(strip_tags($activity->description), 0, 160) : $defaultSeo['description'],
                    'image' => $defaultSeo['image'],
                    'url' => "{$appUrl}/activities/{$id}",
                    'type' => 'website',
                ];
            }
        }

        // Blog index
        if ($path === 'blog') {
            return [
                'title' => 'Blog | ' . config('app.name'),
                'description' => 'Read my latest thoughts, tutorials, and insights on software development.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/blog",
                'type' => 'website',
            ];
        }

        // Projects index
        if ($path === 'projects') {
            return [
                'title' => 'Projects | ' . config('app.name'),
                'description' => 'A showcase of my work, side projects, and open source contributions.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/projects",
                'type' => 'website',
            ];
        }

        // Activities index
        if ($path === 'activities') {
            return [
                'title' => 'Activities | ' . config('app.name'),
                'description' => 'My professional experience, education, and activities.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/activities",
                'type' => 'website',
            ];
        }

        // Favorites index
        if ($path === 'favorites') {
            return [
                'title' => 'Favorites | ' . config('app.name'),
                'description' => 'Movies, music, and books that inspire me.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/favorites",
                'type' => 'website',
            ];
        }

        // About page
        if ($path === 'about') {
            return [
                'title' => 'About | ' . config('app.name'),
                'description' => 'Learn more about Arya Gading Prinandika — a software engineer passionate about building scalable ecosystems from code to cloud.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/about",
                'type' => 'profile',
            ];
        }

        // Contact page
        if ($path === 'contact') {
            return [
                'title' => 'Contact | ' . config('app.name'),
                'description' => 'Get in touch with Arya Gading Prinandika. Have a project in mind or just want to chat?',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/contact",
                'type' => 'website',
            ];
        }

        // Tools index
        if ($path === 'tools') {
            return [
                'title' => 'Tools | ' . config('app.name'),
                'description' => 'Free online tools by Arya Gading Prinandika — image compression and more.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/tools",
                'type' => 'website',
            ];
        }

        // Image compress tool
        if ($path === 'tools/image-compress') {
            return [
                'title' => 'Image Compressor | ' . config('app.name'),
                'description' => 'Free online image compression tool. Reduce image file size while maintaining quality.',
                'image' => $defaultSeo['image'],
                'url' => "{$appUrl}/tools/image-compress",
                'type' => 'website',
            ];
        }

        return $defaultSeo;
    }

    /**
     * Get JSON-LD structured data based on the current route
     */
    private function getJsonLdForRoute(Request $request, array $seo): array
    {
        $appUrl = config('app.url');
        $path = $request->path();

        // Default: WebSite + Person schema (for homepage and general pages)
        $defaultJsonLd = [
            [
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => config('app.name', 'Portfolio Arya Gading Prinandika'),
                'url' => $appUrl,
                'description' => $seo['description'],
                'author' => [
                    '@type' => 'Person',
                    'name' => 'Arya Gading Prinandika',
                    'url' => $appUrl,
                ],
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'Person',
                'name' => 'Arya Gading Prinandika',
                'url' => $appUrl,
                'jobTitle' => 'Software Engineer',
                'sameAs' => [
                    'https://github.com/prfrfrn',
                    'https://twitter.com/aryagading',
                ],
            ],
        ];

        // Blog post — BlogPosting schema
        if (preg_match('#^blog/([^/]+)$#', $path, $matches)) {
            $slug = $matches[1];
            $post = \App\Models\Post::where('slug', $slug)
                ->where('status', 'published')
                ->where('is_active', true)
                ->first();

            if ($post) {
                return [
                    [
                        '@context' => 'https://schema.org',
                        '@type' => 'BlogPosting',
                        'headline' => $post->title,
                        'description' => $post->excerpt ?: substr(strip_tags($post->content), 0, 160),
                        'image' => $seo['image'],
                        'datePublished' => $post->published_at?->toIso8601String(),
                        'dateModified' => $post->updated_at?->toIso8601String(),
                        'author' => [
                            '@type' => 'Person',
                            'name' => 'Arya Gading Prinandika',
                            'url' => $appUrl,
                        ],
                        'publisher' => [
                            '@type' => 'Person',
                            'name' => 'Arya Gading Prinandika',
                            'url' => $appUrl,
                        ],
                        'mainEntityOfPage' => [
                            '@type' => 'WebPage',
                            '@id' => "{$appUrl}/blog/{$slug}",
                        ],
                        'wordCount' => str_word_count(strip_tags($post->content)),
                    ]
                ];
            }
        }

        // Project page — CreativeWork schema
        if (preg_match('#^projects/([^/]+)$#', $path, $matches)) {
            $slug = $matches[1];
            $project = \App\Models\Project::where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if ($project) {
                $projectLd = [
                    '@context' => 'https://schema.org',
                    '@type' => 'CreativeWork',
                    'name' => $project->title,
                    'description' => substr(strip_tags($project->description), 0, 300),
                    'image' => $seo['image'],
                    'author' => [
                        '@type' => 'Person',
                        'name' => 'Arya Gading Prinandika',
                        'url' => $appUrl,
                    ],
                    'url' => "{$appUrl}/projects/{$slug}",
                ];

                if ($project->url) {
                    $projectLd['mainEntityOfPage'] = $project->url;
                }
                if ($project->github_url) {
                    $projectLd['codeRepository'] = $project->github_url;
                }
                if ($project->tech_tags) {
                    $projectLd['keywords'] = implode(', ', $project->tech_tags);
                }

                return [$projectLd];
            }
        }

        // Blog index — CollectionPage schema
        if ($path === 'blog') {
            return [
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'CollectionPage',
                    'name' => 'Blog',
                    'description' => $seo['description'],
                    'url' => "{$appUrl}/blog",
                    'isPartOf' => [
                        '@type' => 'WebSite',
                        'name' => config('app.name'),
                        'url' => $appUrl,
                    ],
                ]
            ];
        }

        // Contact — ContactPage schema
        if ($path === 'contact') {
            return [
                [
                    '@context' => 'https://schema.org',
                    '@type' => 'ContactPage',
                    'name' => 'Contact',
                    'description' => $seo['description'],
                    'url' => "{$appUrl}/contact",
                    'isPartOf' => [
                        '@type' => 'WebSite',
                        'name' => config('app.name'),
                        'url' => $appUrl,
                    ],
                ]
            ];
        }

        return $defaultJsonLd;
    }
}
