<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;
class HomeController extends Controller
{
    public function home()
    {

        $user = Auth::user();
        $subscription = null;

        if ($user) {
            $subscription = Subscription::with('plan')->where('user_id', $user->id)
                ->whereIn('status', ['active','soon_to_expire'])
                ->where('ends_at', '>=', now())
                ->first();
        }
        $plans = Plan::all();
        return view('admin.home', compact('plans', 'subscription'));
    }
}
