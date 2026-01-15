<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type');

        $query = Favorite::ordered();

        if ($type && in_array($type, ['movie', 'music', 'book'])) {
            $query->ofType($type);
        }

        $favorites = $query->paginate(9);

        return Inertia::render('Admin/Favorites/Index', [
            'favorites' => $favorites,
            'currentType' => $type,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Favorites/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:movie,music,book',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'creator' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'genre' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'external_url' => 'nullable|url|max:255',
            'rating' => 'nullable|integer|min:1|max:10',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('favorites', 'public');
        }

        Favorite::create($validated);

        return redirect()->route('admin.favorites.index')
            ->with('success', 'Favorite created successfully.');
    }

    public function edit(Favorite $favorite)
    {
        return Inertia::render('Admin/Favorites/Edit', [
            'favorite' => $favorite,
        ]);
    }

    public function update(Request $request, Favorite $favorite)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:movie,music,book',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'creator' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'genre' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'external_url' => 'nullable|url|max:255',
            'rating' => 'nullable|integer|min:1|max:10',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($favorite->image) {
                Storage::disk('public')->delete($favorite->image);
            }
            $validated['image'] = $request->file('image')->store('favorites', 'public');
        } else {
            unset($validated['image']);
        }

        $favorite->update($validated);

        return redirect()->route('admin.favorites.index')
            ->with('success', 'Favorite updated successfully.');
    }

    public function destroy(Favorite $favorite)
    {
        if ($favorite->image) {
            Storage::disk('public')->delete($favorite->image);
        }

        $favorite->delete();

        return redirect()->route('admin.favorites.index')
            ->with('success', 'Favorite deleted successfully.');
    }
}
