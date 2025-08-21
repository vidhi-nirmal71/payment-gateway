<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class ActivateNextPlan extends Command
{
    protected $signature = 'subscriptions:activate-next';
    protected $description = 'Activate next pending subscription when current one ends';

    public function handle()
    {
        $expired = Subscription::where('status','active')
            ->where('ends_at','<', now())
            ->get();

        foreach ($expired as $sub) {
            $sub->update(['status'=>'completed','is_active'=>false]);

            // Find next pending
            $next = Subscription::where('user_id',$sub->user_id)
                    ->where('status','pending')
                    ->orderBy('id')
                    ->first();

            if ($next) {
                $plan = $next->plan()->first();
                $this->activate($next, $plan);
            }
        }
    }

    private function activate($dbSubscription, $plan)
    {
        $user = $dbSubscription->user;

        $stripeSubscription = \Stripe\Subscription::create([
            'customer' => $user->stripe_customer_id,
            'items' => [['price' => $plan->stripe_price_id]],
            'expand' => ['latest_invoice.payment_intent'],
        ]);

        $dbSubscription->update([
            'stripe_subscription_id' => $stripeSubscription->id,
            'status' => 'active',
            'is_active' => true,
            'starts_at' => now(),
            'ends_at' => $plan->interval === 'year' ? now()->addYear() : now()->addMonth(),
        ]);
    }
}
