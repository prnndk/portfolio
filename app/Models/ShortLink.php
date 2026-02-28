<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ShortLink extends Model
{
    protected $fillable = [
        'code',
        'original_url',
        'title',
        'clicks',
        'is_active',
    ];

    protected $casts = [
        'clicks' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Generate a unique short code.
     */
    public static function generateCode(int $length = 6): string
    {
        do {
            $code = Str::random($length);
        } while (self::where('code', $code)->exists());

        return $code;
    }

    /**
     * Increment the click count.
     */
    public function clicks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShortLinkClick::class);
    }

    public function incrementClicks(): void
    {
        $this->increment('clicks');
    }

    /**
     * Get the short URL.
     */
    public function getShortUrlAttribute(): string
    {
        return config('app.url') . '/' . $this->code;
    }
}
