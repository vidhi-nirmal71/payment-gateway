<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminPaymentFailedMail;
use App\Mail\PaymentFailedMail;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Stripe\Product;
use Stripe\Price;
use Stripe\Stripe;
use Stripe\Webhook;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::all();
        return view('admin.plans.index', compact('plans'));
    }

    public function create()
    {
        return view('admin.plans.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required',
            'price'      => 'required|numeric|min:1',
            'currency'   => 'required',
            'interval'   => 'required|in:month,year',
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        // 1. Create Product in Stripe
        $product = Product::create([
            'name' => $request->name,
        ]);

        // 2. Create Price in Stripe
        $price = Price::create([
            'unit_amount' => $request->price * 100,
            'currency'    => $request->currency,
            'recurring'   => ['interval' => $request->interval],
            'product'     => $product->id,
        ]);

        // 3. Store in DB
        $plan = Plan::create([
            'name'              => $request->name,
            'description'       => $request->description,
            'price'             => $request->price,
            'currency'          => $request->currency,
            'interval'          => $request->interval,
            'stripe_product_id' => $product->id,
            'stripe_price_id'   => $price->id,
        ]);
        return redirect()->route('admin.plans.index')->with('success', 'Plan created successfully.');
    }

    public function edit($id)
    {
        $id = decrypt($id);
        $plan = Plan::findOrFail($id);
        return view('admin.plans.edit', compact('plan'));
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Update Stripe Product (name, description, etc.)
        Product::update($plan->stripe_product_id, [
            'name'        => $request->name,
            'description' => $request->description,
        ]);

        // Price can't be updated — create a new one if price/currency/interval changed
        if ($plan->price != $request->price || $plan->currency != $request->currency || $plan->interval != $request->interval) {
            $newPrice = Price::create([
                'unit_amount' => $request->price * 100,
                'currency'    => $request->currency,
                'recurring'   => ['interval' => $request->interval],
                'product'     => $plan->stripe_product_id,
            ]);

            $plan->stripe_price_id = $newPrice->id;
        }

        // Update local DB
        $plan->update([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'currency'    => $request->currency,
            'interval'    => $request->interval,
        ]);

        return redirect()->route('admin.plans.index')->with('success', 'Plan updated successfully.');
    }


    public function destroy($id)
    {
        $id = decrypt($id);
        $plan = Plan::findOrFail($id);
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Archive the product in Stripe
        Product::update($plan->stripe_product_id, [
            'active' => false,
        ]);
        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan deleted successfully.');
    }

    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $secret);
        } catch (\Exception $e) {
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                // Mark subscription active in DB
                break;

            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                // Extend subscription in DB
                break;

            case 'invoice.payment_failed':
                $invoice = $event->data->object;

                // 1. Get customer info from Stripe
                $customer = \Stripe\Customer::retrieve($invoice->customer);

                // 2. Find user in DB by Stripe customer ID
                $user = User::where('stripe_customer_id', $customer->id)->first();

                if ($user) {
                    Mail::to($user->email)->send(new PaymentFailedMail($invoice));
                    Mail::to('admin@example.com')->send(new AdminPaymentFailedMail($user, $invoice));
                }
                break;
        }

        return response('Webhook received', 200);
    }
}