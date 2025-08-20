@extends('admin.layout.master', ['title' => "Payment History"])
@section('content')
<div class="card shadow-sm p-4">
    <h4 class="mb-3">Payment History</h4>
    @if($payments->count() > 0)
        <table class="table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Plan Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payments as $payment)
                    <tr>
                        <td>{{ $payment->user_name }}</td>
                        <td>{{ $payment->plan_name }}</td>
                        <td>{{ \Carbon\Carbon::createFromTimestamp($payment->created)->format('M d, Y H:i') }}</td>
                        <td>{{ number_format($payment->amount / 100, 2) }}</td>
                        <td>{{ strtoupper($payment->currency) }}</td>
                        <td>
                            <span class="badge bg-{{ $payment->status === 'active' ? 'success' : 'danger' }}">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="alert alert-info">
            No payment history found.
        </div>
    @endif
</div>
@endsection
