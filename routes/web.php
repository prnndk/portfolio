<?php

use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\FavoriteController as AdminFavoriteController;
use App\Http\Controllers\Admin\JourneyController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\ShortLinkController;
use App\Http\Controllers\Admin\TechStackController;
use App\Http\Controllers\Admin\UploadController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OpenGraphController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\ActivityController;
use App\Http\Controllers\Public\BlogController;
use App\Http\Controllers\Public\FavoriteController;
use App\Http\Controllers\Public\ProjectController;
use App\Http\Controllers\Public\ToolsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShortLinkRedirectController;
use Illuminate\Support\Facades\Route;

// ── OpenGraph Image Generation ────────────────────────────────────────────────
Route::prefix('og')->name('og.')->group(function () {
    Route::get('/blog/{slug}',    [OpenGraphController::class, 'blog'])->name('blog');
    Route::get('/project/{slug}', [OpenGraphController::class, 'project'])->name('project');
    Route::get('/generate',       [OpenGraphController::class, 'generate'])
        ->middleware('throttle:20,1')
        ->name('generate');
});

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/',         HomeController::class)->name('home');
Route::get('/about',    AboutController::class)->name('about');
Route::get('/contact',  [ContactController::class, 'create'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');

Route::prefix('projects')->name('projects.')->group(function () {
    Route::get('/',               [ProjectController::class, 'index'])->name('index');
    Route::get('/{project:slug}', [ProjectController::class, 'show'])->name('show');
});

Route::prefix('activities')->name('activities.')->group(function () {
    Route::get('/',           [ActivityController::class, 'index'])->name('index');
    Route::get('/{activity}', [ActivityController::class, 'show'])->name('show');
});

Route::prefix('blog')->name('blog.')->group(function () {
    Route::get('/',            [BlogController::class, 'index'])->name('index');
    Route::get('/{post:slug}', [BlogController::class, 'show'])->name('show');
});

Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');

Route::get('/search', SearchController::class)
    ->middleware('throttle:30,1')
    ->name('search');

Route::prefix('tools')->name('tools.')->group(function () {
    Route::get('/',               [ToolsController::class, 'index'])->name('index');
    Route::get('/image-compress', [ToolsController::class, 'imageCompress'])->name('image-compress');
    Route::get('/jpg-to-pdf',     [ToolsController::class, 'jpgToPdf'])->name('jpg-to-pdf');
    Route::get('/pdf-merge',      [ToolsController::class, 'pdfMerge'])->name('pdf-merge');
    Route::get('/pdf-split',      [ToolsController::class, 'pdfSplit'])->name('pdf-split');
    Route::get('/pdf-to-images',  [ToolsController::class, 'pdfToImages'])->name('pdf-to-images');
    Route::get('/pdf-compress',   [ToolsController::class, 'pdfCompress'])->name('pdf-compress');
    Route::get('/pdf-rotate',     [ToolsController::class, 'pdfRotate'])->name('pdf-rotate');
});

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('projects',    AdminProjectController::class)->except(['show']);
        Route::resource('activities',  AdminActivityController::class)->except(['show']);
        Route::resource('posts',       AdminPostController::class);
        Route::resource('tech-stacks', TechStackController::class);
        Route::resource('favorites',   AdminFavoriteController::class)->except(['show']);
        Route::resource('journeys',    JourneyController::class)->except(['show']);
        Route::resource('contacts',    ContactController::class)->only(['index', 'show', 'destroy']);
        Route::resource('short-links', ShortLinkController::class)->except(['show']);

        Route::prefix('upload')->name('upload.')->group(function () {
            Route::post('image',   [UploadController::class, 'uploadImage'])->name('image');
            Route::delete('image', [UploadController::class, 'deleteImage'])->name('image.delete');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// ── Short-link redirect ───────────────────────────────────────────────────────
// Must be last — catches any single-segment path not matched above.
Route::get('/{code}', ShortLinkRedirectController::class)
    ->where('code', '[a-zA-Z0-9\-_]+')
    ->name('short-link.redirect');
