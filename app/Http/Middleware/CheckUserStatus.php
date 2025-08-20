<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // if (Auth::check()) {
        //     if (Auth::user()->activated == 0) {
        //         $request->user()->tokens()->delete();

        //         return response()->json(['message' => 'Your acccount is inactive.'], 401);
        //     }
        // }

        return $next($request);
    }
}
