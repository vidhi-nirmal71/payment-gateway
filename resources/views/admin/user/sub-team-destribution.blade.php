<div class="col-6">
    <h6 class="mb-3">Assigned Employee - {{ $item['assigned'] ? count($item['assigned']) : 0 }}</h6>
    <div class="row mb-3">
        <div class="col-sm-12">
            <ol class="assignedEmployeeList">
                @foreach ($item['assigned'] as $subkey => $user)
                    <div class="d-flex justify-content-start align-items-center mb-1">
                        <div class="avatar-wrapper">
                            <div class="avatar me-2">
                                @if ($user['profile'] != null)
                                    <img src="{{ $user['profile'] }}" alt="Avatar" class="rounded-circle">
                                @else
                                    @php
                                        $bgColors = ["bg-label-primary", "bg-label-success", "bg-label-info", "bg-label-warning", "bg-label-danger"];
                                        $bgColorClass = $bgColors[$key % count($bgColors)];
                                        $initials = '';
                                        $nameWords = explode(' ', $user['name'] ?? '');
                                        
                                        foreach ($nameWords as $word) {
                                            $initials .= strtoupper(substr($word, 0, 1));
                                        }
                                    @endphp
                                    <span class="avatar-initial rounded-circle {{ $bgColorClass }}">{{ $initials }}</span>
                                @endif
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <span class="emp_name text-truncate underline-tight" data-id={{$subkey}} title="{{ $user['name'] ?? '' }}">{{ $user['name'] ?? '' }} {{ $user['role'] ? ' - '.$user['role'] : '' }}</span>
                        </div>
                    </div>
                @endforeach
            </ol>
        </div>
    </div>
</div>
<div class="col-6">
    <h6 class="mb-3">Assigned Employee via project - {{ $item['assignedviaproject'] ? count($item['assignedviaproject']) : 0 }}</h6>
    <div class="row mb-3">
        <div class="col-sm-12">
            <ol class="assignedEmployeeList">
                @foreach ($item['assignedviaproject'] as $subkey => $user)
                    <div class="d-flex justify-content-start align-items-center mb-1">
                        <div class="avatar-wrapper">
                            <div class="avatar me-2">
                                @if ($user['profile'] != null)
                                    <img src="{{ $user['profile'] }}" alt="Avatar" class="rounded-circle">
                                @else
                                    @php
                                        $bgColors = ["bg-label-primary", "bg-label-success", "bg-label-info", "bg-label-warning", "bg-label-danger"];
                                        $bgColorClass = $bgColors[$key % count($bgColors)];
                                        $initials = '';
                                        $nameWords = explode(' ', $user['name'] ?? '');
                                        
                                        foreach ($nameWords as $word) {
                                            $initials .= strtoupper(substr($word, 0, 1));
                                        }
                                    @endphp
                                    <span class="avatar-initial rounded-circle {{ $bgColorClass }}">{{ $initials }}</span>
                                @endif
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <span class="emp_name text-truncate underline-tight" data-id="{{$subkey}}" title="{{ $user['name'] ?? '' }} From '{{ $user['project'] }}' Project">{{ $user['name'] ?? ''}} {{ $user['role'] ? ' - '.$user['role'] : '' }}</span>
                        </div>
                    </div>
                @endforeach
            </ol>
        </div>
    </div>
</div>