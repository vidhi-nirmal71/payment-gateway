<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;
class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_subscription_id',
        'starts_at',
        'ends_at',
        'status',
        'is_active',
        'auto_renew',
    ];

    protected $casts = [
        'ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsToMany(Plan::class, 'plan_subscription')
                    ->withTimestamps();
    }

    // public function plan() { return $this->belongsTo(Plan::class); }

    // // Scopes
    // public function scopeActive(Builder $q): Builder {
    //     return $q->where('status','active')->where('ends_at','>=', now());
    // }
    // public function scopeSoonToExpire(Builder $q): Builder {
    //     return $q->where('status','soon_to_expire');
    // }
    // public function scopeExpired(Builder $q): Builder {
    //     return $q->where('status','expired');
    // }

    // public function isActive(): bool {
    //     return $this->status === 'active' && $this->ends_at->isFuture();
    // }
}