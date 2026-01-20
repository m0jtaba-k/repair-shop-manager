<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\NotificationLog;
use App\Models\StatusHistory;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderNote;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create users
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        $technicianUser = User::factory()->create([
            'name' => 'Technician User',
            'email' => 'tech@example.com',
        ]);

        $users = User::factory(3)->create();
        $allUsers = collect([$adminUser, $technicianUser])->merge($users);

        // Create customers
        $customers = Customer::factory(20)->create();

        // Create work orders with relationships
        $customers->each(function ($customer) use ($allUsers) {
            // Each customer gets 1-3 work orders
            $workOrderCount = rand(1, 3);

            for ($i = 0; $i < $workOrderCount; $i++) {
                $workOrder = WorkOrder::factory()->create([
                    'customer_id' => $customer->id,
                    'created_by' => $allUsers->random()->id,
                ]);

                // Add status history for the work order
                StatusHistory::factory()->create([
                    'work_order_id' => $workOrder->id,
                    'from_status' => null,
                    'to_status' => 'new',
                    'changed_by' => $workOrder->created_by,
                    'changed_at' => $workOrder->created_at,
                ]);

                // If status is not 'new', add another status history entry
                if ($workOrder->status !== 'new') {
                    StatusHistory::factory()->create([
                        'work_order_id' => $workOrder->id,
                        'from_status' => 'new',
                        'to_status' => $workOrder->status,
                        'changed_by' => $allUsers->random()->id,
                        'changed_at' => $workOrder->updated_at,
                    ]);
                }

                // Add 0-3 notes per work order
                $noteCount = rand(0, 3);
                WorkOrderNote::factory($noteCount)->create([
                    'work_order_id' => $workOrder->id,
                    'user_id' => $allUsers->random()->id,
                ]);

                // Add 0-2 notification logs per work order
                $notificationCount = rand(0, 2);
                NotificationLog::factory($notificationCount)->create([
                    'work_order_id' => $workOrder->id,
                    'customer_id' => $customer->id,
                ]);
            }
        });
    }
}
