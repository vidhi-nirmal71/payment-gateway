@extends('admin.layout.master', ['title' => "Dashboard"])

@section('head')
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/dashboard.css?v=0.04" class="template-customizer-core-css" />
    <style>
        .pricing-card {
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s ease-in-out;
            background: white;
        }
        .pricing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .pricing-price {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .pricing-features {
            list-style: none;
            padding: 0;
            margin: 15px 0;
        }
        .pricing-features li {
            margin-bottom: 8px;
        }
    </style>
@endsection

@section('content')
<div class="py-2">
    @if(!$subscription)
        <div class="row g-4">
            @foreach($plans as $plan)
                <div class="col-md-4 mt-3">
                    <div class="pricing-card">
                        {{-- Plan Name --}}
                        <h4>{{ ucfirst($plan->name) }}</h4>

                        {{-- Plan Price (show discounted if available) --}}
                        <div class="pricing-price">
                            @if($plan->discounted_price && $plan->discounted_price < $plan->price)
                                <span class="text-danger">
                                    ${{ number_format($plan->discounted_price, 2) }}
                                </span>
                                <small class="text-muted"><del>${{ number_format($plan->price, 2) }}</del></small>
                            @else
                                ${{ number_format($plan->price, 2) }}
                            @endif
                            <small>/ {{$plan->interval}}</small>
                        </div>

                        {{-- Plan Description --}}
                        <p>{{ $plan->description ?? 'No description available.' }}</p>

                        {{-- Features (optional if you store as JSON or related table) --}}
                        @if(!empty($plan->features))
                            <ul class="pricing-features">
                                @foreach(json_decode($plan->features, true) as $feature)
                                    <li>{{ $feature }}</li>
                                @endforeach
                            </ul>
                        @endif

                        {{-- Buy Now Form --}}
                        <form action="{{ route('select.plan') }}" method="POST">
                            @csrf
                            <input type="hidden" name="plan_id" value="{{ $plan->id }}">
                            <input type="hidden" name="plan_name" value="{{ $plan->name }}">
                            <button type="submit" class="btn btn-primary buy-plan">
                                Buy Now
                            </button>
                        </form>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="alert alert-success">
            You are currently on the <strong>{{ ucfirst($subscription->plan->name ?? '-') }}</strong> plan until {{ \Carbon\Carbon::parse($subscription->ends_at)->format('M d, Y') }}.
        </div>
    @endif
</div>
@endsection

@section('script')
<script>
let stripe = Stripe("{{ env('STRIPE_KEY') }}");
let elements;
let clientSecret;

// $(".buy-plan").on("click", function () {
//     let priceId = $(this).data("price");

//     $.post("{{ route('create.subscription') }}", {
//         price_id: priceId,
//         _token: "{{ csrf_token() }}"
//     }, function (data) {
//         clientSecret = data.clientSecret;
//         elements = stripe.elements({ clientSecret: clientSecret });
//         const paymentElement = elements.create("payment");
//         paymentElement.mount("#payment-element");

//         $("#payment-section").slideDown();
//     });
// });

// $("#submit-payment").on("click", async function () {
//     const { error } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//             return_url: ""
//         }
//     });

//     if (error) {
//         successMessage(error.message); // can also use error toast
//     }
// });
</script>
@endsection
