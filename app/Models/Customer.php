<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
    ];

    /**
     * Get the work orders for the customer.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }

    /**
     * Get the notifications for the customer.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Normalize phone number before saving.
     */
    public function setPhoneAttribute($value): void
    {
        // Remove all non-numeric characters
        $this->attributes['phone'] = preg_replace('/[^0-9]/', '', $value);
    }
}
