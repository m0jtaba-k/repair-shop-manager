<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin']);
        $staffRole = Role::create(['name' => 'Staff']);

        Permission::create(['name' => 'create-work-orders']);
        Permission::create(['name' => 'view-work-orders']);
        Permission::create(['name' => 'import-customers']);

        $adminRole->givePermissionTo(['create-work-orders', 'view-work-orders', 'import-customers']);
        $staffRole->givePermissionTo(['view-work-orders']);
    }

    /** @test */
    public function admin_can_create_work_orders_but_staff_cannot()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        $customer = Customer::factory()->create();

        // Admin can create
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/work-orders', [
                'customer_id' => $customer->id,
                'title' => 'Test work order',
                'status' => 'new',
                'priority' => 'medium',
            ]);

        $response->assertStatus(201);

        // Staff cannot create
        $response = $this->actingAs($staff, 'sanctum')
            ->postJson('/api/work-orders', [
                'customer_id' => $customer->id,
                'title' => 'Another work order',
                'status' => 'new',
                'priority' => 'medium',
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_import_customers_but_staff_cannot()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        $csvContent = "name,phone,email,address\nJohn Doe,1234567890,john@example.com,123 Main St";
        $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('customers.csv', $csvContent);

        // Admin can import
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/import/customers', [
                'file' => $file,
            ]);

        $response->assertStatus(200);

        // Staff cannot import
        $response = $this->actingAs($staff, 'sanctum')
            ->postJson('/api/import/customers', [
                'file' => $file,
            ]);

        $response->assertStatus(403);
    }
}
