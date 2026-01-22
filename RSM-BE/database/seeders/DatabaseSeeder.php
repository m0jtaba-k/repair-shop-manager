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
        // Seed roles and permissions first
        $this->call(RoleSeeder::class);

        // Create users with roles
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $adminUser->assignRole('Admin');

        $staffUser1 = User::factory()->create([
            'name' => 'Staff User One',
            'email' => 'staff1@example.com',
            'password' => bcrypt('password'),
        ]);
        $staffUser1->assignRole('Staff');

        $staffUser2 = User::factory()->create([
            'name' => 'Staff User Two',
            'email' => 'staff2@example.com',
            'password' => bcrypt('password'),
        ]);
        $staffUser2->assignRole('Staff');

        $supportUser1 = User::factory()->create([
            'name' => 'Support User One',
            'email' => 'support1@example.com',
            'password' => bcrypt('password'),
        ]);
        $supportUser1->assignRole('Support');

        $supportUser2 = User::factory()->create([
            'name' => 'Support User Two',
            'email' => 'support2@example.com',
            'password' => bcrypt('password'),
        ]);
        $supportUser2->assignRole('Support');

        $allUsers = collect([$adminUser, $staffUser1, $staffUser2, $supportUser1, $supportUser2]);

        // Create customers (50 for better testing)
        $customers = Customer::factory(50)->create();

        // Create work orders with relationships (200+ work orders)
        $customers->each(function ($customer) use ($allUsers) {
            // Each customer gets 3-5 work orders
            $workOrderCount = rand(3, 5);

            for ($i = 0; $i < $workOrderCount; $i++) {
                $workOrder = WorkOrder::factory()->create([
                    'customer_id' => $customer->id,
                    'created_by' => $allUsers->random()->id,
                ]);

                // Add status history for the work order
                StatusHistory::create([
                    'work_order_id' => $workOrder->id,
                    'from_status' => null,
                    'to_status' => 'new',
                    'changed_by' => $workOrder->created_by,
                    'changed_at' => $workOrder->created_at,
                ]);

                // If status is not 'new', add another status history entry
                if ($workOrder->status !== 'new') {
                    StatusHistory::create([
                        'work_order_id' => $workOrder->id,
                        'from_status' => 'new',
                        'to_status' => $workOrder->status,
                        'changed_by' => $allUsers->random()->id,
                        'changed_at' => $workOrder->updated_at,
                    ]);
                }

                // Add 1-4 notes per work order
                $noteCount = rand(1, 4);
                for ($j = 0; $j < $noteCount; $j++) {
                    WorkOrderNote::create([
                        'work_order_id' => $workOrder->id,
                        'user_id' => $allUsers->random()->id,
                        'note' => fake()->paragraph(),
                        'created_at' => $workOrder->created_at->addHours(rand(1, 48)),
                    ]);
                }

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
