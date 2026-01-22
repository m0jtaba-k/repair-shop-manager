<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin']);
        Permission::create(['name' => 'create-work-orders']);
        Permission::create(['name' => 'view-work-orders']);
        Permission::create(['name' => 'change-work-order-status']);
        $adminRole->givePermissionTo(['create-work-orders', 'view-work-orders', 'change-work-order-status']);
    }

    /** @test */
    public function it_can_transition_from_new_to_in_progress()
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

        $response->assertStatus(200);
        $this->assertEquals('in_progress', $workOrder->fresh()->status);
    }

    /** @test */
    public function it_prevents_invalid_status_transitions()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = Customer::factory()->create();
        $workOrder = WorkOrder::factory()->create([
            'customer_id' => $customer->id,
            'created_by' => $admin->id,
            'status' => 'done',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/work-orders/{$workOrder->id}/status", [
                'status' => 'new',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Cannot change status from "done" to another status.');

        // Status should remain unchanged
        $this->assertEquals('done', $workOrder->fresh()->status);
    }
}
