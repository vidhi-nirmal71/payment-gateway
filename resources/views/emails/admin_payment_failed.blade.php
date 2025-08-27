<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admin Payment Failed Notification</title>
</head>
<body>
    <h2>Payment Failed Alert</h2>

    <p>A user's payment attempt has failed.</p>

    <p><strong>User:</strong> {{ $user->name }} ({{ $user->email }})</p>
    <p><strong>Invoice ID:</strong> {{ $invoice->id }}</p>
    <p><strong>Amount:</strong> {{ number_format($invoice->amount / 100, 2) }} {{ strtoupper($invoice->currency ?? 'USD') }}</p>

    <p>Please review this payment issue.</p>

    <br>
    <p>Thanks, <br> {{ config('app.name') }}</p>
</body>
</html>