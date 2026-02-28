<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::ordered()->paginate(7);

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url|max:500',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url|max:500',
            'tech_tags' => 'nullable|array',
            'url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $baseSlug          = Str::slug($validated['title']);
        $slug              = $baseSlug;
        $counter           = 1;
        while (Project::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('projects', 'public');
            }
            $validated['gallery'] = $galleryPaths;
        }

        Project::create($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    public function edit(Project $project)
    {
        return Inertia::render('Admin/Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url|max:500',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url|max:500',
            'remove_gallery' => 'nullable|array',
            'remove_gallery.*' => 'string',
            'remove_gallery_urls' => 'nullable|array',
            'remove_gallery_urls.*' => 'url',
            'tech_tags' => 'nullable|array',
            'url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'featured' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $baseSlug          = Str::slug($validated['title']);
        $slug              = $baseSlug;
        $counter           = 1;
        while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        // Handle image file upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
            // Clear image_url if uploading a file
            $validated['image_url'] = null;
        } else {
            unset($validated['image']);
            // If image_url is provided, clear the uploaded image
            if ($request->filled('image_url') && $project->image) {
                Storage::disk('public')->delete($project->image);
                $validated['image'] = null;
            }
        }

        // Handle uploaded gallery
        $currentGallery = $project->gallery ?? [];

        // Handle gallery removals (uploaded files)
        if ($request->has('remove_gallery')) {
            foreach ($request->input('remove_gallery') as $path) {
                // Security: only allow deleting files inside projects/ and reject traversal
                if (
                    !is_string($path) ||
                    !str_starts_with($path, 'projects/') ||
                    str_contains($path, '..') ||
                    str_contains($path, '//')
                ) {
                    continue;
                }

                if (($key = array_search($path, $currentGallery)) !== false) {
                    unset($currentGallery[$key]);
                    Storage::disk('public')->delete($path);
                }
            }
            $currentGallery = array_values($currentGallery);
        }

        // Handle new gallery uploads (Append)
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                $currentGallery[] = $image->store('projects', 'public');
            }
        }

        $validated['gallery'] = $currentGallery;

        // Handle gallery URLs
        $currentGalleryUrls = $project->gallery_urls ?? [];

        // Handle gallery URL removals
        if ($request->has('remove_gallery_urls')) {
            foreach ($request->input('remove_gallery_urls') as $url) {
                if (($key = array_search($url, $currentGalleryUrls)) !== false) {
                    unset($currentGalleryUrls[$key]);
                }
            }
            $currentGalleryUrls = array_values($currentGalleryUrls);
        }

        // Handle new gallery URLs (Append)
        if ($request->has('gallery_urls') && is_array($request->input('gallery_urls'))) {
            $currentGalleryUrls = array_merge($currentGalleryUrls, $request->input('gallery_urls'));
            $currentGalleryUrls = array_unique($currentGalleryUrls);
            $currentGalleryUrls = array_values($currentGalleryUrls);
        }

        $validated['gallery_urls'] = $currentGalleryUrls;

        $project->update($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }

        if ($project->gallery) {
            foreach ($project->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}
