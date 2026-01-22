<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkOrder;

class WorkOrderPolicy
{
    /**
     * Determine whether the user can view any work orders.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view-work-orders');
    }

    /**
     * Determine whether the user can view the work order.
     */
    public function view(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('view-work-orders');
    }

    /**
     * Determine whether the user can create work orders.
     */
    public function create(User $user): bool
    {
        return $user->can('create-work-orders');
    }

    /**
     * Determine whether the user can update the work order.
     */
    public function update(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('edit-work-orders');
    }

    /**
     * Determine whether the user can delete the work order.
     */
    public function delete(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('delete-work-orders');
    }

    /**
     * Determine whether the user can add notes to the work order.
     */
    public function addNote(User $user, WorkOrder $workOrder): bool
    {
        return $user->can('add-work-order-notes');
    }

    /**
     * Determine whether the user can change the status of the work order.
     * Support role has additional restrictions enforced in the controller.
     */
    public function changeStatus(User $user, WorkOrder $workOrder, ?string $newStatus = null): bool
    {
        // Check basic permission
        if (!$user->can('change-work-order-status')) {
            return false;
        }

        // If no specific status provided, just check the general permission
        if ($newStatus === null) {
            return true;
        }

        // Support role can only change to 'in_progress' or 'waiting_customer'
        if ($user->hasRole('Support')) {
            return in_array($newStatus, ['in_progress', 'waiting_customer']);
        }

        // Staff cannot cancel
        if ($user->hasRole('Staff') && $newStatus === 'cancelled') {
            return false;
        }

        // Admin can do anything
        return true;
    }
}
