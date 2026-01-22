<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorkOrderNoteRequest;
use App\Http\Resources\WorkOrderNoteResource;
use App\Models\WorkOrder;
use App\Models\WorkOrderNote;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WorkOrderNoteController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of notes for a work order.
     */
    public function index(WorkOrder $workOrder)
    {
        $this->authorize('view', $workOrder);

        $notes = $workOrder->notes()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return WorkOrderNoteResource::collection($notes);
    }

    /**
     * Store a newly created note.
     */
    public function store(StoreWorkOrderNoteRequest $request, WorkOrder $workOrder)
    {
        $note = WorkOrderNote::create([
            'work_order_id' => $workOrder->id,
            'user_id' => $request->user()->id,
            'note' => $request->note,
            'created_at' => now(),
        ]);

        $note->load('user');

        return new WorkOrderNoteResource($note);
    }
}
