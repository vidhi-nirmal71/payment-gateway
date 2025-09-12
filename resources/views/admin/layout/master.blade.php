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
                                        <a class="dropdown-item" href="#">
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
    <script src="{{ asset('admin') }}/js/common.js?v=0.01"></script>
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

<!-- PostHog Analytics -->
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init("{{ config('services.posthog.api_key') }}", {
        api_host: "{{ config('services.posthog.host') }}",
        autocapture: true,
        capture_pageview: true,
        session_recording: true,
    });

    @if(auth()->check())
        posthog.identify("{{ auth()->user()->id }}", {
            name: "{{ auth()->user()->name }}",
            email: "{{ auth()->user()->email }}"
        });
    @endif
</script>
  
    <script src="{{ asset('admin/js/confetti.browser.min.js') }}"></script>
    @yield('script')

    @stack('scripts')

</body>

</html>