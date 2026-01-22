<?php

namespace App\Services;

use App\Jobs\SendStatusNotificationJob;
use App\Models\StatusHistory;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Facades\DB;

class WorkOrderService
{
    /**
     * Change the status of a work order with business rule validation.
     *
     * @param WorkOrder $workOrder
     * @param string $newStatus
     * @param User $user
     * @return WorkOrder
     * @throws \Exception
     */
    public function changeStatus(WorkOrder $workOrder, string $newStatus, User $user): WorkOrder
    {
        return DB::transaction(function () use ($workOrder, $newStatus, $user) {
            $oldStatus = $workOrder->status;

            // Business Rule 1: Cannot move from 'done' to any other status
            if ($oldStatus === 'done') {
                throw new \Exception('Cannot change status from "done" to another status.');
            }

            // Business Rule 2: Cannot move to 'done' unless work order has at least one note
            if ($newStatus === 'done' && !$workOrder->notes()->exists()) {
                throw new \Exception('Cannot mark work order as "done" without at least one note.');
            }

            // Business Rule 3: Only Admin can set status to 'cancelled'
            if ($newStatus === 'cancelled' && !$user->can('cancel-work-orders')) {
                throw new \Exception('Only administrators can cancel work orders.');
            }

            // Business Rule 4: If status becomes 'waiting_customer' and due_at is null, set due_at to now + 3 days
            if ($newStatus === 'waiting_customer' && is_null($workOrder->due_at)) {
                $workOrder->due_at = now()->addDays(3);
            }

            // Update the work order status
            $workOrder->status = $newStatus;
            $workOrder->save();

            // Business Rule 5: Create status history entry
            StatusHistory::create([
                'work_order_id' => $workOrder->id,
                'from_status' => $oldStatus,
                'to_status' => $newStatus,
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);

            // Debug logging
            \Log::info('Status change', [
                'work_order_id' => $workOrder->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'new_status_type' => gettype($newStatus),
                'comparison' => $newStatus === 'waiting_customer' ? 'MATCH' : 'NO MATCH'
            ]);

            // Dispatch queued notification job when status becomes 'waiting_customer'
            if ($newStatus === 'waiting_customer') {
                SendStatusNotificationJob::dispatch($workOrder, $oldStatus, $newStatus);
                \Log::info('Job dispatched to queue', ['work_order_id' => $workOrder->id]);
            }

            return $workOrder->fresh();
        });
    }
}
