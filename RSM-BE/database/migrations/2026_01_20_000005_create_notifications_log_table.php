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
        Schema::create('notifications_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('channel');
            $table->json('payload');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['queued', 'sent', 'failed']);
            $table->text('error')->nullable();
            $table->timestamp('created_at');

            // Indexes for common queries
            $table->index('work_order_id');
            $table->index('customer_id');
            $table->index('status');
            $table->index('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications_log');
    }
};
