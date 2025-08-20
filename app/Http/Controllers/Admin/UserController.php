<?php

namespace App\Http\Controllers\Admin;

use App\Enum\AnnouncementTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Traits\RedisTrait;
use App\Models\Announcement;
use App\Models\Database;
use App\Models\EmployeeShift;
use App\Models\KpiWithDesignation;
use App\Models\Profile;
use App\Models\Technology;
use App\Models\User;
use App\Models\UserHasPta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use RedisTrait;

    public function index(Request $request)
    {
        $roles = Role::all();
        $data = [
            'roles' => $roles,
        ];

        return view('admin.user.index', $data);
    }

    public function fetchData(Request $request)
    {
        try {
            $filter = $request->tableFilterData ?? null;
            $role = $filter['role'] ?? null;
            $status = $filter['status'] ?? null;
            $search = $filter['search'] ?? null;

            $userQuery = User::with(['roles', 'shift', 'pta.ptaUser', 'profile:id,user_id,increment_month']);
            if ($filter) {
                if ($role) {
                    $userQuery = $userQuery->whereHas('roles', function ($query) use ($role) {
                        $query->where('id', $role);
                    });
                }
                if ($status) {
                    if ($status != '2') {
                        $userQuery = $userQuery->where('activated', $status);
                    }
                }
                if ($search) {
                    $userQuery = $userQuery->where(function ($query) use ($search) {
                        $query->orWhere('name', 'LIKE', '%'.$search.'%')
                            ->orWhere('email', 'LIKE', '%'.$search.'%')
                            ->orWhere('username', 'LIKE', '%'.$search.'%')
                            ->orWhere('joining_date', 'LIKE', '%'.$search.'%');
                    });
                }
            }

            $users = $userQuery->paginate($this->getPagination());
            $usersResponse = [
                'data' => $users->map(function ($user) {
                    $ptaNames = $user->pta->pluck('ptaUser.name')->implode(', ');

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'userName' => $user->username,
                        'email' => $user->email,
                        'joining_date' => $user->joining_date ?? '-',
                        'increment_month' => $user->profile->increment_month ?? '-',
                        'shift' => $user->shift->name ?? '-',
                        'activated' => $user->activated == 1 ? 'Active' : 'Inactive',
                        'reason' => $user->reason ?? '-',
                        'ptaName' => $ptaNames !== '' ? $ptaNames : '-',
                        'role' => $user->roles->pluck('name')->first() ? $user->roles->pluck('name')->first() : '-',
                        'avatar' => $user->profile_image_path !== null && $user->profile_image_path !== 'uploads/default_avatar.jpg' ? config('app.IPS_CONNECT_LIVE_URL').$user->profile_image_path : null,
                        // 'avatar' => $user->profile_image_path !== null ? asset('storage/profile-images/'.$user->profile_image_path) : null,
                    ];
                }),
                'st' => $users->firstItem(),
                'button' => generatePaginationArray($users, $users->links()->elements),
                'permission' => [
                    'view' => auth()->user()->hasPermissionTo('view_employee'),
                    'edit' => auth()->user()->hasPermissionTo('edit_employee'),
                ],
                'morePage' => $users->hasPages(),
            ];

            return response()->json(['success' => true, 'data' => $usersResponse]);
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function store(UserRequest $request)
    {
        try {
            $activated = $request->active == 1 ? 1 : 0;
            $user = User::create([
                'username' => trim($request->userName),
                'name' => trim($request->fullName),
                'email' => trim($request->email),
                'password' => hash('sha512', $request->password.config('app.LOGIN_ENC_KEY')),
                'joining_date' => $request->joiningDate,
                'machine_punch_id' => $request->machine_code_id,
                'machine_code_id' => $request->machine_code_id,
                'activated' => $activated,
                'shift_id' => $request->shift,
                'reason' => $request->inactiveReason ?? null,
            ]);
            $role = Role::whereId($request->userRole)->first();
            $user->syncRoles($role);
            if ($request->pta) {
                foreach ($request->pta as $ptaId) {
                    UserHasPta::create([
                        'pta_user_id' => $ptaId,
                        'user_id' => $user->id,
                    ]);
                }

                return response()->json(['success' => true, 'message' => 'User Added Successfully!!', 'data' => $user]);
            }

            return response()->json(['success' => true, 'message' => 'User Added Successfully!!', 'data' => $user]);
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function form(Request $request)
    {
        try {
            $roles = Role::all();
            $ptaRoleName = $this->getPTADesignation();
            $shiftData = EmployeeShift::pluck('name', 'id');
            $ptaUsers = User::whereHas('roles', function ($query) use ($ptaRoleName) {
                $query->where('roles.name', $ptaRoleName);
            })->get();
            $data = [
                'ptaUsers' => $ptaUsers,
                'shiftData' => $shiftData,
                'roles' => $roles,
            ];
            if ($request->ajax()) {
                return response()->json(['success' => true, 'data' => $data]);
            } else {
                return view('admin.user.create', $data);
            }
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function edit($id)
    {
        try {
            $roles = Role::all();
            $user = User::with(['roles', 'profile:id,user_id,increment_month'])->findOrFail($id);

            $ptaRoleName = $this->getPTADesignation();
            $avpRoleName = $this->getAVPDesignation();

            $shiftData = EmployeeShift::pluck('name', 'id');
            $AllPtaUsers = User::whereHas('roles', function ($query) use ($ptaRoleName, $avpRoleName) {
                $query->where('roles.name', $ptaRoleName)->orWhere('roles.name', $avpRoleName);
            })->get();

            if (! $user->pta->isEmpty()) {
                $ptaValues = $user->pta->pluck('pta_user_id')->toArray();
                $ptaUsers = User::whereIn('id', $ptaValues)->get();
            } else {
                $ptaUsers = [];
            }
            $data = [
                'user' => $user,
                'roles' => $roles,
                'pta' => $ptaUsers,
                'AllPtaUser' => $AllPtaUsers,
                'shiftData' => $shiftData,
                'incrementMonth' => $user->profile->increment_month ?? null,
            ];

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::with('profile')->findOrFail($id);

            $role = Role::whereId($request->userRole)->first();
            $user->syncRoles($role);
            // $activated = $request->active == 1 ? 1 : 0;
            // $user->username = trim($request->userName);
            // $user->name = trim($request->fullName);
            // $user->email = trim($request->email);
            // $user->machine_punch_id = $request->machine_punch_id;
            // $user->machine_code_id = $request->machine_code_id;
            // $user->joining_date = $request->joiningDate;
            // $user->activated = $activated;
            // $user->reason = $request->inactiveReason ?? null;
            // $user->shift_id = $request->shift ?? null;
            // $user->save();
            if ($request->userRole) {
                $checkUserExists = DB::table('model_has_roles')->where([
                    'model_type' => 'App\Models\User',
                    'model_id' => $id,
                ])->delete();

                DB::table('model_has_roles')->insert([
                    'role_id' => $request->userRole,
                    'model_type' => 'App\Models\User',
                    'model_id' => $id,
                ]);

                $designations = Profile::$designationsToIgnore;
                if ($user->roles->isNotEmpty() && in_array($user->roles->first()->name, $designations)) {
                    $roleRedisKey = 'Auth_User_Role-'.$user->id;
                    Redis::set($roleRedisKey, $user->roles->first()->name);
                }

            }

            // Update or create profile record with increment month
            $incrementMonth = $request->incrementMonth ? (int) $request->incrementMonth : null;
            Profile::updateOrCreate(['user_id' => $user->id], ['increment_month' => $incrementMonth]);

            if ($request->pta) {
                UserHasPta::where('user_id', $user->id)->delete();
                foreach ($request->pta as $ptaId) {
                    UserHasPta::create([
                        'user_id' => $user->id,
                        'pta_user_id' => $ptaId,
                    ]);
                }
                $avpOrPtaRedisKey = 'Auth_User_Avp_Or_Pta-'.$user->id;
                Redis::set($avpOrPtaRedisKey, $ptaId);

                return response()->json(['success' => true, 'message' => 'User Updated Successfully!!', 'data' => $user]);
            } else {
                UserHasPta::where('user_id', $user->id)->delete();

                return response()->json(['success' => true, 'message' => 'User Updated Successfully!!', 'data' => $user]);
            }
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function getProfile()
    {
        $user = Auth::user();
        $currentYear = date('Y');
        $kpiData = null;
        $roleName = '';
        $user = User::with('pta', 'projects.projectManager')->whereId($user->id)->first();
        $projectManager = array_unique($user->projects->pluck('projectManager.name')->toArray());
        $ptaNames = array_unique($user->pta->pluck('ptaUser.name')->toArray());
        $dbTech = Database::select('id', 'name')->get()->pluck('name', 'id')->toArray();
        $technologies = Technology::select('id', 'name')->get()->pluck('name', 'id')->toArray();
        $profile = Profile::where('user_id', $user->id)->first();
        if ($profile && $profile->intermediate_tech) {
            $profile->intermediate_tech = explode(',', $profile->intermediate_tech);
        }

        if ($profile && $profile->database) {
            $profile->database = explode(',', $profile->database);
        }

        $policyFile = Announcement::where('type', AnnouncementTypeEnum::Policy->value)
            ->whereYear('created_at', $currentYear)
            ->pluck('file_name')
            ->first();

        if ($user->roles->isNotEmpty()) {
            $userRole = $user->roles->first();
            $roleName = $userRole->name;
            $kpiData = KpiWithDesignation::with('category')->where('role_id', $userRole->id)->get();
        }

        return view('admin.user.profile', compact('user', 'projectManager', 'ptaNames', 'dbTech', 'technologies', 'profile', 'roleName', 'kpiData'));
    }

    public function profile(Request $request)
    {
        try {
            $user = auth()->user();
            $data = [];
            $data['primary_tech1'] = $request->primary_tech1;
            $data['primary_tech2'] = $request->primary_tech2;
            $data['intermediate_tech'] = $request->intermediate_tech ? implode(',', $request->intermediate_tech) : '';
            $data['database'] = $request->database ? implode(',', $request->database) : '';
            $data['before_ips_exp_year'] = $request->before_ips_exp_year;
            $data['before_ips_exp_month'] = $request->before_ips_exp_month;

            if (! empty($data)) {
                $data['user_id'] = $user->id;
                $profile = Profile::updateOrCreate(['user_id' => $user->id], $data);
            }

            session()->forget('profile');
            Redis::set('profileDes-'.$user->id, true);

            if ($request->primary_tech1) {
                Redis::set('Auth_User_Primary_Tech-'.$user->id, $request->primary_tech1);
            }

            return response()->json(['success' => true, 'message' => 'User Profile Updated Successfully!!']);
        } catch (\Throwable $th) {
            report($th);
            abort(500);
        }
    }

    public function getAllActiveUsers(Request $request)
    {
        $users = User::select('id', 'name')->where('activated', 1)->where('name', 'LIKE', "%$request->term%")->get();

        return response()->json($users);
    }

    public function getAllActiveUsersForTeam(Request $request)
    {
        $filterUsers = [];
        $user = auth()->user();
        $avpRole = $this->getAVPDesignation();
        $ptaRole = $this->getPTADesignation();
        $isAvp = checkUserIsAvp($avpRole);
        $isPta = checkUserIsPta($ptaRole);

        if ($isAvp) {
            $ptaIds = [];
            $ptaIds = getAssignedPtaIdsForAvp($user->id);
            $userHasPtaForAvp = listOfUsersForAvp($ptaIds);
            $filterUsers = array_merge($ptaIds, $userHasPtaForAvp);
        } elseif ($isPta) {
            $filterUsers = listOfUsersForAvp([$user->id]);
        }

        $users = User::select('id', 'name')->where('activated', 1);
        if ($isAvp || $isPta) {
            $users = $users->whereIn('id', $filterUsers);
        }

        $users = $users->where('name', 'LIKE', "%$request->term%")->get();

        return response()->json($users);
    }

    public function fetchUserForAttendanceManage(Request $request)
    {
        $user = auth()->user();
        $userID = $user->id;
        $activatedUsers = User::select('id', 'name')->where('activated', 1)->where('name', 'LIKE', "%$request->term%");
        if ($user->hasPermissionTo('manage_attendance_for_team') && ! ($user->hasPermissionTo('manage_attendance'))) {
            // checking current user is head
            $salesHeadData = getTeamMembersForSalesHead();
            $isSalesHead = $salesHeadData['isSalesHead'];
            $salesEmployeeIds = $salesHeadData['salesTeamIds'];
            if ($isSalesHead) {
                $activatedUsers = $activatedUsers->whereIn('id', $salesEmployeeIds);
            } else {

                $avpRole = $this->getAVPDesignation();
                $isAvp = checkUserIsAvp($avpRole);
                $ptaIds = [];
                $userIdsForAvp = [];

                $currentUser = auth()->user();
                if ($isAvp) {
                    $ptaIds = getAssignedPtaIdsForAvp($currentUser->id);
                    $userHasPtaForAvp = listOfUsersForAvp($ptaIds);
                    $userIdsForAvp = array_merge($ptaIds, $userHasPtaForAvp);
                }
                $usersHasPta[] = $userID;
                $ptaIds[] = $userID;

                $usersHasPta = listOfUsersForPta($userID);
                $usersHasPta = array_merge($usersHasPta, $userIdsForAvp);

                array_push($usersHasPta, $userID);
                $activatedUsers = $activatedUsers->where(function ($query) use ($ptaIds, $usersHasPta) {
                    $query->orWhereIn('id', $usersHasPta)->orWhereHas('projects', function ($q) use ($ptaIds) {
                        $q->whereIn('pm_user_id', $ptaIds);
                    });
                });

            }

        }
        $activatedUsers = $activatedUsers->get();

        return response()->json($activatedUsers);
    }

    public function fetchUserForLeave(Request $request)
    {
        $user = auth()->user();
        $userID = $user->id;
        $activatedUsers = User::select('id', 'name')->where('activated', 1)->where('name', 'LIKE', "%$request->term%");
        if ($user->hasPermissionTo('manage_leave_for_team') && ! ($user->hasPermissionTo('manage_leave_for_all'))) {
            // checking current user is head
            $salesHeadData = getTeamMembersForSalesHead();
            if ($salesHeadData['isSalesHead']) {
                $activatedUsers = $activatedUsers->whereIn('id', $salesHeadData['salesTeamIds']);
            } else {

                $avpRole = $this->getAVPDesignation();
                $isAvp = checkUserIsAvp($avpRole);
                $ptaIds = [];
                $userIdsForAvp = [];

                $currentUser = auth()->user();
                if ($isAvp) {
                    $ptaIds = getAssignedPtaIdsForAvp($currentUser->id);
                    $userHasPtaForAvp = listOfUsersForAvp($ptaIds);
                    $userIdsForAvp = array_merge($ptaIds, $userHasPtaForAvp);
                }

                $usersHasPta[] = $userID;
                $ptaIds[] = $userID;

                $usersHasPta = listOfUsersForPta($userID);
                $usersHasPta = array_merge($usersHasPta, $userIdsForAvp);

                array_push($usersHasPta, $userID);
                $activatedUsers = $activatedUsers->where(function ($query) use ($ptaIds, $usersHasPta) {
                    $query->orWhereIn('id', $usersHasPta)->orWhereHas('projects', function ($q) use ($ptaIds) {
                        $q->whereIn('pm_user_id', $ptaIds);
                    });
                });
            }

        }
        $activatedUsers = $activatedUsers->get();

        return response()->json($activatedUsers);
    }

    public function passwordChange(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'password' => 'required|string|confirmed',
        ]);

        $user = Auth::user();
        $oldPassword = hash('sha512', $request->old_password.config('app.LOGIN_ENC_KEY'));
        if ($oldPassword != $user->password) {
            return response()->json(['success' => false, 'message' => 'The old password is incorrect.']);
        }
        $user->password = hash('sha512', $request->password.config('app.LOGIN_ENC_KEY'));
        $user->save();

        return response()->json(['success' => true, 'message' => 'Password updated successfully.']);
    }
}
