<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('journeys', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('organization')->nullable();
            $table->enum('type', ['work', 'education', 'achievement', 'other'])->default('other');
            $table->text('description')->nullable();
            $table->json('skills')->nullable();
            $table->string('logo')->nullable();
            $table->string('logo_url')->nullable();
            $table->json('gallery')->nullable();
            $table->json('gallery_urls')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journeys');
    }
};
