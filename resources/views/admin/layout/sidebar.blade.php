<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme" data-bg-class="bg-menu-theme" style="touch-action: none; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
    <div class="app-brand demo">
        {{-- <a href="{{ url('/') }}" class="app-brand-link christmasLogo" style="display:none;">
            <span class="app-brand-logo demo"></span> --}}
            <span class="app-brand-text demo menu-text fw-bolder text-uppercase">
                {{ config('app.name') }}
            </span>
        {{-- </a> --}}
        <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
            <i class="bx bx-chevron-left bx-sm d-flex align-items-center justify-content-center"></i>
        </a>
    </div>
    <!-- <div class="menu-inner-shadow"></div> -->
    <ul class="menu-inner py-1">
        <!-- Dashboard -->
        <li class="menu-item @if (request()->routeIs('home')) active @endif">
            <a href="{{ url('/') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bxs-dashboard"></i>
                <div data-i18n="Analytics">Dashboard</div>
            </a>
        </li>
        @if(auth()->check() && auth()->user()->is_admin == 1)
            <li class="menu-item @if (request()->routeIs('admin.plans.*')) active @endif">
                <a href="{{ route('admin.plans.index') }}" class="menu-link">
                    <i class="menu-icon tf-icons bx bxs-star"></i>
                    <div data-i18n="Analytics">Plans</div>
                </a>
            </li>
        @endif
        <li class="menu-item @if (request()->routeIs('subscription.settings')) active @endif">
            <a href="{{ route('subscription.settings') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bxs-cog"></i>
                <div data-i18n="Subscription">Settings</div>
            </a>
        </li>
        <li class="menu-item @if (request()->routeIs('payments.history')) active @endif">
            <a href="{{ route('payments.history') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bx-credit-card"></i>
                <div data-i18n="Analytics">Payment History</div>
            </a>
        </li>

        <li class="menu-item @if (request()->routeIs('invoices.index')) active @endif">
            <a href="{{ route('invoices.index') }}" class="menu-link">
                <i class="menu-icon tf-icons bx bxs-file"></i>
                <div data-i18n="Analytics">Invoices</div>
            </a>
        </li>       
    </ul>
</aside>
