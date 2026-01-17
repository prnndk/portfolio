<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Posts/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'featured_image_url' => 'nullable|url|max:2048',
            'image_source' => 'required|in:upload,url',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Handle featured image based on source type
        if ($validated['image_source'] === 'upload' && $request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('posts', 'public');
            $validated['featured_image_url'] = null;
        } elseif ($validated['image_source'] === 'url' && !empty($validated['featured_image_url'])) {
            // Validate URL is from allowed domains or is a valid image URL
            $validated['featured_image'] = null;
            // featured_image_url is already set
        } else {
            $validated['featured_image'] = null;
            $validated['featured_image_url'] = null;
        }

        // Remove image_source from validated data before creating
        unset($validated['image_source']);

        // Auto-set published_at if status is published and not set
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        Post::create($validated);

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post created successfully.');
    }

    public function edit(Post $post)
    {
        return Inertia::render('Admin/Posts/Edit', [
            'post' => $post,
        ]);
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'featured_image_url' => 'nullable|url|max:2048',
            'image_source' => 'required|in:upload,url',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        // Handle featured image based on source type
        if ($validated['image_source'] === 'upload' && $request->hasFile('featured_image')) {
            // Delete old uploaded image if exists
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('posts', 'public');
            $validated['featured_image_url'] = null;
        } elseif ($validated['image_source'] === 'url' && !empty($validated['featured_image_url'])) {
            // Using external URL, clear uploaded image if any
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $validated['featured_image'] = null;
            // featured_image_url is already set
        } else {
            // Keep existing images if no new one is provided
            unset($validated['featured_image']);
            unset($validated['featured_image_url']);
        }

        // Remove image_source from validated data before updating
        unset($validated['image_source']);

        // Auto-set published_at if status is published and not set
        if ($validated['status'] === 'published' && empty($validated['published_at']) && empty($post->published_at)) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

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
}
