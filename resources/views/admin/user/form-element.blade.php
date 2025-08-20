<div class="col-sm-12">
    <form action="{{ route('user.store') }}" method="POST" id="new-user-form" enctype="multipart/form-data">
        @csrf
        <div class="mb-4">
            <div class="mt-2">
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Name </label>
                    <div class="col-md-8">
                        <input name="fullName" class="form-control" type="text" value="" id="fullName" placeholder="Enter Full Name" readonly>
                        <div class="error-message text-danger" id="fullName-error"></div>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Email </label>
                    <div class="col-md-8">
                        <input name="email" class="form-control" type="email" value="" id="email" placeholder="Enter Email" readonly>
                        <div class="error-message text-danger" id="email-error"></div>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">User Name </label>
                    <div class="col-md-8">
                        <input name="userName" class="form-control" type="text" value="" id="userName" placeholder="Enter User Name" autocomplete="off" readonly>
                        <div class="error-message text-danger" id="userName-error"></div>
                    </div>
                </div>
                <div class="mb-3 row" id="passwordinputfield">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Password </label>
                    <div class="input-group col-md-8">
                        <input class="form-control" name="password" type="password" value="" id="password" placeholder="Enter Password" autocomplete="off" required>
                        <span class="input-group-text search" title="Hide/Show Password"><i id="showPassword" class="tf-icons bx bx-hide cursor-pointer"></i></span>
                        <span class="input-group-text search cursor-pointer" id="autoGeneratePassword" title="Random Password Generate" style="border-bottom-right-radius: 0.375rem; border-top-right-radius: 0.375rem;"><i style="font-weight: 500; font-size: 1.2rem !important;" class="tf-icons bx bx-key"></i></span>
                        <div class="error-message text-danger" id="password-error"></div>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Joining Date </label>
                    <div class="col-md-8">
                    <input class="form-control" name="joiningDate" type="date" value="" id="joiningDate" readonly>
                    <div class="error-message text-danger" id="joiningDate-error"></div>
                    </div>
                </div>

                <div class="mb-3 row" id="increment_month">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Increment Month <span class="text-danger">*</span></label>
                    <div class="col-md-8">
                        <select class="form-select" id="incrementMonth" name="incrementMonth" required>
                            <option selected disabled>Select Increment Month</option>
                            @for($i = 1; $i <= 12; $i++)
                                <option value="{{ $i }}">{{ $i }}</option>
                            @endfor
                        </select>
                    </div>
                </div>

                <div class="mb-3 row" id="Roles">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end"><b>Select User Role <span class="text-danger">*</span></b></label>
                    <div class="col-md-8">
                        <select class="form-select select2" id="userRole" name="userRole" required>
                            @isset($roles)
                                <option value="" selected disabled>Select User Role</option>
                                @foreach ($roles as $role)
                                <option value="{{$role->id}}">{{$role->name}}</option>
                                @endforeach
                            @endisset
                        </select>
                    </div>
                </div>
                <div class="mb-3 row" id="PTA">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end"><b>Select PTA / AVP</b></label>
                    <div class="col-md-8">
                        <select class="select2 form-select multiple" id="pta" name="pta[]" multiple>
                            @isset ($ptaUsers)
                                @foreach ($ptaUsers as $ptaUser)
                                <option value="{{$ptaUser->id}}">{{$ptaUser->name}}</option>
                                @endforeach
                            @endisset
                        </select>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Machine Punch Id</label>
                    <div class="col-md-8">
                        <input name="machine_punch_id" class="form-control" type="number" value="" min="0" id="machine_punch_id" placeholder="Enter Machine Punch Id" readonly>
                        <div class="error-message text-danger" id="machine_punch_id-error"></div>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Machine Code Id</label>
                    <div class="col-md-8">
                        <input name="machine_code_id" class="form-control" type="number" value="" min="0" id="machine_code_id" placeholder="Enter Machine Code Id" readonly>
                        <div class="error-message text-danger" id="machine_code_id-error"></div>
                    </div>
                </div>
                <div class="mb-3 row" id="userShift">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end">Shift </label>
                    <div class="col-md-8">
                        <select class="select2 form-select" id="shiftId" name="shift" disabled>
                            <option value="" selected disabled>Select Shift</option>
                            @isset ($shiftData)
                                @foreach ($shiftData as $key => $shift)
                                <option value="{{$key}}">{{$shift}}</option>
                                @endforeach
                            @endisset
                        </select>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end" for="activeswitch">Active </label>
                    <div class="col-md-8">
                        <div class="form-check form-switch">
                            <input class="form-check-input mt-1" type="checkbox" id="activeswitch" name="active" value="1" checked>
                        </div>
                        <div class="error-message text-danger" id="activeswitch-error"></div>
                    </div>
                </div>
                <div class="mb-3 row inactiveReasonBlock" style="display: none">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end" for="inactiveReason">In Active Reason</label>
                    <div class="col-md-8">
                        <textarea class="form-control" id="inActiveReason" name="inactiveReason"></textarea>
                        <div class="error-message text-danger" id="inActiveReason-error"></div>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="html5-text-input" class="col-md-3 col-form-label text-lg-end"></label>
                    <div class="col-md-8">
                        <button type="button" id="saveUserForm" class="btn btn-primary saveUserForm">Save</button>
                    </div>
                </div>
            </div>                   
        </div>
    </form>
</div>
