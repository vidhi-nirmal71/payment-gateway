<div>
    <div class="card">
        <div class="card-body p-0">
            <div class="table-respnsive text-nowrap">
                <table class="table table-hover table-striped tablecontentcss">
                    <thead>
                        <tr class="text-left">
                            <th>#</th>
                            <th>Title</th>
                            <th>Note</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="dashboard-reminder-list-body" class="text-left">
                        @if ($reminders->count() == 0)
                            <tr>
                                <td colspan="100%">
                                    <p class="font-20 mb-0 text-light text-center">No Reminders For Today</p>
                                </td>
                            </tr>
                        @else
                            @foreach ($reminders as $key => $reminder)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ Str::words($reminder->title, 3) }}</td>
                                    <td>{{ Str::words($reminder->note, 8) }}</td>
                                    <td>{{ substr($reminder->reminder, 0, 10) }}</td>
                                </tr>
                            @endforeach
                        @endif
                    </tbody>
                    @if ($reminders->hasPages())
                        <tfoot class="table-border-bottom-0">
                            <tr>
                                <td colspan="4">
                                    {{ $reminders->appends(request()->query())->links('vendor.pagination.sneat') }}
                                </td>
                            </tr>
                        </tfoot>
                    @endif
                </table>
            </div>
        </div>
    </div>
</div>
