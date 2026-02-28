<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('short_link_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('short_link_id')->constrained()->cascadeOnDelete();
            $table->string('referrer', 2048)->nullable();
            $table->string('device_type', 20)->nullable(); // desktop, mobile, tablet
            $table->string('ip_hash', 64)->nullable();     // sha256 of IP for privacy
            $table->timestamps();

            $table->index(['short_link_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('short_link_clicks');
    }
};
