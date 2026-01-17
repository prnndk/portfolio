<?php

namespace App\Http\Controllers;

use App\Models\ShortLink;

class ShortLinkRedirectController extends Controller
{
    public function __invoke(string $code)
    {
        $shortLink = ShortLink::where('code', $code)->active()->first();

        if (!$shortLink) {
            abort(404);
        }

        // Increment click count
        $shortLink->incrementClicks();

        // Redirect to original URL
        return redirect()->away($shortLink->original_url);
    }
}
