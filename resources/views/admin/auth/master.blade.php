<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>{{ config('app.name') }}</title>

    <meta name="description" content="" />
    {{-- <link rel="shortcut icon" href="{{ asset('img/workspace-fav.png') }}" type="image/png"> --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/fonts/boxicons.css" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/core.css?v=0.026" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/theme-default.css?v=0.1" class="template-customizer-theme-css" />

    {{-- <link rel="stylesheet" href="{{ asset('admin/css/demo.css') }}"> --}}


    <script src="{{ asset('admin/js/helpers.js') }}?v=0.02"></script>
    <script src="{{ asset('admin/js/config.js') }}?v=0.1"></script>

    @yield('head')

</head>

<body>

    <div class="layout-wrapper layout-content-navbar">
        <div class="layout-container">

            <div class="layout-page">             

                <div class="content-wrapper">
                    <div class="container-fluid flex-grow-1 container-p-y">
                        @yield('content')
                    </div>
                </div>

                <div id="page-loader" style="display: none">
                    <div class="loader"></div>
                </div>
            </div>
        </div>
    </div>



    <script src="{{ asset('admin') }}/vendor/libs/jquery/jquery.js"></script>
    <script src="{{ asset('admin') }}/vendor/js/bootstrap.js"></script>

    <script>
        $("#logout").click(function() {
            window.location = '{{ route('logout') }}';
        })
    </script>

    @yield('script')
    @stack('scripts')

</body>

</html>
