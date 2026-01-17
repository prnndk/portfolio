<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShortLink;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShortLinkController extends Controller
{
    public function index()
    {
        $shortLinks = ShortLink::ordered()->paginate(15);

        return Inertia::render('Admin/ShortLinks/Index', [
            'shortLinks' => $shortLinks,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ShortLinks/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'original_url' => 'required|url|max:2048',
            'title' => 'nullable|string|max:255',
            'code' => 'nullable|string|min:3|max:20|regex:/^[a-zA-Z0-9\-_]+$/|unique:short_links,code',
            'is_active' => 'boolean',
        ], [
            'code.regex' => 'The code may only contain letters, numbers, dashes, and underscores.',
        ]);

        // Generate code if not provided
        $validated['code'] = $validated['code'] ?? ShortLink::generateCode();
        $validated['is_active'] = $validated['is_active'] ?? true;

        ShortLink::create($validated);

        return redirect()->route('admin.short-links.index')
            ->with('success', 'Short link created successfully.');
    }

    public function edit(ShortLink $shortLink)
    {
        return Inertia::render('Admin/ShortLinks/Edit', [
            'shortLink' => $shortLink,
        ]);
    }

    public function update(Request $request, ShortLink $shortLink)
    {
        $validated = $request->validate([
            'original_url' => 'required|url|max:2048',
            'title' => 'nullable|string|max:255',
            'code' => 'nullable|string|min:3|max:20|regex:/^[a-zA-Z0-9\-_]+$/|unique:short_links,code,' . $shortLink->id,
            'is_active' => 'boolean',
        ], [
            'code.regex' => 'The code may only contain letters, numbers, dashes, and underscores.',
        ]);

        $shortLink->update($validated);

        return redirect()->route('admin.short-links.index')
            ->with('success', 'Short link updated successfully.');
    }

    public function destroy(ShortLink $shortLink)
    {
        $shortLink->delete();

        return redirect()->route('admin.short-links.index')
            ->with('success', 'Short link deleted successfully.');
    }
}
