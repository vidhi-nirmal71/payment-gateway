@extends('admin.layout.master', ['title' => "Plans"])
@section('content')
<div class="py-4">

  @if(session('success')) <div class="alert alert-success">{{ session('success') }}</div> @endif

  <div class="card">
    <div class="card-body table-responsive">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Plans</h3>
            <a href="{{ route('admin.plans.create') }}" class="btn btn-primary">New Plan</a>
          </div>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th><th>Price</th><th>Stripe Price ID</th><th>interval</th><th>description</th>
          </tr>
        </thead>
        <tbody>
          @forelse($plans as $plan)
            <tr>
              <td>{{ $plan->name }}</td>
              <td>${{ number_format($plan->price,2) }}</td>
              {{-- <td>{{ $plan->discounted_price ? '$'.number_format($plan->discounted_price,2) : '-' }}</td> --}}
              <td><code>{{ $plan->stripe_price_id }}</code></td>
              <td>{{ $plan->interval }}</td>
              <td>{{ $plan->description }}</td>
              {{-- <td class="text-end">
                <a class="btn btn-sm btn-outline-secondary" href="{{ route('admin.plans.edit',$plan) }}">Edit</a>
                <form action="{{ route('admin.plans.destroy',$plan) }}" method="POST" class="d-inline">
                  @csrf @method('DELETE')
                  <button class="btn btn-sm btn-outline-danger" onclick="return confirm('Delete?')">Delete</button>
                </form>
              </td> --}}
            </tr>
          @empty
            <tr><td colspan="5">No plans yet.</td></tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
