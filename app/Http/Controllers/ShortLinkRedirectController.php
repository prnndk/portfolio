<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;
use App\Models\ShortLinkClick;
use Illuminate\Http\Request;

class ShortLinkRedirectController extends Controller
{
    public function __invoke(Request $request, string $code)
    {
        $shortLink = ShortLink::where('code', $code)->active()->first();

        if (!$shortLink) {
            abort(404);
        }

        // Increment legacy aggregate counter
        $shortLink->incrementClicks();

        // Log time-series click with metadata
        // Salt the IP hash with APP_KEY to prevent rainbow-table reversal
        // (only ~4 billion IPv4 addresses makes unsalted SHA-256 trivially reversible)
        ShortLinkClick::create([
            'short_link_id' => $shortLink->id,
            'referrer'      => substr($request->headers->get('referer', ''), 0, 2048) ?: null,
            'device_type'   => $this->resolveDeviceType($request->userAgent() ?? ''),
            'ip_hash'       => $request->ip()
                ? hash_hmac('sha256', $request->ip(), config('app.key'))
                : null,
        ]);

        return redirect()->away($shortLink->original_url);
    }

    private function resolveDeviceType(string $userAgent): string
    {
        $ua = strtolower($userAgent);

        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            return 'tablet';
        }

        if (
            str_contains($ua, 'mobile') ||
            str_contains($ua, 'android') ||
            str_contains($ua, 'iphone') ||
            str_contains($ua, 'ipod')
        ) {
            return 'mobile';
        }

        return 'desktop';
    }
}
