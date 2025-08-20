@component('mail::message')
Hello {{ $subscription->user->name }},

Your {{ ucfirst($subscription->plan_name) }} plan will expire on {{ $subscription->ends_at->format('d M Y') }}
Please renew to continue enjoying premium features.

<p style="padding-top: 20px; margin-bottom: 0px;">Regards,</p>
{{ config('app.name') }}
@endcomponent