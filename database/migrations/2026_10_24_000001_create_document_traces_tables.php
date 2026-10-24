<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_traces', function (Blueprint $table) {
            $table->id();
            $table->char('code', 10)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 5); // pdf | image
            $table->string('mode', 7); // visible | hidden | both
            $table->text('recipient_name'); // encrypted cast
            $table->string('issuer_name', 120)->nullable();
            // Zero-knowledge details: encrypted in the browser with a key derived from the creator's passphrase.
            $table->text('details_ciphertext')->nullable();
            $table->string('details_iv', 24)->nullable();
            $table->string('details_salt', 24);
            $table->json('details_kdf');
            $table->string('auth_hash'); // password_hash(authKey), never the passphrase itself
            $table->unsignedSmallInteger('page_count');
            $table->char('sha256', 64)->nullable()->index();
            $table->text('seal')->nullable();
            $table->unsignedTinyInteger('key_version');
            $table->json('settings');
            $table->char('finalize_token_hash', 64)->nullable();
            $table->timestamp('issued_at');
            $table->timestamp('finalized_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('document_trace_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_trace_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('page_no');
            $table->char('page_code', 8)->index();
            $table->char('phash', 16)->nullable();

            $table->unique(['document_trace_id', 'page_no']);
        });

        Schema::create('document_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_trace_id')->nullable()->constrained()->nullOnDelete();
            $table->string('result', 10); // authentic | modified | revoked | unknown
            $table->string('matched_by', 10)->nullable(); // sha256 | page_code | code | phash
            $table->char('ip_hash', 64)->nullable(); // salted sha256, never the raw IP
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_verifications');
        Schema::dropIfExists('document_trace_pages');
        Schema::dropIfExists('document_traces');
    }
};
