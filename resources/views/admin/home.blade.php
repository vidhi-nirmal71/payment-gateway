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
<div class="py-2 mt-1">
    @if($subscription->isNotEmpty())
    <div class="row">
        @foreach($subscription as $sub)
            @foreach($sub->plan as $plan)
                <div class="col-md-6 mb-3 d-flex">
                    <div class="card border-success shadow-sm w-100 h-100">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <h5 class="card-title d-flex justify-content-between align-items-center">
                                <span>{{ ucfirst($plan->name) }}</span>
                                <span class="badge 
                                    {{ $sub->status === 'active' ? 'bg-success' : ($sub->status === 'pending' ? 'bg-info text-dark' : 'bg-warning text-dark') }}">
                                    {{ ucfirst($sub->status) }}
                                </span>
                            </h5>
    
                            @if($sub->status === 'pending')
                                <p class="card-text text-muted mb-0 mt-auto">
                                    This plan will become active after your current plan expires.
                                </p>
                            @else
                                <div class="mt-auto">
                                    <p class="card-text mb-1">
                                        <strong>Valid Until:</strong> {{ $sub->ends_at?->format('M d, Y') ?? '—' }}
                                    </p>
                                    <p class="card-text text-muted mb-0">
                                        Started on {{ $sub->starts_at?->format('M d, Y') ?? '—' }}
                                    </p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        @endforeach
    </div>
    @endif
    

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
                    @if(in_array($plan->id, $purchasedPlanIds))
                        <div class="d-flex justify-content-center">
                            <button type="button" class="btn btn-secondary" disabled>Already Purchased</button>
                        </div>
                    @else
                        <form action="{{ route('select.plan') }}" method="POST">
                            @csrf
                            <input type="hidden" name="plan_id" value="{{ $plan->id }}">
                            <input type="hidden" name="plan_name" value="{{ $plan->name }}">
                            <div class="d-flex justify-content-center">
                                <button type="submit" class="btn btn-primary buy-plan">Buy Now</button>
                            </div>
                        </form>
                    @endif
                </div>
            </div>
        @endforeach
    </div>
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
