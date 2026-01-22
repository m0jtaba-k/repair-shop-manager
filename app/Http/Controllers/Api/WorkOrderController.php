<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorkOrderRequest;
use App\Http\Requests\UpdateWorkOrderRequest;
use App\Http\Requests\UpdateWorkOrderStatusRequest;
use App\Http\Resources\WorkOrderCollection;
use App\Http\Resources\WorkOrderResource;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WorkOrderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected WorkOrderService $workOrderService)
    {
    }

    /**
     * Display a listing of work orders with filters.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WorkOrder::class);

        $query = WorkOrder::query()
            ->with(['customer', 'creator']);

        // Filter by status
        if ($request->filled('status')) {
            $statuses = is_array($request->status) ? $request->status : [$request->status];
            $query->whereIn('status', $statuses);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $priorities = is_array($request->priority) ? $request->priority : [$request->priority];
            $query->whereIn('priority', $priorities);
        }

        // Filter by due date range
        if ($request->filled('due_date_from')) {
            $query->whereDate('due_at', '>=', $request->due_date_from);
        }

        if ($request->filled('due_date_to')) {
            $query->whereDate('due_at', '<=', $request->due_date_to);
        }

        // Filter by customer phone
        if ($request->filled('customer_phone')) {
            $normalizedPhone = preg_replace('/[^0-9]/', '', $request->customer_phone);
            $query->whereHas('customer', function ($q) use ($normalizedPhone) {
                $q->where('phone', 'like', "%{$normalizedPhone}%");
            });
        }

        // Filter overdue only
        if ($request->boolean('overdue')) {
            $query->whereDate('due_at', '<', now())
                ->whereNotIn('status', ['done', 'cancelled']);
        }

        // Sort by due date or created date
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $workOrders = $query->paginate($request->get('per_page', 15));

        return new WorkOrderCollection($workOrders);
    }

    /**
     * Store a newly created work order.
     */
    public function store(StoreWorkOrderRequest $request)
    {
        $workOrder = WorkOrder::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        $workOrder->load(['customer', 'creator']);

        return new WorkOrderResource($workOrder);
    }

    /**
     * Display the specified work order.
     */
    public function show(WorkOrder $workOrder)
    {
        $this->authorize('view', $workOrder);

        $workOrder->load(['customer', 'creator', 'notes.user']);

        return new WorkOrderResource($workOrder);
    }

    /**
     * Update the specified work order.
     */
    public function update(UpdateWorkOrderRequest $request, WorkOrder $workOrder)
    {
        $workOrder->update($request->validated());
        $workOrder->load(['customer', 'creator']);

        return new WorkOrderResource($workOrder);
    }

    /**
     * Remove the specified work order.
     */
    public function destroy(WorkOrder $workOrder)
    {
        $this->authorize('delete', $workOrder);

        $workOrder->delete();

        return response()->json(['message' => 'Work order deleted successfully'], 200);
    }

    /**
     * Update the status of a work order.
     */
    public function updateStatus(UpdateWorkOrderStatusRequest $request, WorkOrder $workOrder)
    {
        try {
            $updatedWorkOrder = $this->workOrderService->changeStatus(
                $workOrder,
                $request->status,
                $request->user()
            );

            $updatedWorkOrder->load(['customer', 'creator', 'notes.user']);

            return new WorkOrderResource($updatedWorkOrder);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get status history for a work order.
     */
    public function statusHistory(WorkOrder $workOrder)
    {
        $this->authorize('view', $workOrder);

        $statusHistories = $workOrder->statusHistories()
            ->with('changedBy')
            ->orderBy('changed_at', 'desc')
            ->get();

        return \App\Http\Resources\StatusHistoryResource::collection($statusHistories);
    }
}
