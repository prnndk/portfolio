<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::ordered()->get();

        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Activities/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'organization' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        // Handle gallery uploads
        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('activities', 'public');
            }
            $validated['gallery'] = $galleryPaths;
        }

        Activity::create($validated);

        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity created successfully.');
    }

    public function edit(Activity $activity)
    {
        return Inertia::render('Admin/Activities/Edit', [
            'activity' => $activity,
        ]);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'organization' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|max:2048',
            'remove_gallery' => 'nullable|array',
            'remove_gallery.*' => 'string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $currentGallery = $activity->gallery ?? [];

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
                $currentGallery[] = $image->store('activities', 'public');
            }
        }

        $validated['gallery'] = $currentGallery;

        $activity->update($validated);

        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity updated successfully.');
    }

    public function destroy(Activity $activity)
    {
        if ($activity->gallery) {
            foreach ($activity->gallery as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $activity->delete();

        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity deleted successfully.');
    }
}
