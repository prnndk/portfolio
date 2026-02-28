<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShortLinkClick extends Model
{
    protected $fillable = [
        'short_link_id',
        'referrer',
        'device_type',
        'ip_hash',
    ];

    public function shortLink(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ShortLink::class);
    }
}
