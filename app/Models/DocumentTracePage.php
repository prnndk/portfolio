<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentTracePage extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function trace()
    {
        return $this->belongsTo(DocumentTrace::class, 'document_trace_id');
    }
}
