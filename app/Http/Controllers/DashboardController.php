<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Contact;
use App\Models\Favorite;
use App\Models\Journey;
use App\Models\Post;
use App\Models\Project;
use App\Models\ShortLink;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats'       => $this->buildStats(),
            'recentPosts' => Post::orderBy('created_at', 'desc')->limit(5)->get(),
        ]);
    }

    private function buildStats(): array
    {
        return [
            'projects' => [
                'total'  => Project::count(),
                'active' => Project::active()->count(),
            ],
            'posts' => [
                'total'      => Post::count(),
                'active'     => Post::active()->count(),
                'published'  => Post::active()->published()->count(),
                'totalViews' => Post::sum('view_count'),
            ],
            'activities' => [
                'total'  => Activity::count(),
                'active' => Activity::active()->count(),
            ],
            'journeys' => [
                'total'  => Journey::count(),
                'active' => Journey::active()->count(),
            ],
            'favorites' => [
                'total'  => Favorite::count(),
                'active' => Favorite::active()->count(),
            ],
            'shortLinks' => [
                'total'  => ShortLink::count(),
                'active' => ShortLink::active()->count(),
                'clicks' => ShortLink::sum('clicks'),
            ],
            'contacts' => [
                'total'  => Contact::count(),
                'unread' => Contact::where('status', 'new')->count(),
            ],
        ];
    }
}
