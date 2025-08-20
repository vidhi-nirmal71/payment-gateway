@extends('admin.layout.master', ['title' => "Edit Plan"])
@section('content')
<div class="container py-4">
  <div class="card">
    <div class="card-body">
      <form method="POST" action="{{ route('admin.plans.update',$plan) }}">
        @csrf @method('PUT')
        {{-- <div class="col-md-4">
            <label class="form-label">Stripe Price ID</label>
            <input name="stripe_price_id" class="form-control" value="{{ old('stripe_price_id', $plan->stripe_price_id ?? '') }}" required>
            @error('stripe_price_id')<small class="text-danger">{{ $message }}</small>@enderror
          </div> --}}
        @include('admin.plans.form', ['button' => 'Update'])
      </form>
    </div>
  </div>
</div>
@endsection
