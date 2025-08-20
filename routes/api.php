<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\LeaveController;
use App\Http\Controllers\Admin\NoticesAndAppreciationController;
use App\Http\Controllers\Admin\PunchDataController;
use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\ClientBucketApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\LeaveApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/addrawdata/{employeeCode}/{inOutDate}/{inOutTime}/{deviceID}/{deviceMode}/{attendanceDate}/{trackingId}', [PunchDataController::class, 'addRawData']);

Route::post('/login', [AuthApiController::class, 'login']);
Route::get('/registration/settings', [DashboardApiController::class, 'registrationLinkSetting']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
