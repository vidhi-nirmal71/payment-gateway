@extends('admin.layout.master', ['title' => "Complete Payment"])

@section('head')
<script src="https://js.stripe.com/v3/"></script>
@endsection

@section('content')
<div class="container py-2">
    <div class="card">
        <div class="card-header">
            <h3>Payment for <b>{{ $plan }}</b></h3>
        </div>
        <div class="card-body">
            <form id="payment-form">
                @csrf
                <input type="hidden" name="plan_id" value="{{ encrypt($plan_id) }}" id="plan_id" class="form-control" required disabled/>

                <div class="mb-3">
                    <label>Name</label>
                    <input type="text" name="name" value="{{ $user->name }}" id="name" class="form-control" required disabled/>
                </div>
        
                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" value="{{ $user->email }}" id="email" class="form-control" required disabled/>
                </div>
        
                <label>Card Details</label>
                <div id="card-element" class="form-control"></div>

                <button type="submit" class="btn btn-primary mt-3">Submit Payment</button>
            </form>
        </div>        
    </div>
</div>

@endsection
@section('script')

<script>
    const stripe = Stripe("{{ env('STRIPE_KEY') }}");
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    document.getElementById('payment-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
            billing_details: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
            }
        });

        if (error) {
            errorMessage(error.message);
            return;
        }

        fetch("{{ route('process.payment') }}", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                plan_id: document.getElementById('plan_id').value,
                payment_method_id: paymentMethod.id
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                successMessage(data.message); // Replace with toast
                window.location.href = "{{ route('home') }}";
            } else {
                successMessage(data.message); // Replace with toast
            }
        })
        .catch(err => {
            errorMessage("Error: " + err.message);
        });
    });
</script>
@endsection