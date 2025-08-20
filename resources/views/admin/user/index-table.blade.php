<table class="table table-hover table-striped tablecontentcss">
    <thead class="table-light">
        <tr>
            <th>Name</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Joining Date</th>
            <th>Active</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody class="table-border-bottom-0">
        @if ($users->count() == 0)
            <tr>
                <td colspan="100%">
                    <h6 class="font-20 mb-0 text-light text-center">No data found</h6>
                </td>
            </tr>
        @else
            @foreach ($users as $data)
                <tr>
                    <td class="td-name">{{ $data->name  }}</td>
                    <td class="td-username">{{ $data->username }}</td>
                    <td class="td-email">{{ $data->email }}</td>
                    <td class="td-joining_date">{{ $data->joining_date}}</td>
                    <td class="td-activated">{{ $data->activated == 1 ? 'Yes' : 'No' }}</td>
                    <td>
                        @can('view_employee')
                            <a href="javascript:void(0);" title="Show Employee Details" class="text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" id="showEmployeeDetails" data-id={{ $data->id }}>
                                <i class="bx bx-show me-1"></i>
                            </a>
                        @endcan
                        @can('edit_employee')
                            {{-- <label title="Edit User" class="editUser cursor-pointer" aria-controls="offcanvasEnd" data-item-id="{{ $data->id }}" data-item-user-id="{{ $data->id }}">
                                    <span class="text-primary cursor"><i class="bx bx-edit me-1"></i></span>
                            </label> --}}
                        @endcan
                    </td>
                </tr>
            @endforeach
        @endif
    </tbody>

    @if ($users->hasPages())
        <tfoot>
            <tr>
                <td colspan="6">
                    {{ $users->appends(request()->query())->links('vendor.pagination.sneat') }}
                </td>
            </tr>
        </tfoot>
    @endif
</table>
