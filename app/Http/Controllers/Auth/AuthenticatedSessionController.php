<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.auth.login');
    }

    /**
     * Handle an incoming authentication request.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        // Start onboard sop
        // $designationExist = $this->getPrimaryTechExistOrNot();
        // $policyNullOrNot = $this->getPolicyExistOrNot();

        // $userJoiningDate = Carbon::parse(Auth::user()->joining_date)->format('Y-m-d');
        // $configJoiningDate = Carbon::parse(config('on-board-sop.JOINING_DATE'))->format('Y-m-d');

        // if($policyNullOrNot == "0" && $userJoiningDate > $configJoiningDate){
        //     return redirect()->route('user.policy.get');
        // }

        // if ($policyNullOrNot && $designationExist == "0") {
        //     session(['profile' => '1']);

        //     return redirect()->route('user.profile');
        // }

        // END onboard sop

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Destroy an authenticated session.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('login');
    }
}
