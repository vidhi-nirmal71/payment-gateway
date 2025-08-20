@extends('admin.layout.master', ['title' => "Create Plan"])
@section('content')
<div class="container py-4">
  <div class="card">
    <div class="card-body">
        <form method="POST" action="{{ route('admin.plans.store') }}">
            @csrf
            @include('admin.plans.form', ['button' => 'Create'])
        </form>
    </div>
  </div>
</div>
@endsection
