<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TechStack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TechStackController extends Controller
{
    public function index()
    {
        $techStacks = TechStack::ordered()->get();

        return Inertia::render('Admin/TechStacks/Index', [
            'techStacks' => $techStacks,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TechStacks/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image|max:1024',
            'icon_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7',
            'category' => 'nullable|string|max:255',
            'proficiency' => 'nullable|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')->store('tech-stacks', 'public');
        }

        TechStack::create($validated);

        return redirect()->route('admin.tech-stacks.index')
            ->with('success', 'Tech stack added successfully.');
    }

    public function edit(TechStack $techStack)
    {
        return Inertia::render('Admin/TechStacks/Edit', [
            'techStack' => $techStack,
        ]);
    }

    public function update(Request $request, TechStack $techStack)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|image|max:1024',
            'icon_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7',
            'category' => 'nullable|string|max:255',
            'proficiency' => 'nullable|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('icon')) {
            if ($techStack->icon) {
                Storage::disk('public')->delete($techStack->icon);
            }
            $validated['icon'] = $request->file('icon')->store('tech-stacks', 'public');
        }

        $techStack->update($validated);

        return redirect()->route('admin.tech-stacks.index')
            ->with('success', 'Tech stack updated successfully.');
    }

    public function destroy(TechStack $techStack)
    {
        if ($techStack->icon) {
            Storage::disk('public')->delete($techStack->icon);
        }

        $techStack->delete();

        return redirect()->route('admin.tech-stacks.index')
            ->with('success', 'Tech stack deleted successfully.');
    }
}
