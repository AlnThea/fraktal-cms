<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('users_id'); // Menambahkan kolom users_id
            $table->foreign('users_id')->references('id')->on('users')->onDelete('cascade'); // Relasi ke tabel users
            $table->string('title');
            $table->string('status')->default('draft');
            $table->enum('type_post', ['post', 'pages'])->default('post');
            $table->json('content')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
