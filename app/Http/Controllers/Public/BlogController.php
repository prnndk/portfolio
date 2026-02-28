<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $tag   = $request->get('tag');
        $query = Post::with('tags')->active()->published();

        if ($tag) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $tag));
        }

        return Inertia::render('Public/Blog/Index', [
            'posts'     => $query->orderBy('published_at', 'desc')->paginate(10)->withQueryString(),
            'tags'      => Tag::orderBy('name')
                ->withCount(['posts' => fn($q) => $q->active()->published()])
                ->get()
                ->filter(fn($t) => $t->posts_count > 0)
                ->values(),
            'activeTag' => $tag,
        ]);
    }

    public function show(Request $request, Post $post): Response
    {
        if ($post->status !== 'published' || ! $post->is_active) {
            abort(404);
        }

        $this->recordView($request, $post);

        $post->load('tags');

        return Inertia::render('Public/Blog/Show', [
            'post'         => $post,
            'relatedPosts' => $this->getRelatedPosts($post),
        ]);
    }

    /**
     * Increment the view counter at most once per IP per post per 24 hours.
     * Prevents inflation from bots and page refreshes.
     */
    private function recordView(Request $request, Post $post): void
    {
        $key = 'post_view_' . $post->id . '_' . sha1($request->ip() ?? '');

        if (! Cache::has($key)) {
            Cache::put($key, true, now()->addHours(24));
            $post->incrementViewCount();
        }
    }

    /**
     * Return up to 4 posts sharing at least one tag with $post,
     * padded with the most-recent posts when fewer than 2 matches are found.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    private function getRelatedPosts(Post $post)
    {
        $tagIds = $post->tags->pluck('id');

        $related = Post::with('tags')
            ->active()
            ->published()
            ->where('id', '!=', $post->id)
            ->when(
                $tagIds->isNotEmpty(),
                fn($q) => $q->whereHas('tags', fn($tq) => $tq->whereIn('tags.id', $tagIds)),
            )
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();

        if ($related->count() < 2) {
            $existingIds = $related->pluck('id')->push($post->id);

            $extra = Post::with('tags')
                ->active()
                ->published()
                ->whereNotIn('id', $existingIds)
                ->orderBy('published_at', 'desc')
                ->limit(4 - $related->count())
                ->get();

            $related = $related->concat($extra);
        }

        return $related;
    }
}
