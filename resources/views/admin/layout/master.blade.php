<!DOCTYPE html>
<html lang="en" class="light-style layout-navbar-fixed layout-compact layout-menu-fixed"  data-theme="theme-default" data-style="light" data-template="vertical-menu-template" dir="ltr">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>{{ config('app.name') }}</title>

    <meta name="description" content="" />
    {{-- <link rel="shortcut icon" href="{{ asset('img/workspace-fav.png') }}" type="image/png"> --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap" rel="stylesheet">

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/fonts/boxicons.css" />
    <style>
        .cakeHeader h1{
            font-size: 5rem !important;
        }
        /* .mainBodyContent{
            padding-right: 1rem !important;
            padding-left: 1rem !important;
        } */
    </style>

    <!-- Core CSS -->
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/core.css?v=0.026" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/theme-default.css?v=0.1" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="{{ asset('admin/css/demo.css?v=0.05') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/perfect-scrollbar.css') }}">    

    <script src="{{ asset('admin/js/helpers.js') }}?v=0.02"></script>
    <script src="{{ asset('admin/js/config.js') }}?v=0.1"></script>

    @yield('head')

</head>

<body>
    <div class="layout-wrapper layout-content-navbar user-workspace">
        <div class="layout-container">
            @include('admin.layout.sidebar')
            @include('admin.layout.custom_alert_popup'){{-- Alert popup --}}
            <div class="layout-page">
                <nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
                    <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
                        <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
                            <i class="bx bx-menu bx-sm"></i>
                        </a>
                    </div>
                    <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                        <div class="navbar-nav align-items-center">
                            <div class="nav-item d-flex align-items-center">
                                <a href="{{$href ?? ''}}" class="card-header cardHeader masterLinkTitle">{{$title ?? ''}}</a>
                            </div>
                        </div>
                        <ul class="navbar-nav flex-row align-items-center ms-auto">
                            <li class="nav-item navbar-dropdown dropdown-user dropdown">
                                <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                                    <div class="avatar avatar-online">
                                        <img src="{{ Auth::user()->profile_image_path ? config('app.IPS_CONNECT_LIVE_URL').Auth::user()->profile_image_path : url('/img/avatar.jpg') }}" alt class="rounded-circle" width='40' heigh='40' id="navbarMainAvtarId" />
                                        {{-- <img src="{{ Auth::user()->profile_image_path ? asset('storage/profile-images/'.Auth::user()->profile_image_path) : url('/img/avatar.jpg') }}" alt class="rounded-circle" width='40' heigh='40' id="navbarMainAvtarId" /> --}}
                                    </div>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="{{route('user.profile')}}">
                                            <div class="d-flex">
                                                <div class="flex-shrink-0 me-3">
                                                    <div class="avatar avatar-online">
                                                        <img src="{{ Auth::user()->profile_image_path ? config('app.IPS_CONNECT_LIVE_URL').Auth::user()->profile_image_path : url('/img/avatar.jpg') }}" alt class="rounded-circle" width='40' heigh='40' id="navbarProfileAvtarId" />
                                                        {{-- <img src="{{ Auth::user()->profile_image_path ? asset('storage/profile-images/'.Auth::user()->profile_image_path) : url('/img/avatar.jpg') }}" alt class="rounded-circle" width='40' heigh='40' id="navbarProfileAvtarId" /> --}}
                                                    </div>
                                                </div>
                                                <div class="flex-grow-1">
                                                    <span class="fw-semibold d-block">{{ Auth::user()->name ?? '' }}</span>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <div class="dropdown-divider"></div>
                                    </li>
                                    <li>
                                        <a class="dropdown-item logoutBtn" href="javascript:void(0)" data-href="{{ route('logout') }}">
                                            <i class="bx bx-power-off me-2"></i>
                                            <span class="align-middle">Log Out</span>
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div class="content-wrapper ">
                    {{-- container-p-y --}}
                    <div class="container-xxl flex-grow-1 container-p-y mainBodyContent">
                        @yield('content')
                        
                        <!-- Toast with Placements -->
                        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
                            <div class="bs-toast toast m-2" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000" id="AppToast">
                                <div class="toast-header">
                                    <div class="me-auto fw-semibold"></div>
                                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                                </div>
                                <div class="toast-body" id="toastContent">
                                </div>
                            </div>
                        </div>
                        <!-- Toast with Placements -->
                    </div>
                </div>
                <div id="page-loader" style="display: none">
                    <div class="loader"></div>
                </div>
            </div>
        </div>
        <div class="layout-overlay layout-menu-toggle"></div>
    </div>

    {{-- Birthday wish model --}}
    @php
        $isYourBirthday = false;
        $isYourBirthdayBelated = false;
        if(auth()->user()->date_of_birth){
            $dateOfBirth = Carbon\Carbon::createFromFormat('Y-m-d', auth()->user()->date_of_birth);
            $today = Carbon\Carbon::now();
            if ($dateOfBirth->format('md') === $today->format('md')) {
                //today is user's birthday
                $isYourBirthday = true; 
            }else{
                // belated birthday logic
                $today = Carbon\Carbon::now();
                $lastWorkingDay = getLastWorkingDay($today);
                $dob = Carbon\Carbon::parse(auth()->user()->date_of_birth);

                $month = $dob->format('m');
                $day = $dob->format('d');
                $currentYear = $today->year;

                $dob = Carbon\Carbon::create($currentYear, $month, $day);
                if ($dob->between($lastWorkingDay, $today)) {
                    $isYourBirthdayBelated = true;
                }
            }
        }

    @endphp

    {{-- Work anniversary model --}}
    @php
        $isYourWorkAnniversaryDay = false;
        $isYourWorkAnniversaryDayBelated = false;

        if(auth()->user()->joining_date){
            $dateOfWorkAnn = Carbon\Carbon::createFromFormat('Y-m-d', auth()->user()->joining_date);
            $today = Carbon\Carbon::now();
            if ($dateOfWorkAnn->format('md') === $today->format('md') && $dateOfWorkAnn->year < $today->year) {
                //today is user's Work Anniversary
                $isYourWorkAnniversaryDay = true; 
            }else{
                // belated Work Anniversary logic
                $today = Carbon\Carbon::now();
                $lastWorkingDay = getLastWorkingDay($today);
                $dob = Carbon\Carbon::parse(auth()->user()->joining_date);

                $month = $dob->format('m');
                $day = $dob->format('d');
                $currentYear = $today->year;

                $dob = Carbon\Carbon::create($currentYear, $month, $day);
                if ($dob->between($lastWorkingDay, $today) && $dateOfWorkAnn->year < $today->year) {
                    $isYourWorkAnniversaryDayBelated = true;
                }
            }
        }
    @endphp

    @if($isYourBirthday || $isYourBirthdayBelated)
        <div class="modal fade show" id="birthdayModal" tabindex="-1" style="display: none;" aria-modal="true" role="dialog" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">&nbsp;</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-xl-0">
                        <div class="row">
                            <div class="col-12 col-lg-12">
                                <div class="d-flex justify-content-center">
                                    <div class="cakeHeader"><h1> 🎂 </h1></div>
                                </div>
                                <div class="text-center">
                                    @if($isYourBirthday)
                                        <h3>Happy Birthday {{auth()->user()->name}}!!! 🎊 🎉 🥳</h3>
                                        <p class="mb-lg-0">Be happy! Today is the day you were brought into this world to be a blessing and inspiration to the people around you! You are a wonderful person! May you be given more birthdays to fulfill all of your dreams!</p>

                                    @elseif($isYourBirthdayBelated)
                                        <h3>Belated Happy Birthday {{auth()->user()->name}}!!! 🎊 🎉 🥳</h3>
                                        <p class="mb-lg-0">Though it's late, know that you are a blessing and inspiration to those around you. Wishing you joy and fulfillment as you continue on your journey. May the year ahead be filled with all your dreams coming true!</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

    @if($isYourWorkAnniversaryDay || $isYourWorkAnniversaryDayBelated)
        <div class="modal fade show" id="workAnniversaryModal" tabindex="-1" style="display: none;" aria-modal="true" role="dialog" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">&nbsp;</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-xl-0">
                        <div class="row">
                            <div class="col-12 col-lg-12">
                                <div class="d-flex justify-content-center">
                                    <div class="cakeHeader"><h1> 🎂 </h1></div>
                                </div>
                                <div class="text-center">
                                    @if($isYourWorkAnniversaryDay)
                                        <h3>Happy Work Anniversary {{auth()->user()->name}}!!! 🎊 🎉 🥳</h3>
                                        <p class="mb-lg-0">✨ You've been an integral part of our journey, and we're grateful for your contributions. Wishing you continued success and growth! 🌟</p>
                                    @elseif($isYourWorkAnniversaryDayBelated)
                                        <h3>Belated Happy Work Anniversary {{auth()->user()->name}}!!! 🎊 🎉 🥳</h3>
                                        <p class="mb-lg-0">🎉 Congratulations on your work anniversary, {{auth()->user()->name}}! Your dedication and hard work continue to inspire us all. Here's to many more successful years together! 🏆</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

    {{-- Birthday and Workanniversary wishes --}}
    <div class="modal fade" id="celebrationModal" tabindex="-1" style="display: none;" aria-modal="true" role="dialog" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-xl-0" id="celebrationContent">
                    <!-- Content will be injected by JS -->
                </div>
            </div>
        </div>
    </div>

    <script> var APP_URL = "{{ URL::to('/') }}";</script>
    <script src="{{ asset('admin') }}/js/jquery.min.js"></script>
    <script src="{{ asset('admin') }}/vendor/js/bootstrap.js"></script>
    <script src="{{ asset('admin') }}/js/jquery-ui.js"></script>
    <script src="{{ asset('admin/js/perfect-scrollbar.js') }}?v=0.1"></script>
    <script src="{{ asset('admin') }}/js/ui-toasts.js"></script>
    {{-- <script src="{{ asset('admin/js/button.js') }}?v=0.1"></script> --}}
    <script src="{{ asset('admin/js/menu.js') }}?v=0.1"></script>
    <script src="{{ asset('admin/js/main.js') }}?v=0.1"></script>
    <script src="{{ asset('admin/js/app.js') }}?v=0.23"></script>

    <script src="{{ asset('admin') }}/js/jquery.validate.min.js?v=0.1"></script>
    <script src="{{ asset('admin') }}/js/additional-methods.min.js"></script>
    <script src="{{ asset('admin') }}/js/jquery.form.min.js"></script>
    <script src="{{ asset('admin') }}/js/common.js?v=0.05"></script>
    {{-- <script src="https://js.pusher.com/7.2/pusher.min.js"></script> --}}
    {{-- <script>
        var userID = {{ json_encode(Auth::id()) }};
    
        var pusher = new Pusher('6a3053a1195f337f3607', {
            cluster: 'mt1'
        });
    
        var channel = pusher.subscribe('reminder-channel-' + userID);
        channel.bind('reminder-event-' + userID, function(data) {
            alert(JSON.stringify(data));
        });
    </script> --}}
    <script>
        @if (session('message'))
            showToast('bg-success', "{{ session('message') }}");
        @endif

        @if (session('error'))
            showToast('bg-danger', "{{ session('error') }}");
        @endif

        $('#AppToast').on('hidden.bs.toast', function () {
            $('.toast').removeClass('bg-danger bg-success');
        });
    </script>
    <script src="{{ asset('admin/js/confetti.browser.min.js') }}"></script>
    @yield('script')

    @stack('scripts')

</body>

</html>