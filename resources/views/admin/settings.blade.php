@extends('admin.layout.master', ['title' => "Settings"])

@section('head')
@endsection

@section('content')
<div class="py-2">
    <div class="card shadow-sm p-4">
        <h4 class="mb-3">My Subscription</h4>

        @if($subscription->isNotEmpty())
            @foreach($subscription as $sub)
                <div class="mb-3 border-bottom pb-3">

                    <p><strong>Current Plan(s):</strong>
                        {{ $sub->plan->pluck('name')->join(', ') }}
                    </p>

                    <p><strong>Status:</strong>
                        <span class="badge bg-{{ $sub->status === 'active' ? 'success' : 'danger' }}">
                            {{ ucfirst($sub->status) }}
                        </span>
                    </p>

                    <p><strong>Valid Till:</strong>
                        {{ $sub->ends_at ? $sub->ends_at->format('M d, Y') : '—' }}
                    </p>
                </div>

                {{-- Renew option --}}
                @if($sub->status === 'expired' || ($sub->ends_at && $sub->ends_at->isToday()))
                    <form action="{{ route('subscription.renew', $sub->id) }}" method="POST" class="mb-3 ajax-form">
                        @csrf
                        <div class="d-flex gap-2">
                            <span class="text-danger mt-1">Your plan has expired. Please renew to continue using the service.</span>
                            <button type="submit" class="btn btn-primary">Renew Plan</button>
                        </div>
                    </form>
                @endif

                {{-- Upgrade / Downgrade options --}}
                @if($sub->status === 'active')
                    {{-- <h5>Change Plan</h5>
                    <p class="text-muted small">
                        Upgrading will charge the difference immediately.  
                        Downgrading will apply a credit on your next invoice.
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        @foreach($plans as $plan)
                            @if(!$sub->plan->contains($plan->id))
                                <form action="{{ route('subscription.change') }}" method="POST" class="ajax-form">
                                    @csrf
                                    <input type="hidden" name="subscription_id" value="{{ $sub->id }}">
                                    <input type="hidden" name="plan_id" value="{{ $plan->id }}">
                                    <button type="submit" class="btn btn-outline-secondary">
                                        Switch to {{ $plan->name }} ({{ $plan->displayPrice() }} / {{ $plan->interval }})
                                    </button>
                                </form>
                            @endif
                        @endforeach
                    </div> --}}

                    <form action="{{ route('subscription.autoRenew.toggle', $sub->id) }}" method="POST" class="ajax-form auto-renew-form">
                        @csrf
                        <div class="border rounded p-3 mt-4 bg-light">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-1">Auto Renewal</h6>
                                    <small class="text-muted">
                                        When enabled, your subscription will renew automatically at the end of the current billing cycle.
                                    </small>
                                </div>
                                <div class="form-check form-switch d-flex align-items-center">
                                    <input class="form-check-input toggle-auto-renew" type="checkbox"
                                           id="autoRenew-{{ $sub->id }}" name="auto_renew"
                                           {{ $sub->auto_renew ? 'checked' : '' }}>
                                    <label class="form-check-label ms-2 fw-semibold" for="autoRenew-{{ $sub->id }}">
                                        {{ $sub->auto_renew ? 'Enabled' : 'Disabled' }}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                @endif
            @endforeach
        @else
            <div class="alert alert-info">
                You don’t have any active subscription. 
                <a href="{{ route('home') }}">Choose a plan</a>.
            </div>
        @endif
    </div>
</div>

@endsection

@section('script')
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
$(document).on("submit", ".ajax-form", function(e) {
    e.preventDefault();

    let form = $(this);
    let url = form.attr("action");
    let data = form.serialize();
    let btn = form.find("button[type=submit]");
    let originalText = btn.html();
    btn.prop("disabled", true).html("Changing...");

    $.ajax({
        url: url,
        type: "POST",
        data: data,
        success: function(response) {
            successMessage(response.message ?? "Plan updated successfully!");
            setTimeout(() => location.reload(), 500);
        },
        error: function(xhr) {
            let error = xhr.responseJSON?.message ?? "Something went wrong!";
            errorMessage(error);
        },
        complete: function() {
            btn.prop("disabled", false).html(originalText);
        }
    });
});

$(document).on("change", ".toggle-auto-renew", function(e) {
    let input = $(this);
    let form = input.closest("form");
    let url = form.attr("action");
    let data = form.serialize();
    input.prop("disabled", true);

    $.ajax({
        url: url,
        type: "POST",
        data: data,
        success: function(response) {
            let label = form.find("label[for='autoRenew']");
            label.text(input.is(":checked") ? "Enabled" : "Disabled");

            successMessage(response.message ?? "Auto-renew setting updated!");
        },
        error: function(xhr) {
            let error = xhr.responseJSON?.message ?? "Something went wrong!";
            errorMessage(error);
            input.prop("checked", !input.is(":checked"));
        },
        complete: function() {
            input.prop("disabled", false);
        }
    });
});
</script>
@endsection
