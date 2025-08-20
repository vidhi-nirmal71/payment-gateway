<?php

namespace App\Providers;

use App\Scopes\UserScope;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\ServiceProvider;

class GlobalScopeServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Define the global scopes you want to apply to your models
        $scopes = [
            UserScope::class,
            // Add other global scopes here as needed
        ];

        foreach ($scopes as $scope) {
            $this->registerScope($scope);
        }
    }

    private function registerScope($scope)
    {
        $this->app->resolving($scope, function ($scope, $app) {
            if ($scope instanceof Scope) {
                $model = $app->make($scope->model());
                $model::addGlobalScope($scope);
            }
        });
    }
}
