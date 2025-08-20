<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CleanFancyInput
{
    public function handle($request, Closure $next)
    {
        $cleaned = collect($request->all())->map(function ($value) {
            if (is_string($value)) {
                return cleanFancyUnicode($value);
            } elseif (is_array($value)) {
                return array_map('cleanFancyUnicode', $value);
            }
            return $value;
        })->toArray();

        $request->merge($cleaned);

        return $next($request);
    }
}