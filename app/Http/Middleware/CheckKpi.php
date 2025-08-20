<?php

namespace App\Http\Middleware;

use App\Http\Traits\RedisTrait;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckKpi
{
    use RedisTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start onboard sop
        // if (Auth::check()) {
        //     $userJoiningDate = Carbon::parse(Auth::user()->joining_date)->format('Y-m-d');
        //     $configJoiningDate = Carbon::parse(config('on-board-sop.JOINING_DATE'))->format('Y-m-d');

        //     if($userJoiningDate > $configJoiningDate){
        //         $kpiExistOrNot = $this->getKpiReviewedOrNot();
        //         $profileExist = $this->getPrimaryTechExistOrNot();

        //         if ($profileExist == "0") {
        //             session(['profile' => '1']);
        //             return redirect()->route('user.profile');
        //         }

        //         if ($kpiExistOrNot == "0") {
        //             return redirect()->route('user.kpi.get');
        //         }
        //     }
        // }
        // END onboard sop

        return $next($request);
    }
}
