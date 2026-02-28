<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with('tags')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Posts/Create', [
            'availableTags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'content'            => 'required|string',
            'excerpt'            => 'nullable|string|max:500',
            'featured_image'     => 'nullable|image|max:2048',
            'featured_image_url' => 'nullable|url|max:2048',
            'image_source'       => 'required|in:upload,url',
            'status'             => 'required|in:draft,published,archived',
            'published_at'       => 'nullable|date',
            'is_active'          => 'boolean',
            'tags'               => 'nullable|array',
            'tags.*'             => 'integer|exists:tags,id',
            'new_tags'           => 'nullable|array',
            'new_tags.*'         => 'string|max:50',
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug     = $baseSlug;
        $counter  = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        if ($validated['image_source'] === 'upload' && $request->hasFile('featured_image')) {
            $file     = $request->file('featured_image');
            $filename = 'posts/' . Str::uuid() . '.webp';
            $encoded  = Image::read($file->getPathname())
                ->scaleDown(width: 1200)
                ->toWebp(quality: 85);
            Storage::disk('public')->put($filename, $encoded);
            $validated['featured_image']     = $filename;
            $validated['featured_image_url'] = null;
        } elseif ($validated['image_source'] === 'url' && ! empty($validated['featured_image_url'])) {
            $validated['featured_image'] = null;
        } else {
            $validated['featured_image']     = null;
            $validated['featured_image_url'] = null;
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $tagIds  = $validated['tags'] ?? [];
        $newTags = $validated['new_tags'] ?? [];
        unset($validated['image_source'], $validated['tags'], $validated['new_tags']);

        $post = Post::create($validated);
        $this->syncTags($post, $tagIds, $newTags);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post created successfully.');
    }

    public function show(Post $post)
    {
        return redirect()->route('admin.posts.edit', $post);
    }

    public function edit(Post $post)
    {
        return Inertia::render('Admin/Posts/Edit', [
            'post'          => $post->load('tags'),
            'availableTags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'content'            => 'required|string',
            'excerpt'            => 'nullable|string|max:500',
            'featured_image'     => 'nullable|image|max:2048',
            'featured_image_url' => 'nullable|url|max:2048',
            'image_source'       => 'required|in:upload,url',
            'status'             => 'required|in:draft,published,archived',
            'published_at'       => 'nullable|date',
            'is_active'          => 'boolean',
            'tags'               => 'nullable|array',
            'tags.*'             => 'integer|exists:tags,id',
            'new_tags'           => 'nullable|array',
            'new_tags.*'         => 'string|max:50',
        ]);

        if ($validated['image_source'] === 'upload' && $request->hasFile('featured_image')) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $file     = $request->file('featured_image');
            $filename = 'posts/' . Str::uuid() . '.webp';
            $encoded  = Image::read($file->getPathname())
                ->scaleDown(width: 1200)
                ->toWebp(quality: 85);
            Storage::disk('public')->put($filename, $encoded);
            $validated['featured_image']     = $filename;
            $validated['featured_image_url'] = null;
        } elseif ($validated['image_source'] === 'url' && ! empty($validated['featured_image_url'])) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $validated['featured_image'] = null;
        } else {
            unset($validated['featured_image'], $validated['featured_image_url']);
        }

        if ($validated['status'] === 'published' && empty($validated['published_at']) && empty($post->published_at)) {
            $validated['published_at'] = now();
        }

        $tagIds  = $validated['tags'] ?? [];
        $newTags = $validated['new_tags'] ?? [];
        unset($validated['image_source'], $validated['tags'], $validated['new_tags']);

        // Re-generate slug on title change, keeping it unique among other posts.
        $baseSlug = Str::slug($validated['title']);
        $slug     = $baseSlug;
        $counter  = 1;
        while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        $post->update($validated);
        $this->syncTags($post, $tagIds, $newTags);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post updated successfully.');
    }

    public function destroy(Post $post)
    {
        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }

        $post->delete();

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post deleted successfully.');
    }

    /**
     * Resolve existing tag IDs and create new tags by name, then sync.
     *
     * @param  array<int|string> $existingTagIds
     * @param  array<string>     $newTagNames
     */
    private function syncTags(Post $post, array $existingTagIds, array $newTagNames): void
    {
        $ids = array_filter(array_map('intval', $existingTagIds));

        foreach ($newTagNames as $name) {
            $name = trim($name);
            if ($name === '') {
                continue;
            }
            $tag   = Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
            $ids[] = $tag->id;
        }

        $post->tags()->sync(array_unique($ids));
    }
}
