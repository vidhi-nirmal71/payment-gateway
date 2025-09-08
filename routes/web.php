<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

require __DIR__.'/auth.php';

Route::get('/check-ip', function () {
    Log::info('IP from Laravel: ' . request()->ip());
    dd(request()->ip(), request()->server('HTTP_X_FORWARDED_FOR'));
});

    // Registration page for mobile app use
    Route::get('registration', [HomeController::class, 'registrationFormForApp'])->name('user.register.index');
    Route::post('registration/store', [HomeController::class, 'registrationFormStore'])->name('user.register.store');

    Route::middleware(['auth', 'checkUserStatus'])->group(function () {
        Route::get('profile', [UserController::class, 'getProfile'])->name('user.profile');
        Route::post('user/profile/store', [UserController::class, 'profile'])->name('user.storeProfile');

        // Dashboard widget fetch data
        Route::get('/', [HomeController::class, 'home'])->name('home');
        Route::post('/create-subscription', [SubscriptionController::class, 'createSubscription'])->name('create.subscription');
        Route::post('/checkout/{plan}', [SubscriptionController::class, 'checkout'])->name('checkout');
        Route::post('/select-plan', [SubscriptionController::class, 'selectPlan'])->name('select.plan');
        Route::post('/process-payment', [SubscriptionController::class, 'processPayment'])->name('process.payment');

        Route::get('/subscription/settings', [SubscriptionController::class, 'settings'])->name('subscription.settings');
        Route::post('/subscription/renew/{id}', [SubscriptionController::class, 'renew'])->name('subscription.renew');
        Route::post('/subscription/change', [SubscriptionController::class, 'changePlan'])->name('subscription.change');
        Route::post('/subscription/{subscription}/auto-renew', [SubscriptionController::class, 'toggleAutoRenew'])->name('subscription.autoRenew.toggle');

        Route::get('/payments', [SubscriptionController::class, 'paymentHistory'])->name('payments.history');
        Route::get('/invoices', [SubscriptionController::class, 'invoices'])->name('invoices.index');

        Route::middleware(['auth','is_admin'])->prefix('admin')->name('admin.')->group(function() {
            Route::resource('plans', PlanController::class);
            Route::post('/stripe/webhook', [PlanController::class, 'handle']);
        });
    });