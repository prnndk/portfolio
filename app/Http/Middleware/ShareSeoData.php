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

        return $next($request);
    }

    /**
     * Get SEO data based on the current route
     */
    private function getSeoDataForRoute(Request $request): array
    {
        $appUrl = config('app.url');
        $defaultSeo = [
            'title' => config('app.name', 'Portfolio Gading'),
            'description' => 'Portfolio of Arya Gading Prinandika - Software Engineer specializing in modern web development with Laravel, React, and Golang.',
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
                $image = $post->featured_image
                    ? "{$appUrl}/storage/{$post->featured_image}"
                    : "{$appUrl}/og/blog/{$slug}";

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

        return $defaultSeo;
    }
}
