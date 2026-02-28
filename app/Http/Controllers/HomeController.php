<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Favorite;
use App\Models\Post;
use App\Models\Project;
use App\Models\TechStack;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'projects'   => Project::active()->featured()->ordered()->limit(7)->get(),
            'activities' => Activity::active()->ordered()->limit(5)->get(),
            'posts'      => Post::active()->published()->orderBy('published_at', 'desc')->limit(3)->get(),
            'techStacks' => TechStack::active()->ordered()->get(),
            'favorites'  => Favorite::active()->ordered()->limit(6)->get(),
        ]);
    }
}
