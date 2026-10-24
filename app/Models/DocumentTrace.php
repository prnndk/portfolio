<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentTrace extends Model
{
    protected $guarded = [];

    protected $hidden = ['auth_hash', 'finalize_token_hash', 'details_ciphertext', 'details_iv'];

    protected function casts(): array
    {
        return [
            'recipient_name' => 'encrypted',
            'details_kdf' => 'array',
            'settings' => 'array',
            'issued_at' => 'datetime',
            'finalized_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function pages(): HasMany
    {
        return $this->hasMany(DocumentTracePage::class)->orderBy('page_no');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }
}
