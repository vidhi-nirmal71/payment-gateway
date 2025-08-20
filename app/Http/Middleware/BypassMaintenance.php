<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class BypassMaintenance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // List of allowed users
        $allowedUserName = ['keyurp_itpath', 'Bhaviks_itpath', 'SaurabhG_itpath'];

        if (auth()->user() && in_array(auth()->user()->username, $allowedUserName) || (Route::currentRouteName() == 'login' || $request->getRequestUri() == '/login')) {
            return $next($request);
        }

        // Default Laravel maintenance mode check
        if (app()->isDownForMaintenance()) {
            abort(503);
        }

        return $next($request);
    }
}
