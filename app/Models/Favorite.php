<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Favorite extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'type',
        'description',
        'image',
        'creator',
        'year',
        'genre',
        'content',
        'external_url',
        'rating',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($favorite) {
            if (empty($favorite->slug)) {
                $favorite->slug = Str::slug($favorite->title);
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeMovies($query)
    {
        return $query->where('type', 'movie');
    }

    public function scopeMusic($query)
    {
        return $query->where('type', 'music');
    }

    public function scopeBooks($query)
    {
        return $query->where('type', 'book');
    }

    public function getCreatorLabelAttribute(): string
    {
        return match ($this->type) {
            'movie' => 'Director',
            'music' => 'Artist',
            'book' => 'Author',
            default => 'Creator',
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            'movie' => 'film',
            'music' => 'music',
            'book' => 'book-open',
            default => 'star',
        };
    }
}
