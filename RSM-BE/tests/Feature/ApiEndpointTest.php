<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ApiEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles and permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $staffRole = Role::create(['name' => 'Staff']);

        Permission::create(['name' => 'create-work-orders']);
        Permission::create(['name' => 'view-work-orders']);
        Permission::create(['name' => 'import-customers']);
        Permission::create(['name' => 'add-work-order-notes']);
        Permission::create(['name' => 'change-work-order-status']);

        $adminRole->givePermissionTo([
            'create-work-orders',
            'view-work-orders',
            'import-customers',
            'add-work-order-notes',
            'change-work-order-status'
        ]);
        $staffRole->givePermissionTo(['view-work-orders']);
    }

    /** @test */
    public function it_can_list_work_orders_with_filters()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = Customer::factory()->create();

        WorkOrder::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
            'status' => 'new',
            'priority' => 'high',
        ]);

        WorkOrder::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
            'status' => 'in_progress',
            'priority' => 'low',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/work-orders?status=new&priority=high');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'new')
            ->assertJsonPath('data.0.priority', 'high');
    }

    /** @test */
    public function it_can_create_a_work_order()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = Customer::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/work-orders', [
                'customer_id' => $customer->id,
                'title' => 'Fix broken screen',
                'description' => 'Screen has multiple cracks',
                'status' => 'new',
                'priority' => 'high',
                'due_at' => '2026-02-01',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Fix broken screen')
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.priority', 'high');

        $this->assertDatabaseHas('work_orders', [
            'title' => 'Fix broken screen',
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
        ]);
    }

    /** @test */
    public function it_can_add_notes_to_work_order()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = Customer::factory()->create();
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/work-orders/{$workOrder->id}/notes", [
                'note' => 'Customer confirmed the issue',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.note', 'Customer confirmed the issue');

        $this->assertDatabaseHas('work_order_notes', [
            'work_order_id' => $workOrder->id,
            'user_id' => $admin->id,
            'note' => 'Customer confirmed the issue',
        ]);
    }

    /** @test */
    public function it_can_change_work_order_status()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = Customer::factory()->create();
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
            'status' => 'new',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/work-orders/{$workOrder->id}/status", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');

        $this->assertDatabaseHas('work_orders', [
            'id' => $workOrder->id,
            'status' => 'in_progress',
        ]);

        $this->assertDatabaseHas('status_histories', [
            'work_order_id' => $workOrder->id,
            'from_status' => 'new',
            'to_status' => 'in_progress',
            'changed_by' => $admin->id,
        ]);
    }
}
