<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'title',
        'description',
        'status',
        'priority',
        'due_at',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_at' => 'datetime',
    ];

    /**
     * Get the customer that owns the work order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who created the work order.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the notes for the work order.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(WorkOrderNote::class);
    }

    /**
     * Get the status histories for the work order.
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(StatusHistory::class);
    }

    /**
     * Get the notifications for the work order.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }
}
