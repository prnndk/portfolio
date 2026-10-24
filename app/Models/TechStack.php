<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TechStack extends Model
{
    protected $fillable = [
        'name',
        'icon',
        'icon_url',
        'color',
        'category',
        'proficiency',
        'sort_order',
        'is_active',
        'show_in_orbit',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_orbit' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Download an external icon_url once and keep it on the public disk, so the
     * site (and its CSP) never has to reach the third-party host again.
     * Returns false and leaves icon_url untouched if the download is unusable.
     */
    public function cacheRemoteIcon(): bool
    {
        $url = $this->icon_url;
        $host = $url ? parse_url($url, PHP_URL_HOST) : null;

        if (! $host || parse_url($url, PHP_URL_SCHEME) !== 'https') {
            return false;
        }

        // Server-side fetch of an admin-supplied URL: refuse anything resolving to a private/loopback address.
        $ip = gethostbyname($host);
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }

        try {
            $response = Http::timeout(10)->withoutRedirecting()->get($url);
        } catch (\Throwable $e) {
            Log::warning("tech icon download failed: {$url}", ['error' => $e->getMessage()]);

            return false;
        }

        $body = $response->body();
        $isSvg = str_contains(substr($body, 0, 2048), '<svg');

        if (! $response->ok() || $body === '' || strlen($body) > 1024 * 1024) {
            return false;
        }

        // /storage is same-origin, so an SVG opened directly could run script: only accept inert ones.
        if ($isSvg && preg_match('/<script|\son\w+\s*=|javascript:|<foreignObject/i', $body)) {
            return false;
        }

        $ext = $isSvg ? 'svg' : strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION));
        if (! in_array($ext, ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico'], true)) {
            return false;
        }

        $path = 'tech-stacks/'.Str::slug($this->name).'-'.substr(md5($url), 0, 8).'.'.$ext;
        Storage::disk('public')->put($path, $body);

        if ($this->icon && $this->icon !== $path) {
            Storage::disk('public')->delete($this->icon);
        }

        $this->update(['icon' => $path, 'icon_url' => null]);

        return true;
    }
}
