<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShortLink;
use App\Models\ShortLinkClick;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ShortLinkController extends Controller
{
    public function index()
    {
        $shortLinks = ShortLink::ordered()->paginate(15);

        // Per-link clicks in last 30 days
        $linkIds = $shortLinks->pluck('id');

        $clicks30d = ShortLinkClick::whereIn('short_link_id', $linkIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->select('short_link_id', DB::raw('count(*) as count'))
            ->groupBy('short_link_id')
            ->pluck('count', 'short_link_id');

        // Device breakdown (aggregate across all links in last 30 days)
        $deviceBreakdown = ShortLinkClick::whereIn('short_link_id', $linkIds)
            ->where('created_at', '>=', now()->subDays(30))
            ->select('device_type', DB::raw('count(*) as count'))
            ->groupBy('device_type')
            ->pluck('count', 'device_type');

        // Daily time-series for last 30 days (totals across all short links)
        $dailyClicks = ShortLinkClick::whereIn('short_link_id', $linkIds)
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        // Fill in zeros for missing days
        $timeline = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $timeline[] = ['date' => $date, 'clicks' => (int) ($dailyClicks[$date] ?? 0)];
        }

        return Inertia::render('Admin/ShortLinks/Index', [
            'shortLinks'     => $shortLinks,
            'clicks30d'      => $clicks30d,
            'deviceBreakdown' => $deviceBreakdown,
            'clicksTimeline' => $timeline,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ShortLinks/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'original_url' => ['required', 'url:http,https', 'max:2048'],
            // note: url:http,https ensures only safe schemes are stored;
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
            'original_url' => ['required', 'url:http,https', 'max:2048'],
            // note: url:http,https ensures only safe schemes are stored;
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
