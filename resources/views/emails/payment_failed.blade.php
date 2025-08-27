<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Failed</title>
</head>
<body>
    <h2>Dear {{ $invoice->user->name ?? 'User' }},</h2>

    <p>Unfortunately, your recent payment attempt has <strong>failed</strong>.</p>

    <p><strong>Invoice ID:</strong> {{ $invoice->id }}</p>
    <p><strong>Amount:</strong> {{ number_format($invoice->amount / 100, 2) }} {{ strtoupper($invoice->currency ?? 'USD') }}</p>

    <p>Please update your payment details or try again.</p>

    <p>If you believe this is an error, kindly contact our support team.</p>

    <br>
    <p>Thanks, <br> {{ config('app.name') }}</p>
</body>
</html>