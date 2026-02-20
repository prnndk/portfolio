<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Journey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class JourneyController extends Controller
{
    public function index()
    {
        $journeys = Journey::ordered()->get();

        return Inertia::render('Admin/Journeys/Index', [
            'journeys' => $journeys,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Journeys/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'organization' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(['work', 'education', 'achievement', 'other'])],
            'description' => 'nullable|string|max:150',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'logo' => 'nullable|image|max:2048',
            'logo_url' => 'nullable|url|max:500',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url|max:500',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('journeys/logos', 'public');
        }

        // Handle gallery uploads
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('journeys/gallery', 'public');
            }
            $validated['gallery'] = $galleryPaths;
        }

        Journey::create($validated);

        return redirect()->route('admin.journeys.index')
            ->with('success', 'Journey item created successfully.');
    }

    public function edit(Journey $journey)
    {
        return Inertia::render('Admin/Journeys/Edit', [
            'journey' => $journey,
        ]);
    }

    public function update(Request $request, Journey $journey)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'organization' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(['work', 'education', 'achievement', 'other'])],
            'description' => 'nullable|string|max:150',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'logo' => 'nullable|image|max:2048',
            'logo_url' => 'nullable|url|max:500',
            'remove_logo' => 'nullable|boolean',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'gallery_urls' => 'nullable|array',
            'gallery_urls.*' => 'url|max:500',
            'remove_gallery' => 'nullable|array',
            'remove_gallery.*' => 'string',
            'remove_gallery_urls' => 'nullable|array',
            'remove_gallery_urls.*' => 'url',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        // Handle logo removal
        if ($request->boolean('remove_logo')) {
            if ($journey->logo) {
                Storage::disk('public')->delete($journey->logo);
            }
            $validated['logo'] = null;
            $validated['logo_url'] = null;
        }

        // Handle new logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($journey->logo) {
                Storage::disk('public')->delete($journey->logo);
            }
            $validated['logo'] = $request->file('logo')->store('journeys/logos', 'public');
            $validated['logo_url'] = null; // Clear URL if uploading
        }

        // Handle gallery
        $currentGallery = $journey->gallery ?? [];

        // Handle gallery removals
        if ($request->has('remove_gallery')) {
            foreach ($request->input('remove_gallery') as $path) {
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
                $currentGallery[] = $image->store('journeys/gallery', 'public');
            }
        }

        $validated['gallery'] = $currentGallery;

        // Handle gallery URLs
        $currentGalleryUrls = $journey->gallery_urls ?? [];

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

        $journey->update($validated);

        return redirect()->route('admin.journeys.index')
            ->with('success', 'Journey item updated successfully.');
    }

    public function destroy(Journey $journey)
    {
        // Delete logo
        if ($journey->logo) {
            Storage::disk('public')->delete($journey->logo);
        }

        // Delete gallery images
        if ($journey->gallery) {
            foreach ($journey->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $journey->delete();

        return redirect()->route('admin.journeys.index')
            ->with('success', 'Journey item deleted successfully.');
    }
}
