<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthorizeCanAny
{
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        if (! $request->user()) {
            abort(403);
        }

        $userPermissions = array_map(function ($e) {
            return $e['name'];
        }, $request->user()->getAllPermissions()->toArray());

        $userPermissionsIntersect = array_intersect($userPermissions, $permissions);
        if (! count($userPermissionsIntersect)) {
            abort(403);
        }

        return $next($request);
    }
}
