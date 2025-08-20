<?php $user = auth()->user(); ?>

<nav class="layout-navbar container-fluid navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme navbar-light bg-light"
    id="layout-navbar">
    <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
            <i class="bx bx-menu bx-sm"></i>
        </a>
    </div>

    <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">


        <div class="navbar-nav align-items-center">
            <div class="nav-item d-flex align-items-center">
                <h4 class="mb-0">
                    @yield('page-header')
                </h4>
            </div>
        </div>

        <ul class="navbar-nav flex-row align-items-center ms-auto">

            <li class="nav-item lh-1 me-3">
                <span></span>
            </li>

            <li class="nav-item navbar-dropdown dropdown-user dropdown">
                <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <div class="avatar avatar-online">
                        <img src="{{ $user->userDetail->avatar_url }}" alt class="w-px-40 h-auto rounded-circle" />
                    </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" href="#">
                            <div class="d-flex">
                                <div class="flex-grow-1">
                                    <span class="fw-semibold d-block">{{ $user->username }}</span>
                                </div>
                            </div>
                        </a>
                    </li>                  
                    <li>
                        <a class="dropdown-item" href="{{ route('logout') }}">                            
                            <span class="align-middle">Log Out</span>
                        </a>
                    </li>
                </ul>
            </li>
            <!--/ User -->
        </ul>
    </div>
</nav>
