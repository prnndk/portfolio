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
        Schema::create('tech_stacks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable(); // SVG icon path or uploaded image
            $table->string('icon_url')->nullable(); // External icon URL (e.g., from Simple Icons CDN)
            $table->string('color')->nullable(); // Brand color hex code
            $table->string('category')->nullable(); // e.g., Frontend, Backend, Database, DevOps
            $table->string('proficiency')->nullable(); // e.g., Expert, Advanced, Intermediate
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
        Schema::dropIfExists('tech_stacks');
    }
};
