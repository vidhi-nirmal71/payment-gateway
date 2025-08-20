<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\SubscriptionReminderMail;

class UpdateSubscriptions extends Command
{
    protected $signature = 'subscriptions:update-status';
    protected $description = 'Update subscription statuses and send reminders';

    public function handle()
    {
        $today = Carbon::now();

        Subscription::where('status', 'active')
            ->whereDate('ends_at', '<=', $today->copy()->addDays(3))
            ->update(['status' => 'soon_to_expire']);

        Subscription::where('status', 'soon_to_expire')
            ->whereDate('ends_at', '<', $today)
            ->update(['status' => 'expired']);

        $soonToExpire = Subscription::where('status', 'soon_to_expire')->get();
        foreach ($soonToExpire as $sub) {
            Mail::to($sub->user->email)->send(new SubscriptionReminderMail($sub));
        }
    }
}
