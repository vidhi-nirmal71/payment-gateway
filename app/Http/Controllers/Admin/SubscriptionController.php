<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription as DbSubscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Subscription;
use Stripe\Customer;
use Stripe\Invoice;
use Stripe\PaymentMethod;

class SubscriptionController extends Controller
{
    public function selectPlan(Request $request)
    {
        $user = auth()->user();

        // If user has active auto-renew subscription → block further purchase
        $activeAutoRenew = DbSubscription::where('user_id', $user->id)->where('auto_renew', true)->where('status', 'active')->first();

        if ($activeAutoRenew) {
            return back()->with('error', 'You already have an auto-renew subscription. Please disable auto-renew before purchasing another plan.');
        }

        session(['selected_plan' => $request->plan_id]);
        return view('admin.payment-form', ['plan' => $request->plan_name,'plan_id' => $request->plan_id,'user' => $user]);
    }

    public function processPayment(Request $request)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));
        $plan = session('selected_plan');
        $user = auth()->user();

        if ($user->is_admin) {
            return response()->json(['success' => false,'message' => 'Admins cannot subscribe to plans.'], 403);
        }

        // $priceId = match ($plan) {
        //     'basic' => env('STRIPE_BASIC_PRICE_ID'),
        //     'standard' => env('STRIPE_STANDARD_PRICE_ID'),
        //     'premium' => env('STRIPE_PREMIUM_PRICE_ID'),
        //     default => env('STRIPE_BASIC_PRICE_ID'),
        // };

        try {
            $plan = Plan::where('id', decrypt($request->plan_id))->first();
            if(!$plan) {
                return response()->json(['success' => false, 'message' => 'Plan not found'], 500);
            }
            $existing = DbSubscription::where('user_id', $user->id)->whereIn('status', ['pending', 'active', 'soon_to_expire'])->first();

            $is_active = 0;
            $auto_renew = 0;
            $status = 'pending';
            $stripeSubscriptionId = null;

            if (!$existing) {
                $stripeSubscription = $this->stripeCreate($request, $user, $plan);
                $is_active = 1;
                $auto_renew = 1;
                $status = 'active';
                $stripeSubscriptionId = $stripeSubscription->id;
            }

            // 5. Save subscription in DB
            $subscription =  DbSubscription::create([
                'user_id' => $user->id,
                // 'plan_id' => $plan->id,
                'starts_at' => now(),
                'ends_at' => $plan->interval === 'year' ? now()->addYear() : now()->addMonth(),
                'stripe_subscription_id' => $stripeSubscriptionId,
                'status'                 => $status,
                'is_active'              => $is_active,
                'auto_renew'             => $auto_renew,
            ]);

            $subscription->plan()->syncWithoutDetaching([$plan->id]);

            return response()->json(['success' => true, 'message' => 'Subscription successful!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function stripeCreate($request, $user, $plan)
    {
        // 1. Create customer if not exists
        if (!$user->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $user->email,
                'name'  => $user->name,
            ]);
            $user->stripe_customer_id = $customer->id;
            $user->save();
        }

        // 2. Attach payment method
        $paymentMethod = PaymentMethod::retrieve($request->payment_method_id);
        $paymentMethod->attach(['customer' => $user->stripe_customer_id]);

        // 3. Set default payment method
        Customer::update($user->stripe_customer_id, [
            'invoice_settings' => [
                'default_payment_method' => $request->payment_method_id,
            ],
        ]);

        // 4. Create Stripe subscription
        return Subscription::create([
            'customer' => $user->stripe_customer_id,
            'items'    => [['price' => $plan->stripe_price_id]],
            'expand'   => ['latest_invoice.payment_intent'],
        ]);
    }

    public function settings()
    {
        $user = auth()->user();
        $subscription = $user->subscription()->with('plan')->get();
        $plans = Plan::all();

        return view('admin.settings', compact('subscription', 'plans'));
    }

    public function renew($id)
    {
        $subscription = DbSubscription::findOrFail($id);

        if (!$subscription->ends_at || $subscription->ends_at->isFuture()) {
            return response()->json(['status' => 'error','message' => 'Your plan is still active. You can only renew after it expires.'], 400);
        }

        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $stripeSubscription = Subscription::retrieve($subscription->stripe_subscription_id);
            $stripeSubscription->cancel_at_period_end = false;
            $stripeSubscription->save();

            $subscription->starts_at = Carbon::now();
            $subscription->ends_at = $subscription->plan->interval === 'year' ? now()->addYear() : now()->addMonth();
            $subscription->status = 'active';
            $subscription->save();

            return response()->json(['status' => 'success','message' => 'Plan renewed successfully!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error','message' => 'Stripe error: ' . $e->getMessage()], 500);
        }
    }

    // Change plan (Upgrade / Downgrade)
    public function changePlan(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'subscription_id' => 'required|exists:subscriptions,id',
        ]);

        $subscription = DbSubscription::findOrFail($request->subscription_id);
        $newPlan = Plan::findOrFail($request->plan_id);

        // If already on the same plan
        if ($subscription->plan_id == $newPlan->id) {
            return response()->json(['message' => 'You are already on this plan.'], 422);
        }

        // Stripe logic (example)
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Cancel old stripe subscription if exists
        if ($subscription->stripe_subscription_id) {
            $stripeSub = Subscription::retrieve($subscription->stripe_subscription_id);
            $stripeSub->cancel();
        }

        // Create new subscription in Stripe
        $newStripeSub = Subscription::create([
            'customer' => $user->stripe_customer_id,
            'items' => [[ 'price' => $newPlan->stripe_price_id ]],
            'expand' => ['latest_invoice.payment_intent'],
        ]);

        // Update local DB
        $subscription->plan_id = $newPlan->id;
        $subscription->starts_at = Carbon::now();
        $subscription->ends_at = $newPlan->interval === 'year' ? now()->addYear() : now()->addMonth();
        $subscription->stripe_subscription_id = $newStripeSub->id;
        $subscription->status = 'active';
        $subscription->auto_renew = 1;
        $subscription->save();

        return response()->json(['message' => 'Plan changed to ' . $newPlan->name]);
    }

    public function toggleAutoRenew(Request $request, DbSubscription $subscription)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        if ($subscription->status === 'canceled') {
            return response()->json([
                'message' => 'This subscription is already canceled. Please create a new subscription to continue.'
            ], 400);
        }
    
        $subscription->auto_renew = !$subscription->auto_renew;
        $subscription->save();
    
        Subscription::update($subscription->stripe_subscription_id, ['cancel_at_period_end' => $subscription->auto_renew ? false : true]);
        return response()->json(['message' => $subscription->auto_renew ? 'Auto renewal enabled.' : 'Auto renewal disabled.']);
    }

    public function paymentHistory(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $users = User::pluck('name', 'stripe_customer_id');
        $localPlans = Plan::pluck('name', 'stripe_price_id');
        $subscriptions = null;

        if (auth()->user()->is_admin) {
            $subscriptions = Subscription::all(['status' => 'all','expand' => ['data.items.data.price']]);
        } else {
            $customerId = auth()->user()->stripe_customer_id;
        
            if ($customerId) {
                $subscriptions = Subscription::all(['status'   => 'all','customer' => $customerId,'expand'   => ['data.items.data.price']]);
            }
        }

        $subscriptionsData = $subscriptions ? $subscriptions->data : [];
        $mapped = collect($subscriptionsData)->map(function ($sub) use ($users, $localPlans) {
            $priceObj  = $sub->items->data[0]->price ?? null;
            $priceId   = $priceObj->id ?? null;
            $planName  = $localPlans[$priceId] ?? '-';

            return (object)[
                'subscription_id'     => $sub->id,
                'customer_id'         => $sub->customer,
                'user_name'           => $users[$sub->customer] ?? 'Unknown User',
                'plan_id'             => $priceId,
                'plan_name'           => $planName,
                'status'              => $sub->status,
                'created'             => $sub->created,
                'current_period_end'  => $sub->current_period_end,
                'currency'            => $priceObj->currency ?? null,
                'amount'              => $priceObj->unit_amount ?? 0,
            ];
        });

        return view('admin.payments.history', ['payments' => $mapped]);
    }

    public function invoices(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $users = User::pluck('name', 'stripe_customer_id');

        if (auth()->user()->is_admin) {
            $params = [];
        } else {
            $customerId = auth()->user()->stripe_customer_id;
            if (!$customerId) {
                return view('admin.payments.invoices', ['invoices' => collect()]);
            }
            $params = ['customer' => $customerId];
        }

        $stripeInvoices = Invoice::all($params);
        $invoices = collect($stripeInvoices->data)->map(function ($invoice) use ($users) {
            $invoice->user_name = $users[$invoice->customer] ?? 'Unknown User';
            return $invoice;
        });

        return view('admin.payments.invoices', compact('invoices'));
    }

}