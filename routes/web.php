<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\FavoriteController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TechStackController;
use App\Models\Activity;
use App\Models\Favorite;
use App\Models\Post;
use App\Models\Project;
use App\Models\TechStack;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ContactController;
use App\Http\Controllers\OpenGraphController;

// OpenGraph Image Generation Routes
Route::get('/og/blog/{slug}', [OpenGraphController::class, 'blog'])->name('og.blog');
Route::get('/og/project/{slug}', [OpenGraphController::class, 'project'])->name('og.project');
Route::get('/og/generate', [OpenGraphController::class, 'generate'])->name('og.generate');

// Public Routes
Route::get('/', function () {
    return Inertia::render('welcome', [
        'projects' => Project::active()->featured()->ordered()->limit(7)->get(),
        'activities' => Activity::active()->ordered()->limit(5)->get(),
        'posts' => Post::active()->published()->orderBy('published_at', 'desc')->limit(3)->get(),
        'techStacks' => TechStack::active()->ordered()->get(),
        'favorites' => Favorite::active()->ordered()->limit(6)->get(),
    ]);
})->name('home');

Route::get('/projects', function () {
    return Inertia::render('Public/Projects/Index', [
        'projects' => Project::active()->ordered()->paginate(9),
    ]);
})->name('projects.index');

Route::get('/activities', function () {
    return Inertia::render('Public/Activities/Index', [
        'activities' => Activity::active()->ordered()->paginate(10),
    ]);
})->name('activities.index');

Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/projects/{project:slug}', function (Project $project) {
    if (!$project->is_active) {
        abort(404);
    }
    return Inertia::render('Public/Projects/Show', [
        'project' => $project,
    ]);
})->name('projects.show');

Route::get('/activities/{activity}', function (Activity $activity) {
    if (!$activity->is_active) {
        abort(404);
    }
    return Inertia::render('Public/Activities/Show', [
        'activity' => $activity,
    ]);
})->name('activities.show');

Route::get('/blog', function () {
    return Inertia::render('Public/Blog/Index', [
        'posts' => Post::active()->published()->orderBy('published_at', 'desc')->paginate(10),
    ]);
})->name('blog.index');

Route::get('/blog/{post:slug}', function (Post $post) {
    if ($post->status !== 'published' || !$post->is_active) {
        abort(404);
    }

    // Get related posts (other published posts, excluding current)
    $relatedPosts = Post::active()
        ->published()
        ->where('id', '!=', $post->id)
        ->orderBy('published_at', 'desc')
        ->limit(4)
        ->get();

    return Inertia::render('Public/Blog/Show', [
        'post' => $post,
        'relatedPosts' => $relatedPosts,
    ]);
})->name('blog.show');

Route::get('/favorites', function (\Illuminate\Http\Request $request) {
    $type = $request->get('type');

    $query = Favorite::active()->ordered();

    if ($type && in_array($type, ['movie', 'music', 'book'])) {
        $query->ofType($type);
    }

    return Inertia::render('Public/Favorites/Index', [
        'favorites' => $query->paginate(12),
        'currentType' => $type,
    ]);
})->name('favorites.index');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'projects' => [
                    'total' => Project::count(),
                    'active' => Project::active()->count(),
                ],
                'posts' => [
                    'total' => Post::count(),
                    'active' => Post::active()->count(),
                    'published' => Post::active()->published()->count(),
                ],
                'activities' => [
                    'total' => Activity::count(),
                    'active' => Activity::active()->count(),
                ],
                'favorites' => [
                    'total' => Favorite::count(),
                    'active' => Favorite::active()->count(),
                ],
            ],
            'recentPosts' => Post::orderBy('created_at', 'desc')->limit(5)->get(),
        ]);
    })->name('dashboard');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('projects', ProjectController::class)->except(['show']);
        Route::resource('activities', ActivityController::class)->except(['show']);
        Route::resource('posts', PostController::class);
        Route::resource('tech-stacks', TechStackController::class);
        Route::resource('favorites', FavoriteController::class)->except(['show']);
        Route::resource('contacts', ContactController::class)->only(['index', 'show', 'destroy']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
