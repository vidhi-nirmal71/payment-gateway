@extends('admin.layout.master', ['title' => 'All Users'])

@section('head')
    <link rel="stylesheet" href="{{ asset('admin/vendor/fonts/fontawesome.css') }}" />  
    <link rel="stylesheet" href="{{ asset('admin/css/select2.css') }}">
    <style>
        #new-user-form .select2-container{
            width: 100% !important;
        }
        .role-filter .select2-container{
            min-width: 250px;
            width: auto !important;
        }
        .status-filter .select2-container{
            min-width: 150px;
            width: auto !important;
        }
        .users-filter .select2-container{
            min-width: 180px;
            width: auto !important;
        }
        @media (max-width: 575.98px) {
            .role-filter, .role-filter .select2-container{
                width: 100% !important;
            }
            .status-filter, .status-filter .select2-container{
                width: 100% !important;
            }
            .users-filter, .users-filter .select2-container{
                width: 100% !important;
            }
            .search-filter{
                width: 100% !important;
            }
        }
    </style>
@endsection
@section('content')
    <div class="row">
        <div class="card">
            <div class="d-flex nav-align-right pt-3">
                <div class="d-flex nav-align-bottom pr-20 pull-right w-100">
                    <div class="d-flex filterBtn w-100">
                        <div class="ps-3 pb-2 search-filter cursor-pointer">
                            <div class="input-group">
                                <input type="text" name="search" class="form-control" placeholder="Search..." id="searchInput">
                                <span class="input-group-text search"><i class="tf-icons bx bx-search"></i></span>
                            </div>
                        </div>
                        <div class="ps-3 pb-2 role-filter">
                            <select class="form-select select2" name="role" id="role">
                                <option value="" selected>Select Role</option>
                                @foreach ($roles as $role)
                                    <option value="{{ $role->id }}">{{ $role->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="ps-3 pb-2 status-filter">
                            <select class="form-select" name="status" id="status">
                                <option value="" disabled>Select Status</option>
                                <option value="0">Inactive User</option>
                                <option value="1" selected>Active User</option>
                                <option value="2">All User</option>
                            </select>
                        </div>
                        @can('add_employee')
                            <div class="ps-3 pb-2 ms-auto">
                                {{-- <button type="button" class="btn btn-outline-primary mb-1 addNewUser" data-bs-toggle="modal" data-bs-target="#userModal">
                                    <i class="bx bx-plus"></i> <strong>Add User</strong>
                                </button> --}}
                                <div id="userForm">
                                    @include('admin.user.form')
                                </div>
                            </div>
                        @endcan
                    </div>
                </div>
            </div>
            <div class="card-body pt-3 pb-0">
                <div class="table-responsive text-nowrap" id="userTable">
                    <h5 style="text-align: center;">Loading...</h5>
                </div>
            </div>
        </div>
    </div>

    @include('admin.layout.offcanvas')

@endsection

@section('script')
    <script src="{{ asset('admin/js/custom/user.js') }}?v=0.05"></script>
    <script src="{{ asset('admin/js/select2.js') }}?v=0.1"></script>
    <script>
        $(document).ready(function() {
            $('#users').select2();
            $('#role').select2();
            $('#status').select2();
            $('#pta, #userRole').select2({
                dropdownParent: $('#userModal .modal-body')
            });
        });
    </script>
@endsection
