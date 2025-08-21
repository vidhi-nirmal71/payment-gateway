<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DeveloperControlController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NotificationController;
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
        });
        






        Route::get('master/details', [HomeController::class, 'masterDetails'])->name('master.details');
        Route::get('/home/reminder', [HomeController::class, 'dailyReminders'])->name('home.dailyreminders');
        Route::get('/home/project/details', [HomeController::class, 'projectDetails'])->name('home.projectdetails');
        Route::get('/home/leave/details', [HomeController::class, 'leaveDetails'])->name('home.leavedetails');
        Route::get('/home/generic/details', [HomeController::class, 'genericData'])->name('home.genericdetails');
        Route::get('/home/announcement/details', [HomeController::class, 'announcementData'])->name('home.announcementdata');

        Route::get('fetch/users/forLeave', [UserController::class, 'fetchUserForLeave'])->middleware('cleanInput');
        Route::get('user/report/search/users', [UserController::class, 'getAllActiveUsersForTeam'])->name('user.getActiveForTeam')->middleware('cleanInput');        

        // Employee management module
        Route::middleware('can:employee_management_menu_view')->group(function () {
            Route::get('user', [UserController::class, 'index'])->name('user.index')->middleware('can:manage_employee');
            Route::get('user/fetchdata', [UserController::class, 'fetchdata'])->name('user.fetchdata')->middleware('cleanInput');
            Route::get('user/form', [UserController::class, 'form'])->name('user.form');
            Route::get('user/create', [UserController::class, 'form'])->name('user.create')->middleware('can:add_employee');
            Route::post('user/store', [UserController::class, 'store'])->name('user.store')->middleware('can:add_employee');
            Route::get('user/{user}/edit', [UserController::class, 'edit'])->name('user.edit')->middleware('can:edit_employee');
            Route::post('user/{user}/update', [UserController::class, 'update'])->name('user.update')->middleware('can:edit_employee');
        });
       
        // Command For Developer - KEEP IN LAST
        // Route::middleware('check_user_for_run_artisan_command')->group(function () {
        //     Route::get('redis-clear-db', [DeveloperControlController::class, 'redisClear']);    // Clear redis data
        //     Route::get('wfh-get-data-from-team-logger', [DeveloperControlController::class, 'fetchRecordFromLoggerWFH']);    // Get logger data and add to puch data for WFH
        //     Route::get('punch-sync', [DeveloperControlController::class, 'punchDataSync']);     // Sync punch row data to punch processed data
        //     Route::get('set-cache', [DeveloperControlController::class, 'setCache']);   // set cache
        //     Route::get('clear-cache', [DeveloperControlController::class, 'clearCache']);   // php artisan optimize:clear
        //     Route::get('migrate-table', [DeveloperControlController::class, 'migrateTable']);   // php artisan migrate
        //     Route::get('early-count', [DeveloperControlController::class, 'earlyDayCountDashboard']);   // dashboard:early-leaving-count
        //     Route::get('redis-value/{key}', [DeveloperControlController::class, 'getRedisValueFromKey']);   // get redis value
        // });
    });