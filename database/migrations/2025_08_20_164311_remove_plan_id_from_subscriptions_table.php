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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('status')->default('pending'); // pending, active, completed, canceled
            $table->boolean('is_active')->default(false); // which plan is currently giving features
            $table->boolean('auto_renew')->default(false); // user wants auto renew?
            $table->timestamp('starts_at')->nullable()->change();
            $table->timestamp('ends_at')->nullable()->change();
            $table->string('stripe_subscription_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['status','is_active','auto_renew']);
        });
    }

};
