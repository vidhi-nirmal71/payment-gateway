@extends('admin.layout.master', ['title' => 'Add User'])
@section('head')
    <link rel="stylesheet" href="{{ asset('admin/vendor/fonts/fontawesome.css') }}" />  
    <link rel="stylesheet" href="{{ asset('admin/css/select2.css') }}">
@endsection
@section('content')
    <div class="row">
        <div class="card">
            <div class="card-body d-flex">
                @include('admin.user.form-element')
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script src="{{ asset('admin/js/custom/user.js') }}?v=0.05"></script>
    <script src="{{ asset('admin/js/select2.js') }}?v=0.1"></script>
@endsection