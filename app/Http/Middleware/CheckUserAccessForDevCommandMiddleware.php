<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserAccessForDevCommandMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedUserName = ['keyurp_itpath', 'Bhaviks_itpath', 'SaurabhG_itpath'];

        // Check if the user's username is in the allowed array
        if (auth()->user() && in_array(auth()->user()->username, $allowedUserName)) {
            return $next($request);
        }

        // If the username is not in the allowed array show 403 - unauthorized
        abort(403, 'Unauthorized. This action is only allowed for specific users.');
    }
}
