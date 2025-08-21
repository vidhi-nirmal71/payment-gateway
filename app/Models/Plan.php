<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'name',
        'description',
        'price',
        'discounted_price',
        'interval',
        'currency',
        'stripe_price_id'
    ];

    public function subscriptions()
    {
        return $this->belongsToMany(Subscription::class, 'plan_subscription')
                    ->withTimestamps();
    }

    public function displayPrice(): string {
        return number_format($this->discounted_price ?? $this->price, 2);
    }
}
