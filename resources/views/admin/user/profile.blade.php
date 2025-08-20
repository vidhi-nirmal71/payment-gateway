@extends('admin.layout.master', ['title' => 'Profile Details'])

@section('head')
    <link rel="stylesheet" href="{{ asset('admin/css/select2.css') }}">
    <style>
        #password-error{ width: 100%; }
        .select2-container{ width: 100% !important; }
    </style>
@endsection

@section('content')
    <div class="row">
        <div class="card mb-4">
            <form action="{{route('user.storeProfile')}}" method="POST" id="profileForm" enctype="multipart/form-data" class="fv-plugins-bootstrap5 fv-plugins-framework" novalidate="novalidate">
                @csrf
                <div class="card-body">
                    <div class="d-flex gap-4 align-items-center justify-content-between flex-wrap">
                        <div class="d-flex gap-4 align-items-center">
                            <img src="{{ $user->profile_image_path ? config('app.IPS_CONNECT_LIVE_URL').$user->profile_image_path : url('/img/avatar.jpg')}}" alt="Avatar" class="d-block rounded" height="100" width="100" id="imageUploadedAvatar">
                            <p class="mb-0 fw-bold">{{ Auth::user()->roles->pluck('name')[0] ?? '' }}
                                @if(isset($kpiData) && !$kpiData->isEmpty())
                                    <br> <button type="button" class="btn btn-outline-primary me-1 mt-3" id="showKpi">View KPI</button>
                                @endif
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="row">
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="name" class="form-label">Name</label>
                            <input class="form-control" type="hidden" id="userId" name="userId" value="{{$user->id}}">
                            <input class="form-control" type="text" id="name" name="name" value="{{$user->name}}" autofocus="" readonly>
                            <div class="error-message text-danger" id="name-error"></div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="email" class="form-label">E-mail</label>
                            <input class="form-control" type="text" id="email" name="email" value="{{$user->email}}" placeholder="example@itpathsolutions.com" readonly>
                            <div class="error-message text-danger" id="email-error"></div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-4 col-lg-2">
                            <label class="form-label" for="mobileNumber">Mobile Number</label>
                            <input type="number" id="mobileNumber" name="mobileNumber" value="{{$user->mobile_number}}" class="form-control" placeholder="" readonly>
                            <div class="error-message text-danger" id="mobileNumber-error"></div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-4 col-lg-2">
                            <label for="doj" class="form-label">Date Of Joining</label>
                            <input type="date" class="form-control" id="doj" name="doj" value="{{$user->joining_date}}" max="{{ date('Y-m-d') }}" readonly>
                            <div class="error-message text-danger" id="doj-error"></div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-4 col-lg-2">
                            <label for="dob" class="form-label">Date Of Birth</label>
                            <input type="date" class="form-control" id="dob" name="dob" value="{{$user->date_of_birth}}" max="{{ date('Y-m-d') }}" readonly>
                            <div class="error-message text-danger" id="dob-error"></div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="priTech1" class="form-label">Primary Technology 1 <span class="text-danger">*</span></label>
                            <select name="primary_tech1" class="form-select" id="priTech1">
                                <option value="">Select Technology</option>
                                @foreach($technologies as $techId => $techName)
                                    <option value="{{$techId}}" {{ ($profile && $profile->primary_tech1 == $techId) ? 'selected' : '' }}>{{$techName}}</option>
                                @endforeach
                            </select>
                            <div class="error-message text-danger" id="priTech1-error"></div>
                        </div>

                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="priTech2" class="form-label">Primary Technology 2</label>
                            <select name="primary_tech2" class="form-select" id="priTech2">
                                <option value="">Select Technology</option>
                                @foreach($technologies as $techId => $techName)
                                    <option value="{{$techId}}" {{ ($profile && $profile->primary_tech2 == $techId) ? 'selected' : '' }}>{{$techName}}</option>
                                @endforeach
                            </select>
                            <div class="error-message text-danger" id="priTech2-error"></div>
                        </div>

                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="intermediateTech" class="form-label">Intermediate Technology</label>
                            <select name="intermediate_tech[]" class="form-select" id="intermediateTech" multiple>
                                <option value="">Select Technology</option>
                                @foreach($technologies as $techId => $techName)
                                    <option value="{{$techId}}" {{ ($profile && $profile->intermediate_tech && in_array($techId, $profile->intermediate_tech)) ? 'selected' : '' }}>{{$techName}}</option>
                                @endforeach
                            </select>
                            <div class="error-message text-danger" id="intermediateTech-error"></div>
                        </div>

                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="database" class="form-label">Database</label>
                            <select name="database[]" class="form-select" id="database" multiple>
                                @foreach($dbTech as $dbId => $dbName)
                                    <option value="{{$dbId}}" {{ ($profile && $profile->database && in_array($dbId, $profile->database)) ? 'selected' : '' }}>{{$dbName}}</option>
                                @endforeach
                            </select>
                            <div class="error-message text-danger" id="database-error"></div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="before_ips_exp_year" class="form-label mb-0">Experience Before IPS <span class="text-danger">*</span></label>
                            <div class="d-flex justify-content-between">
                                <div class="col-sm-12 col-md-5 col-lg-5">
                                    <label for="before_ips_exp_year" class="form-label mb-0">Year</label>
                                    <select name="before_ips_exp_year" class="form-select" id="before_ips_exp_year">
                                        @for($year = 0; $year <= 20; $year++)
                                            <option value="{{$year}}" {{ ($profile && $profile->before_ips_exp_year == $year) ? 'selected' : '' }}>{{$year}}</option>
                                        @endfor
                                    </select>
                                </div>
                                <div class="col-sm-12 col-md-5 col-lg-5">
                                    <label for="before_ips_exp_month" class="form-label mb-0">Month</label>
                                    <select name="before_ips_exp_month" class="form-select" id="before_ips_exp_month">
                                        @for($month = 0; $month <= 11; $month++)
                                            <option value="{{$month}}" {{ ($profile && $profile->before_ips_exp_month == $month) ? 'selected' : '' }}>{{$month}}</option>
                                        @endfor
                                    </select>
                                </div>
                            </div>
                            <div class="error-message text-danger" id="before_ips_exp_month-error"></div>
                        </div>

                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="ptaNames" class="form-label">PTA</label>
                            @foreach ($ptaNames as $pta)
                                <li class="1menu-item">{{$pta}}</li>
                            @endforeach
                        </div>

                        <div class="mb-3 col-sm-12 col-md-6 col-lg-3">
                            <label for="pm" class="form-label">Project Manager</label>
                            @foreach ($projectManager as $pta)
                                <li class="1menu-item">{{$pta}}</li>
                            @endforeach
                        </div>
                    </div>

                    <div class="mt-2">
                        <button type="button" class="btn btn-primary me-2" id="saveProfileInfo">Update Profile</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    {{--Below Code for edit timesheet form--}}
    <div class="modal fade" id="profileFillAlert" tabindex="-1" aria-hidden="true" style="display: none;" data-bs-backdrop="static">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-danger">Warning!!!</h5>
                    <button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pb-0" id="profile-fill-model">
                    <h6>Please fill in your profile before proceeding further, otherwise you will not be able to move to another page.</h6>
                    <p><b>Primary technology 1</b> and <b>Experience before IPS</b> are required fields.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-modal-btn" data-bs-dismiss="modal">Ok</button>
                </div>
            </div>

        </div>
    </div>

    <div class="modal fade" id="profileKpiDetails" tabindex="-1" aria-hidden="true" style="display: none;" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $roleName ?? '' }} KPI</h5>
                    <button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pb-0" id="profile-kpi-model">
                    <div class="pdf-container">
                        @if(isset($kpiData) && $kpiData != null)
                            <table border="1" style="border-collapse: collapse; width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid black;" class="ps-2">Category</th>
                                        <th style="border: 1px solid black;" class="ps-2">KPI</th>
                                        <th style="border: 1px solid black;" class="ps-2">Default Weightage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                @php
                                    $previousCategory = null;
                                    $categoryRowSpan = [];
                                    foreach ($kpiData as $kpi) {
                                        $category = $kpi->category->name;
                                        $categoryRowSpan[$category] = ($categoryRowSpan[$category] ?? 0) + 1;
                                    }
                                @endphp

                                @foreach($kpiData as $kpi)
                                <tr>
                                    @if ($kpi->category->name !== $previousCategory)
                                        <td style="border: 1px solid black;" class="ps-2" rowspan="{{ $categoryRowSpan[$kpi->category->name] }}">
                                            {{ $kpi->category->name }}
                                        </td>
                                        @php
                                            $previousCategory = $kpi->category->name;
                                        @endphp
                                    @endif
                                    <td style="border: 1px solid black;" class="ps-2">{{ $kpi->kpi_details }}</td>
                                    <td style="border: 1px solid black;" class="ps-2">{{ $kpi->default_weightage }}</td>
                                </tr>
                                @endforeach
                                </tbody>
                            </table>
                        @endif              
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-modal-btn" data-bs-dismiss="modal">Ok</button>
                </div>
            </div>
        </div>
    </div>

    {{-- <hr class="my-0"> --}}

    {{-- <div class="row">
        <div class="card mb-4">
            <h5 class="card-header">Change Password</h5>
            <!-- Change password -->
            <form action="{{route('user.passwordChange')}}" method="POST" id="passwordChange" enctype="multipart/form-data" class="fv-plugins-bootstrap5 fv-plugins-framework" novalidate="novalidate">
                @csrf
                <div class="card-body flex">
                    <div class="row">
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-4">
                            <label for="name" class="form-label">Old Password <span class="text-danger">*</span></label>
                            <input class="form-control" type="password" id="old_password" name="old_password" placeholder="Enter current password" autocomplete=''>
                            <div class="error-message text-danger" id="old-password-error"></div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-4" id="passwordinputfield">
                            <label for="password" class="form-label">New Password <span class="text-danger">*</span></label>
                            <div class="input-group col-md-12">
                                <input class="form-control" name="password" type="password" id="password" placeholder="Enter new password" required="" autocomplete=''>
                                <span class="input-group-text search" title="Hide/Show Password"><i id="showPassword" class="tf-icons bx bx-hide cursor-pointer"></i></span>
                                <span class="input-group-text search" title="Random Password Generate" style="border-bottom-right-radius: 0.375rem; border-top-right-radius: 0.375rem;"><i id="autoGeneratePassword" style="font-weight: 500; font-size: 1.2rem !important;" class="tf-icons bx bx-key cursor-pointer"></i></span>
                                <div class="error-message text-danger" id="password-error"></div>
                            </div>
                        </div>
                        <div class="mb-3 col-sm-12 col-md-6 col-lg-4">
                            <label for="password_confirmation" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                            <input class="form-control" type="password" id="password_confirmation" name="password_confirmation" placeholder="Enter confirm password" required autocomplete=''>
                            <div class="error-message text-danger" id="password_confirmation-error"></div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <button type="button" class="btn btn-primary me-2" id="changePasswordBtn">Change Password</button>
                    </div>
                </div>
            </form>
        </div>
    </div> --}}
@endsection

@section('script')
    <script> 
        const technology = @json($technologies);
        var profileEmpty = {{ session()->has('profile') ? '1' : '0' }};
    </script>
    <script src="{{ asset('admin/js/select2.js') }}?v=0.1"></script>
    <script src="{{ asset('admin/js/custom/profile.js') }}?v=0.01"></script>
    
    <script>
        const kpiData = @json($kpiData);
        //KPI
        $('#showKpi').on('click', function () {
            if (!kpiData || Object.keys(kpiData).length === 0) {
                errorMessage('KPI data not found.');
            } else {
                $('#profileKpiDetails').modal('show');
            }
        });
    </script>    
@endsection