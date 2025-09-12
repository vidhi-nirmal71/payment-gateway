<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use PostHog\PostHog;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        Schema::defaultStringLength(191);

        PostHog::init(env('POSTHOG_API_KEY'), [
            'host' => env('POSTHOG_HOST', 'https://app.posthog.com')
        ]);

        // View composer for the sidebar: makes $showInvoices available in the sidebar view
        View::composer('admin.layout.sidebar', function ($view) {
            $user = Auth::user();
            $showInvoices = false;
            if ($user) {
                // evaluate the flag for this user using their distinct id
                $showInvoices = PostHog::isFeatureEnabled('InvoicesSidebar',$user->email);
            }
            $view->with('showInvoices', $showInvoices);
        });
    }
}
