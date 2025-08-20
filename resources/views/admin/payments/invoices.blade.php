@extends('admin.layout.master', ['title' => "Invoices"])
@section('content')
<div class="card shadow-sm p-4">
    <h4 class="mb-3">Invoices</h4>
    <ul class="list-group">
        @if($invoices->count() > 0)
            @forelse($invoices as $invoice)
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Invoice #{{ $invoice->number ?? $invoice->id }}</strong><br>
                        {{ \Carbon\Carbon::createFromTimestamp($invoice->created)->format('M d, Y') }}
                        - {{ number_format($invoice->amount_paid / 100, 2) }} {{ strtoupper($invoice->currency) }}
                        @if(auth()->user()->is_admin)
                            <br><small class="text-muted">User: {{ $invoice->user_name }}</small>
                        @endif
                    </div>
                    <div>
                        <a href="{{ $invoice->invoice_pdf }}" target="_blank" class="btn btn-sm btn-outline-primary">
                            Download PDF
                        </a>
                    </div>
                </li>
            @endforeach
        @else
            <li class="list-group-item border-0 alert alert-info p-3">No invoices found</li>
        @endif
    </ul>
</div>
@endsection