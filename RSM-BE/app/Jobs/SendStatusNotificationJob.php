<?php

namespace App\Jobs;

use App\Models\WorkOrder;
use App\Notifications\WorkOrderStatusChanged;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    /**
     * Create a new job instance.
     */
    public function __construct(
        public WorkOrder $workOrder,
        public string $oldStatus,
        public string $newStatus
    ) {
        $this->onQueue('notifications');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Only send notification for specific statuses
        if ($this->newStatus === 'waiting_customer') {
            $this->workOrder->customer->notify(
                new WorkOrderStatusChanged($this->workOrder, $this->oldStatus)
            );

            Log::info('Status notification sent', [
                'work_order_id' => $this->workOrder->id,
                'customer_id' => $this->workOrder->customer_id,
                'status' => $this->newStatus,
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Status notification job failed', [
            'work_order_id' => $this->workOrder->id,
            'customer_id' => $this->workOrder->customer_id,
            'status' => $this->newStatus,
            'error' => $exception->getMessage(),
        ]);
    }
}
