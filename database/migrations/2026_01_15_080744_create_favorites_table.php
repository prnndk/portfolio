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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->enum('type', ['movie', 'music', 'book'])->default('movie');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('creator')->nullable(); // Director, Artist, or Author
            $table->string('year')->nullable();
            $table->string('genre')->nullable();
            $table->text('content')->nullable(); // Extended content/review
            $table->string('external_url')->nullable();
            $table->integer('rating')->nullable(); // 1-10 rating
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
        Schema::dropIfExists('favorites');
    }
};
