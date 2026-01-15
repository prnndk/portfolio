<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
