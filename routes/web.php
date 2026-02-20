<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\FavoriteController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\TechStackController;
use App\Http\Controllers\Admin\ShortLinkController;
use App\Http\Controllers\Admin\JourneyController;
use App\Models\Activity;
use App\Models\Favorite;
use App\Models\Journey;
use App\Models\Post;
use App\Models\Project;
use App\Models\TechStack;
use App\Models\ShortLink;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ContactController;
use App\Http\Controllers\OpenGraphController;
use App\Http\Controllers\ShortLinkRedirectController;

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

Route::get('/about', function () {
    return Inertia::render('Public/About/Index', [
        'journeys' => Journey::active()->ordered()->get(),
    ]);
})->name('about');

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

Route::get('/contact', function () {
    return Inertia::render('Public/Contact/Index');
})->name('contact.index');

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1') // 5 requests per minute
    ->name('contact.store');

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

// Tools Routes
Route::get('/tools', function () {
    return Inertia::render('Public/Tools/Index');
})->name('tools.index');

Route::get('/tools/image-compress', function () {
    return Inertia::render('Public/Tools/ImageCompress');
})->name('tools.image-compress');


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
                'journeys' => [
                    'total' => Journey::count(),
                    'active' => Journey::active()->count(),
                ],
                'favorites' => [
                    'total' => Favorite::count(),
                    'active' => Favorite::active()->count(),
                ],
                'shortLinks' => [
                    'total' => ShortLink::count(),
                    'active' => ShortLink::active()->count(),
                    'clicks' => ShortLink::sum('clicks'),
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
        Route::resource('journeys', JourneyController::class)->except(['show']);
        Route::resource('contacts', ContactController::class)->only(['index', 'show', 'destroy']);
        Route::resource('short-links', ShortLinkController::class)->except(['show']);

        // Image upload for blog posts
        Route::post('upload/image', [App\Http\Controllers\Admin\UploadController::class, 'uploadImage'])->name('upload.image');
        Route::delete('upload/image', [App\Http\Controllers\Admin\UploadController::class, 'deleteImage'])->name('upload.image.delete');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Short link redirect - MUST be at the very end to not conflict with other routes
Route::get('/{code}', ShortLinkRedirectController::class)
    ->where('code', '[a-zA-Z0-9\-_]+')
    ->name('short-link.redirect');
