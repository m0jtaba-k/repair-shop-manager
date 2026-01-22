<?php

namespace App\Notifications;

use App\Models\WorkOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkOrderStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public WorkOrder $workOrder,
        public ?string $previousStatus = null
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Work Order Status Update: {$this->workOrder->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your work order status has been updated.")
            ->line("**Work Order:** {$this->workOrder->title}")
            ->line("**Previous Status:** " . ucfirst(str_replace('_', ' ', $this->previousStatus ?? 'N/A')))
            ->line("**New Status:** " . ucfirst(str_replace('_', ' ', $this->workOrder->status)))
            ->when($this->workOrder->due_at, function ($mail) {
                return $mail->line("**Due Date:** {$this->workOrder->due_at->format('M d, Y')}");
            })
            ->line('Please check your work order for more details.')
            ->action('View Work Order', url("/work-orders/{$this->workOrder->id}"))
            ->line('Thank you for choosing our services!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'work_order_id' => $this->workOrder->id,
            'title' => $this->workOrder->title,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->workOrder->status,
        ];
    }
}
