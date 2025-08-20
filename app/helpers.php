<?php

use App\Enum\NotificationTypeEnum;
use App\Models\Notification;
use App\Models\PunchProcessedData;
use App\Models\PunchRowData;
use App\Models\User;
use App\Models\UserHasPta;
use App\Models\YearlyHolidays;
use App\Models\YearlyWorkingSaturdays;
use App\Scopes\UserScope;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

/**
 * return given key redis value in json decode formate
 */
function redisGet($name)
{
    if (Redis::get($name)) {
        return json_decode(Redis::get($name));
    }

    return null;
}

/**
 * Set redis key and value
 */
function redisSet($name, $data)
{
    return Redis::set($name, $data);
}

// To get all enum value and text pass the Enum name of class like - LeaveTypeEnum::class
function getEnumDataAsValueAndText($enum)
{
    $enumType = $enum::cases();
    $enumData = [];
    foreach ($enumType as $type) {
        $enumData[$type->value] = $type->text();
    }

    return $enumData;
}

function generatePaginationArray($paginator, $elements)
{
    $paginationArray = [];

    // Previous Page Link
    if ($paginator->onFirstPage()) {
        $paginationArray[] = ['type' => 'prev', 'class' => 'disabled', 'page' => 'prev'];
    } else {
        $paginationArray[] = ['type' => 'prev', 'class' => '', 'page' => $paginator->currentPage() - 1];
    }

    // Pagination Elements
    foreach ($elements as $element) {
        // "Three Dots" Separator
        if (is_string($element)) {
            $paginationArray[] = ['type' => 'ellipsis', 'class' => 'disabled', 'page' => '...'];
        }

        // Array Of Links
        if (is_array($element)) {
            foreach ($element as $page => $url) {
                if ($page == $paginator->currentPage()) {
                    $paginationArray[] = ['type' => 'active', 'class' => 'active', 'page' => $page];
                } else {
                    $paginationArray[] = ['type' => 'page', 'class' => '', 'page' => $page];
                }
            }
        }
    }

    // Next Page Link
    if ($paginator->hasMorePages()) {
        $paginationArray[] = ['type' => 'next', 'class' => '', 'page' => $paginator->currentPage() + 1];
    } else {
        $paginationArray[] = ['type' => 'next', 'class' => 'disabled', 'page' => 'next'];
    }

    return $paginationArray;
}

// Format the hours and minutes as HH:MM
function convertDecimalToTimeFormat($decimalTime)
{
    if (is_numeric($decimalTime) && $decimalTime > 0) {
        $hours = (int) $decimalTime;
        $minutes = ($decimalTime - $hours) * 60;
        $minutes = round($minutes);

        return sprintf('%02d:%02d', $hours, $minutes);
    } else {
        return '00:00';
    }
}

function convertSecondToDecimalTimeFormat($seconds)
{
    $hours = floor($seconds / 3600);
    $minutes = floor(($seconds % 3600) / 60);
    $totalEntryTime = number_format(($hours + ($minutes / 60)), 2);

    return $totalEntryTime;
}

function convertFormatNumberToFloat($number)
{
    $number = (float) str_replace(',', '', $number);

    return $number;
}

function convertSecondToHHMMformat($seconds)
{
    $isNegative = $seconds < 0;
    $seconds = abs((int) $seconds);

    $hours = floor($seconds / 3600);
    $minutes = floor(($seconds % 3600) / 60);

    $formatted = sprintf('%02d:%02d', $hours, $minutes);

    return $isNegative ? '-' . $formatted : $formatted;
}

function convertToMinutes($time)
{
    if ($time !== '-') {
        [$hours, $minutes] = explode(':', $time);

        return $hours * 60 + $minutes;
    }

    return 0;
}

// Calculate the ratio between two numbers.
function getRatioTwoNumber($numOne, $numTwo)
{
    $totalHrs = $numOne + $numTwo;
    $totalHrs == 0 ? 1 : $totalHrs;
    $firstNumber = (($numOne * 100) / $totalHrs);
    $secondNumber = (($numTwo * 100) / $totalHrs);

    // return $firstNumber . ' : ' . $secondNumber;
    return ($firstNumber == 0 && $secondNumber == 0 ? 0 : 1).' : '.round(($secondNumber / ($firstNumber == 0 ? 1 : $firstNumber)), 1);
}

function earlyLeavingCount($user, $startDate, $endDate)
{
    // Early leaving report: which shows User wise early leaving count and time

    $earlyLeavingReportFullDay = Redis::get('EARLY_LEAVING_REPORT_FULL_DAY');
    $earlyLeavingReportHalfDay = Redis::get('EARLY_LEAVING_REPORT_HALF_DAY');
    $halfDayLeaveHours = Redis::get('HALF_DAY_LEAVE_HOURS');

    // If redis data null then set it first
    if ($earlyLeavingReportFullDay == null || $earlyLeavingReportHalfDay == null || $halfDayLeaveHours == null) {
        $generalData = DB::table('generic_settings')->where('general', '!=', null)->pluck('general')->first();
        $data = json_decode($generalData);

        Redis::set('EARLY_LEAVING_REPORT_FULL_DAY', $data->EARLY_LEAVING_REPORT_FULL_DAY);
        Redis::set('EARLY_LEAVING_REPORT_HALF_DAY', $data->EARLY_LEAVING_REPORT_HALF_DAY);
        Redis::set('HALF_DAY_LEAVE_HOURS', $data->HALF_DAY_LEAVE_HOURS);
        $earlyLeavingReportFullDay = Redis::get('EARLY_LEAVING_REPORT_FULL_DAY');
        $earlyLeavingReportHalfDay = Redis::get('EARLY_LEAVING_REPORT_HALF_DAY');
        $halfDayLeaveHours = Redis::get('HALF_DAY_LEAVE_HOURS');
    }

    $punchData = User::select('punchprocesseddata.ReportAttendenceDate as date', 'punchprocesseddata.id as attendace_id')
        ->join('punchprocesseddata', function ($join) use ($startDate, $endDate) {
            $join->on('users.machine_code_id', '=', 'punchprocesseddata.EmployeeCode')
                ->whereDate('punchprocesseddata.ReportAttendenceDate', '<=', $endDate)
                ->whereDate('punchprocesseddata.ReportAttendenceDate', '>=', $startDate);
        })
        ->selectRaw('SUM(TIME_TO_SEC(IFNULL(TIMEDIFF(
                                                    IF(punchprocesseddata.OutTime <> "0000-00-00 00:00:00" AND punchprocesseddata.InTime <> "0000-00-00 00:00:00", punchprocesseddata.OutTime, NULL),
                                                    IF(punchprocesseddata.OutTime <> "0000-00-00 00:00:00" AND punchprocesseddata.InTime <> "0000-00-00 00:00:00", punchprocesseddata.InTime, NULL)
                                            ), 0 ))) as inside_time')
        ->where('users.activated', 1)
        ->where('users.machine_code_id', $user->machine_code_id)
        ->groupBy('punchprocesseddata.ReportAttendenceDate')
        ->get()->toArray();

    $fullDayTime = $earlyLeavingReportFullDay * 3600;
    $halfDayTime = $earlyLeavingReportHalfDay * 3600;
    $halfDayLeaveTime = $halfDayLeaveHours * 3600;

    $earlyRepotData = [];
    $earlyRepotData['diff_time'] = 0;
    $earlyRepotData['count'] = 0;

    foreach ($punchData as $entry) {
        $isWeekDay = Carbon::parse($entry['date'])->isWeekday();

        // Calculate the difference between fullDayTime and inside_time
        $insideTime = (int) $entry['inside_time'];
        $leaveData = [];
        if (($fullDayTime > $insideTime) && $insideTime > 0 && $isWeekDay) {   // Full day

            //  Check leave is exist for this user
            $fechedData = Redis::get('leave-'.$entry['date']);
            if ($fechedData) {
                $fechedData = redisLeaveDataMakeProperFormat($fechedData);
                $leaveData = array_merge($leaveData, $fechedData);
            }
            $userId = $user->id;
            $filteredLeaves = array_filter($leaveData, function ($event) use ($userId) {
                return $event->userId == $userId;
            });
            $checkLeave = null;
            if (! empty($filteredLeaves)) {
                $filteredLeaves = array_values($filteredLeaves);
                $checkLeave = ($filteredLeaves[0]->isFullDay == 1 ? 'full' : 'half');
            }

            if ($insideTime < $fullDayTime && $insideTime > $halfDayLeaveTime && $checkLeave != 'full') {
                $difference = $fullDayTime - $insideTime;
                $earlyRepotData['diff_time'] += $difference;
                $earlyRepotData['count']++;

            } elseif ($insideTime < $halfDayTime && ! ($checkLeave == 'half' || $checkLeave == 'full')) {    // Half day
                $difference = $halfDayTime - $insideTime;
                $earlyRepotData['diff_time'] += $difference + 60;
                $earlyRepotData['count']++;
            }
        }
    }

    return $earlyRepotData;
}

// Return list of user ids assigned to PTA in user management not in project
function listOfUsersForPta($userID)
{
    return UserHasPta::where('pta_user_id', $userID)->get()->pluck('user_id')->toArray();
}

function listOfUsersForAvp($userIds)
{
    return UserHasPta::whereIn('pta_user_id', $userIds)->get()->pluck('user_id')->toArray();
}

function getInterRolesIdFromSettings()
{
    $internRoles = redisGet('INTERN_ROLES');
    if ($internRoles == null) {
        $genericSettings = DB::table('generic_settings')->select('intern_roles')->first();
        if ($genericSettings && $genericSettings->intern_roles) {
            redisSet('INTERN_ROLES', json_encode($genericSettings->intern_roles));

            return explode(',', $genericSettings->intern_roles);
        } else {
            return [];
        }
    } else {
        return explode(',', $internRoles);
    }
}

// Conver array of HH:MM:SS to total seconds
function getSecondsOfHHMMSS($times)
{
    $totalSeconds = 0;
    foreach ($times as $time) {
        if (str_contains($time, ':')) {
            $time = str_replace(':', '.', $time);
        }
        [$hours, $minutes, $seconds] = sscanf($time, '%d.%d.%d');
        if ($hours > 0) {
            $totalSeconds += $hours * 3600;
        }
        if ($minutes > 0) {
            $totalSeconds += $minutes * 60;
        }
        if ($seconds > 0) {
            $totalSeconds += $seconds;
        }
    }

    return $totalSeconds;
}

// Maximum time sloat set to redis
function getTimesheetMaxSloat()
{
    $maxTime = Redis::get('TIMESHEET_SLOAT_MAX_HOURS');
    if (! $maxTime) {
        $generalData = DB::table('generic_settings')->where('general', '!=', null)->pluck('general')->first();
        $data = json_decode($generalData);
        Redis::set('TIMESHEET_SLOAT_MAX_HOURS', $data->TIMESHEET_SLOAT_MAX_HOURS);
        $maxTime = Redis::get('TIMESHEET_SLOAT_MAX_HOURS');
    }

    return convertDecimalToTimeFormat($maxTime);
}

function redisLeaveDataMakeProperFormat($fechedData)
{
    $fechedData = '['.str_replace('}{', '},{', $fechedData).']';

    return json_decode($fechedData);
}

function getLastWorkingDay($today) // pass carbon intance of date and it's return last working date based on provided date
{
    $cacheExpirationTime = Carbon::tomorrow()->setTime(3, 0, 0);
    $holidays = Cache::remember('holidays-list', $cacheExpirationTime, function () {
        return YearlyHolidays::select('holiday_date')->whereYear('holiday_date', date('Y'))->get()->pluck('holiday_date')->toArray();
    });
    $workingSaturday = Cache::remember('working-saturday', $cacheExpirationTime, function () {
        return YearlyWorkingSaturdays::select('working_date')->whereYear('working_date', date('Y'))->get()->pluck('working_date')->toArray();
    });

    $yesterday = $today->copy()->subDays(1);

    while (in_array($yesterday->format('Y-m-d'), $holidays)) {
        $yesterday->subDay();
    }

    while ($yesterday->isWeekend() && ! in_array($yesterday->format('Y-m-d'), $workingSaturday)) {
        $yesterday->subDay();
    }

    return $yesterday;
}

function checkUserIsAvp($avpRole)
{
    $currentUserRole = auth()->user() && auth()->user()->roles ? auth()->user()->roles->pluck('name')->toArray() : '';

    return $currentUserRole[0] == $avpRole;
}

function checkUserIsPta($ptaRole)
{
    $currentUserRole = auth()->user() && auth()->user()->roles ? auth()->user()->roles->pluck('name')->toArray() : '';

    return $currentUserRole[0] == $ptaRole;
}

function getAssignedPtaIdsForAvp($userId)
{
    return UserHasPta::where('pta_user_id', $userId)->get()->pluck('user_id')->toArray();
}

function checkUserIsAvpById($avpRole, $userId)
{
    $user = User::with('roles')->where('id', $userId)->first();
    $currentUserRole = $user->roles ? $user->roles->pluck('name')->toArray() : '';

    return $currentUserRole[0] == $avpRole;
}

function getSalesHeadFromRedis()
{
    $salesHead = Redis::get('SALES_HEAD');
    if(!$salesHead){
        $genericSettings = DB::table('generic_settings')->select('sales_head_role', 'roles_report_to_head')->first();
        Redis::set('SALES_HEAD', $genericSettings->sales_head_role);
        Redis::set('SALES_HEAD_REPORT_TEAM', $genericSettings->roles_report_to_head);
        $salesHead = Redis::get('SALES_HEAD');
    }
    return $salesHead;
}

function getTeamMembersForSalesHead()
{
    $salesTeamIds = [];
    $isSalesHead = false;
    $user = auth()->user();

    $salesHead = Redis::get('SALES_HEAD');
    $salesHeadReportTeam = Redis::get('SALES_HEAD_REPORT_TEAM');
    if (! $salesHead || ! $salesHeadReportTeam) {
        $salesHead = getSalesHeadFromRedis();
        $salesHeadReportTeam = Redis::get('SALES_HEAD_REPORT_TEAM');
    }

    if ($user->roles && $user->roles[0]->id == $salesHead) {
        $isSalesHead = true;
        $salesReportRoles = [];
        if ($salesHeadReportTeam) {
            $salesReportRoles = explode(',', $salesHeadReportTeam);
        }
        $salesTeamIds = User::where('activated', 1)
            ->whereHas('roles', function ($query) use ($salesReportRoles) {
                $query->whereIn('id', $salesReportRoles);
            })->get()->pluck('id')->toArray();
    }

    return [
        'salesTeamIds' => $salesTeamIds,
        'isSalesHead' => $isSalesHead,
    ];
}

function getSystemUserId()
{

    $systemUser = Cache::remember('system_user', 60 * 60 * 24 * 30, function () {
        return User::withoutGlobalScope(UserScope::class)->where('username', 'ips_workspace_user')->get()->pluck('id')->toArray();
    });

    return ! empty($systemUser) ? $systemUser[0] : 4;
}

//  process punchrowdata table data to punchprocesseddata -- DON'T CHANGE THIS FUNCTION
function puchDataProcess($pendingRawData)
{
    if ($pendingRawData->isNotEmpty()) {
        foreach ($pendingRawData as $rawData) {
            $getEmployeeLastProcessedData = PunchProcessedData::where('EmployeeCode', $rawData['EmployeeCode'])->orderBy('AttendanceDate', 'DESC')->orderBy('id', 'DESC')->limit(1)->first();
            if (! $getEmployeeLastProcessedData) {
                $insertUpdateFlag = 'Insert';
            } else {
                if ($rawData['DeviceMode'] == 'IN') {
                    $insertUpdateFlag = 'Insert';
                } else {
                    if ($rawData['DeviceMode'] == 'OUT' && ($getEmployeeLastProcessedData->InTime != '0000-00-00 00:00:00' || $getEmployeeLastProcessedData->InTime != null)) {
                        if ($getEmployeeLastProcessedData->OutTime == '0000-00-00 00:00:00' || $getEmployeeLastProcessedData->OutTime == null) {
                            $insertUpdateFlag = 'Update';
                        } else {
                            $insertUpdateFlag = 'Insert';
                        }
                    } else {
                        $insertUpdateFlag = 'Insert';
                    }
                }
            }

            // MODEL FUNCTION
            $dataArray = [];
            $processDataFlag = false;
            if ($rawData['DeviceMode'] == 'IN') {
                $dataArray['InTime'] = $rawData['InOutTime'];
                $dataArray['InTimeDeviceId'] = $rawData['DeviceId'];
            } else {
                $dataArray['OutTime'] = $rawData['InOutTime'];
                $dataArray['OutTimeDeviceId'] = $rawData['DeviceId'];
            }
            if ($insertUpdateFlag == 'Update') {
                $res = PunchProcessedData::where('id', $getEmployeeLastProcessedData->id)->update($dataArray);
                if ($res) {
                    $res = PunchRowData::where('id', $rawData['id'])->update(['IsProcessed' => 1]);     // Set Rawdata as IsProcess 1
                    $processDataFlag = $res ? true : false;
                } else {
                    $processDataFlag = false;
                }
            } else {
                $dataArray['EmployeeCode'] = $rawData['EmployeeCode'];
                $dataArray['CreatedDate'] = $rawData['CreatedDate'];
                $dataArray['AttendanceDate'] = $rawData['AttendanceDate'];

                if ($rawData['DeviceMode'] == 'IN') {
                    $shiftData = DB::table('employee_shift')->select('start_hour')->leftJoin('users', 'users.shift_id', '=', 'employee_shift.id')->where('users.machine_code_id', $rawData['EmployeeCode'])->first();

                    if ($shiftData) {
                        $resultShiftStart = explode(':', $shiftData->start_hour);
                        $resultShiftStartHour = $resultShiftStart[0];
                    } else {
                        $resultShiftStartHour = '08';
                    }
                    $ReportAttendenceDate = date('Y-m-d', strtotime('-'.$resultShiftStartHour.' hours', strtotime($rawData['InOutTime'])));
                    $dataArray['ReportAttendenceDate'] = $ReportAttendenceDate;
                } else {
                    $dataArray['ReportAttendenceDate'] = date('Y-m-d', strtotime($rawData['InOutTime']));
                }

                $res = PunchProcessedData::create($dataArray);
                if ($res) {
                    $flagIsProcessed = PunchRowData::where('id', $rawData['id'])->update(['IsProcessed' => 1]);     // Set Rawdata as IsProcess 1
                    $processDataFlag = $flagIsProcessed ? true : false;
                } else {
                    $processDataFlag = false;
                }
            }
            // END MODEL FUNCTION
        }
    }
}

// Calculate the second working day of the current month
function getSecondWorkingDay()
{
    $currentYear = now()->year;
    $currentMonth = now()->month;

    // Fetch holidays and working Saturdays from cache
    $workingSaturdays = Cache::remember('yearly_working_saturdays', 86400, function () {
        return YearlyWorkingSaturdays::pluck('working_date')->toArray();
    });

    $holidays = Cache::remember('yearly_holidays', 86400, function () {
        return YearlyHolidays::pluck('holiday_name', 'holiday_date')->toArray();
    });

    // Get the first day of the month
    $date = Carbon::create($currentYear, $currentMonth, 1);
    $workingDaysCount = 0;

    while ($workingDaysCount < 2) {
        // Check if it's a holiday or a non-working Saturday
        if (! isset($holidays[$date->format('Y-m-d')]) &&
            (! $date->isSaturday() || in_array($date->format('Y-m-d'), $workingSaturdays)) &&
            ! $date->isSunday()
        ) {
            $workingDaysCount++;
        }

        // If we haven't reached the second working day, move to the next day
        if ($workingDaysCount < 2) {
            $date->addDay();
        }
    }

    return $date->day; // Return the second working day's day number
}

function getAllBirthdayAndAnniversaryData($date)
{
    $cacheKey = 'birthdays_anniversaries_'.$date->format('Ymd');

    // Return from Redis if available
    return Cache::remember($cacheKey, now()->addHours(3), function () use ($date) {
        $lastWorkingDay = getLastWorkingDay($date);
        $todayYMD = $date->format('Y-m-d');
        $data = [
            'birthdayList' => [],
            'anniversaryList' => [],
        ];

        $isYesterday = $lastWorkingDay->isSameDay($date->copy()->subDay());
        $notificationsQuery = Notification::select('title', 'type', 'created_at')->whereIn('type', [NotificationTypeEnum::Birth_Day->value, NotificationTypeEnum::Work_Anniversary->value]);

        if ($isYesterday) {
            $notificationsQuery->whereDate('created_at', $todayYMD);
        } else {
            $startDate = $lastWorkingDay->copy()->addDay()->format('Y-m-d');
            $endDate = $todayYMD;
            $notificationsQuery->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate]);
        }

        $notifications = $notificationsQuery->get();

        foreach ($notifications as $notification) {
            $ymd = Carbon::parse($notification->created_at)->format('Y-m-d');
            $isToday = $ymd === $todayYMD;

            if ($notification->type == NotificationTypeEnum::Birth_Day->value) {
                $data['birthdayList'][] = $isToday ? $notification->title : $notification->title.' (Belated)';
            }

            if ($notification->type == NotificationTypeEnum::Work_Anniversary->value) {
                $data['anniversaryList'][] = $isToday ? $notification->title : $notification->title.' (Belated)';
            }
        }

        return $data;
    });
}

function checkIfSecondWorkingDay(){
    $isSecondWorkingDay = false;
    $holidays = YearlyHolidays::select('holiday_date')->whereYear('holiday_date', date('Y'))->get()->pluck('holiday_date')->toArray();
    $workingSaturday = YearlyWorkingSaturdays::select('working_date')->whereYear('working_date', date('Y'))->get()->pluck('working_date')->toArray();
    $workingDayOfMonth = Carbon::parse('2nd '.date('M'))->format('Y-m-d'); // get the second date of the month

    if ((Carbon::parse($workingDayOfMonth)->isWeekday() || array_search($workingDayOfMonth, $workingSaturday)) && ! array_search($workingDayOfMonth, $holidays)) {
        $isSecondWorkingDay = true;
    } else {
        $nextWeekDay = Carbon::parse($workingDayOfMonth)->nextWeekday()->format('Y-m-d');
        $notInHoliday = ! array_search($nextWeekDay, $holidays);
        if ($notInHoliday) {
            $workingDayOfMonth = $nextWeekDay;
            $isSecondWorkingDay = true;
        }
    }

    return [
        'isSecondWorkingDay' => $isSecondWorkingDay,
        'workingDayOfMonth' => $workingDayOfMonth,
    ];
}

function durationFilter($filter, $dateFilter)
{
    $now = Carbon::now();

    $dateRange = match ($filter) {
        'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        'last_working_day' => (function () {
            $day = getLastWorkingDay(Carbon::now());
            return [$day, $day];
        })(),
        'this_week' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
        'last_week' => [$now->copy()->subWeek()->startOfWeek(), $now->copy()->subWeek()->endOfWeek()],
        'this_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        'last_month' => [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()],
        'this_quarter' => (function () use ($now) {
            $quarter = ceil($now->month / 3);
            $startMonth = ($quarter - 1) * 3 + 1;
            $start = Carbon::create($now->year, $startMonth, 1)->startOfMonth();
            $end = (clone $start)->addMonths(2)->endOfMonth();
            return [$start, $end];
        })(),
        'last_quarter' => (function () use ($now) {
            $quarter = ceil($now->month / 3) - 1;
            $year = $quarter < 1 ? $now->year - 1 : $now->year;
            $quarter = $quarter < 1 ? 4 : $quarter;
            $startMonth = ($quarter - 1) * 3 + 1;
            $start = Carbon::create($year, $startMonth, 1)->startOfMonth();
            $end = (clone $start)->addMonths(2)->endOfMonth();
            return [$start, $end];
        })(),
        'this_year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
        'last_year' => [$now->copy()->subYear()->startOfYear(), $now->copy()->subYear()->endOfYear()],
        'date' => [Carbon::parse($dateFilter['startDate'] ?? $now), Carbon::parse($dateFilter['endDate'] ?? $now)],
        'all' => null,
        default => null,
    };

    return $dateRange;
}

function cleanFancyUnicode($string)
{
    if ($string === null) {
        return '';
    } 
    // Normalize Unicode characters (e.g., styled/bold/italic letters)
    $normalized = \Normalizer::normalize($string, \Normalizer::FORM_KD);
    
    // Remove all characters outside basic Latin (ASCII printable characters)
    return preg_replace('/[^\x20-\x7E]/u', '', $normalized);
}