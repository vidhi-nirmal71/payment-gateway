<?php

namespace App\Http\Controllers;

use App\Enum\AnnouncementTypeEnum;
use App\Enum\LeaveStatusEnum;
use App\Enum\NoticeAppreciationEnum;
use App\Enum\ProjectStatusEnum;
use App\Enum\ProjectTypeEnum;
use App\Http\Traits\AttendanceTrait;
use App\Http\Traits\LeaveTrait;
use App\Http\Traits\RedisTrait;
use App\Mail\WelcomeUserMail;
use App\Models\Announcement;
use App\Models\Leave;
use App\Models\LeaveCategory;
use App\Models\NoticesAndAppreciation;
use App\Models\Plan;
use App\Models\Project;
use App\Models\ProjectReminder;
use App\Models\PunchProcessedData;
use App\Models\Subscription;
use App\Models\Timesheet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redis;

class HomeController extends Controller
{
    use AttendanceTrait, LeaveTrait, RedisTrait;

    public function home()
    {

        $user = Auth::user();
        $subscription = null;

        if ($user) {
            $subscription = Subscription::with('plan')->where('user_id', $user->id)
                ->whereIn('status', ['active','soon_to_expire'])
                ->where('ends_at', '>=', now())
                ->first();
        }
        $plans = Plan::all();
        return view('admin.home', compact('plans', 'subscription'));
    }
}
