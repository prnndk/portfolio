<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Journey extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'organization',
        'type',
        'description',
        'skills',
        'logo',
        'logo_url',
        'gallery',
        'gallery_urls',
        'start_date',
        'end_date',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'skills' => 'array',
        'gallery' => 'array',
        'gallery_urls' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['logo_display_url', 'all_gallery_images'];

    /**
     * Get the logo URL for display (either uploaded or external URL)
     */
    public function getLogoDisplayUrlAttribute(): ?string
    {
        if ($this->logo) {
            return Storage::disk('public')->url($this->logo);
        }
        return $this->logo_url;
    }

    /**
     * Get all gallery images combined (uploaded + URLs)
     */
    public function getAllGalleryImagesAttribute(): array
    {
        $images = [];

        // Add uploaded images
        if ($this->gallery) {
            foreach ($this->gallery as $path) {
                $images[] = [
                    'url' => Storage::disk('public')->url($path),
                    'type' => 'uploaded',
                    'path' => $path,
                ];
            }
        }

        // Add URL images
        if ($this->gallery_urls) {
            foreach ($this->gallery_urls as $url) {
                $images[] = [
                    'url' => $url,
                    'type' => 'url',
                    'path' => null,
                ];
            }
        }

        return $images;
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('start_date', 'desc');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get type badge color
     */
    public function getTypeBadgeColorAttribute(): string
    {
        return match ($this->type) {
            'work' => 'blue',
            'education' => 'green',
            'achievement' => 'amber',
            default => 'gray',
        };
    }
}
