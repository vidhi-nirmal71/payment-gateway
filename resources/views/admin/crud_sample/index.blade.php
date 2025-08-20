@extends('admin.layout.master')

@section('page-header', 'All Accounts')


@section('content')
    <div class="clearfix">
        <a class="btn btn-primary mb-3 float-end" href="{{ route('account.create') }} ">Add Account</a>
    </div>
    <div class="row">
        <div class="col-sm-12">
            <div class="card">
                <div class="table-responsive text-nowrap">
                    <table class="table table-hover table-striped tablecontentcss">
                        <thead class="table-light">
                            <tr>
                                <th width="100px">#</th>
                                <th>Title</th>                                
                                <th width="120px">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="table-border-bottom-0">
                            @if ($accounts->count() == 0)
                                <tr>
                                    <td colspan="100%">
                                        <h6 class="display-6 mb-0 py-3 text-light text-center">No Data</h6>
                                    </td>
                                </tr>
                            @endif
                            @foreach ($accounts as $account)
                                <tr id="account-id{{ $account->id }}">
                                    <td>
                                        {{ $account->id }}
                                    </td>
                                    <td>
                                        {{ $account->title }}
                                    </td>                                   
                                    <td>
                                        <a href="{{ route('account.edit', ['account' => encrypt($account->id)]) }}"
                                            title="Edit account" class="me-1">
                                            <i class="bx bx-edit-alt me-1"></i>
                                        </a>
                                        <a href="javascript:void(0);" data-id="{{ $account->id }}"
                                            class="deleteRecord me-1" title="Delete account">
                                            <i class="bx bx-trash-alt me-1"></i>
                                        </a>                                       
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>

                        @if ($accounts->hasPages())
                            <tfoot>
                                <tr>
                                    <td colspan="3">
                                        {{ $accounts->appends(request()->query())->links('vendor.pagination.sneat') }}
                                    </td>
                                </tr>
                            </tfoot>
                        @endif
                    </table>
                </div>
            </div>
        </div>

    </div>
@endsection
@section('script')

    <script>
        $(document).on('click', '.deleteRecord', function(e) {

            var account_id = $(this).data("id");

            confirmDelete('Are you sure you want to delete this account?', '', function(confirmDelete) {
                if (confirmDelete) {
                    deleteAccount(account_id);
                }
            });
        });

        function deleteAccount(account_id) {
            $.ajax({
                
                type: 'DELETE',
                data: {
                    "id": account_id
                },
                success: function() {
                    swal("Your account has been deleted!", {
                        icon: "success",
                    });
                    $("#account-id" + account_id).remove();
                },
                error: function(response) {
                    swal("Something Went Wrong!", {
                        icon: "error",
                    });
                }
            });
        }
    </script>
@endsection
