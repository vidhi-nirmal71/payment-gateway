@extends('admin.auth.master')

@section('head')
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/pages/page-auth.css" />
    <style>
        .layout-menu-collapsed .layout-container{
            margin-left: 0px !important;
        }
    </style>
@endsection

@section('content')
<div class="card mt-5">
    <div class="card-header text-center">
        <h2>Access Restricted</h2>
    </div>
    <div class="card-body text-center">
        <p>You currently do not have the necessary <b>{{ $text }}</b> assigned, so further access is restricted.</p>
        <p>Please contact HR to have the required {{ $text }} assigned to your account.</p>
        <p>Alternatively, you may wait and refresh this page periodically to check for updates once your access is granted.</p>
        <button class="btn btn-primary mt-3" onclick="location.reload();">Refresh Page</button>
    </div>
</div>
@endsection

@section('script')
@endsection
