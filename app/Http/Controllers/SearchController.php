<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = trim($request->get('q', ''));

        if ($query === '') {
            return Inertia::render('Public/Search/Index', [
                'query'      => '',
                'posts'      => [],
                'projects'   => [],
                'activities' => [],
                'total'      => 0,
            ]);
        }

        // Limit query length to prevent abuse
        $query = mb_substr($query, 0, 100);

        // Escape LIKE wildcards (% and _) to prevent pattern manipulation
        $escapedQuery = str_replace(['%', '_'], ['\%', '\_'], $query);

        $posts = Post::with('tags')
            ->active()
            ->published()
            ->where(function ($q) use ($escapedQuery) {
                $q->where('title', 'like', "%{$escapedQuery}%")
                    ->orWhere('excerpt', 'like', "%{$escapedQuery}%")
                    ->orWhere('content', 'like', "%{$escapedQuery}%");
            })
            ->orderBy('published_at', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'excerpt', 'published_at', 'featured_image', 'featured_image_url']);

        $projects = Project::active()
            ->where(function ($q) use ($escapedQuery) {
                $q->where('title', 'like', "%{$escapedQuery}%")
                    ->orWhere('description', 'like', "%{$escapedQuery}%");
            })
            ->orderBy('sort_order')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'description', 'image', 'image_url', 'tech_tags']);

        $activities = Activity::active()
            ->where(function ($q) use ($escapedQuery) {
                $q->where('title', 'like', "%{$escapedQuery}%")
                    ->orWhere('description', 'like', "%{$escapedQuery}%")
                    ->orWhere('organization', 'like', "%{$escapedQuery}%")
                    ->orWhere('role', 'like', "%{$escapedQuery}%");
            })
            ->orderBy('sort_order')
            ->limit(10)
            ->get(['id', 'title', 'role', 'organization', 'description', 'start_date', 'end_date']);

        return Inertia::render('Public/Search/Index', [
            'query'      => $query,
            'posts'      => $posts,
            'projects'   => $projects,
            'activities' => $activities,
            'total'      => $posts->count() + $projects->count() + $activities->count(),
        ]);
    }
}
