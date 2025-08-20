<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Stripe\Product;
use Stripe\Price;
use Stripe\Stripe;

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
        $plan = Plan::findOrFail($id);
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Archive the product in Stripe
        Product::update($plan->stripe_product_id, [
            'active' => false,
        ]);

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plan deleted successfully.');
    }

}