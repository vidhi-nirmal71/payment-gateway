<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Itpath\Lighthouse\Lighthouse;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            $userDetails = [];
            if (Auth::check()) {
                $user = Auth::user();
                $userDetails['id'] = $user->id;
                $userDetails['name'] = $user->name;
            }

            $newLighthouse = new Lighthouse;
            $return = $newLighthouse->add($e, '', $userDetails);
        });
    }

    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $exception->getMessage()], 401);
        }

        // Check which guard was used and redirect accordingly
        $guard = $exception->guards()[0];

        switch ($guard) {
            case 'client':
                $login = route('client.login.index');
                break;
            default:
                $login = route('login');
                break;
        }

        return redirect()->guest($login);
    }

}
