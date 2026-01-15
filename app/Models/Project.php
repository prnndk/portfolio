<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'image_url',
        'gallery',
        'gallery_urls',
        'tech_tags',
        'url',
        'github_url',
        'featured',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'gallery' => 'array',
        'gallery_urls' => 'array',
        'tech_tags' => 'array',
        'featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the display image URL (prefers uploaded file, falls back to external URL)
     */
    public function getDisplayImageAttribute(): ?string
    {
        if ($this->image) {
            return "/storage/{$this->image}";
        }
        return $this->image_url;
    }

    /**
     * Get all gallery images (combines uploaded files and external URLs)
     */
    public function getAllGalleryAttribute(): array
    {
        $gallery = [];

        if ($this->gallery) {
            foreach ($this->gallery as $img) {
                $gallery[] = "/storage/{$img}";
            }
        }

        if ($this->gallery_urls) {
            $gallery = array_merge($gallery, $this->gallery_urls);
        }

        return $gallery;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title);
            }
        });
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
