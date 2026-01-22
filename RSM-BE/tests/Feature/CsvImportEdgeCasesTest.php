<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CsvImportEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin']);
        Permission::create(['name' => 'import-customers']);
        Permission::create(['name' => 'create-work-orders']);
        $adminRole->givePermissionTo(['import-customers', 'create-work-orders']);
    }

    /** @test */
    public function it_handles_invalid_email_in_csv_import()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $csvContent = "name,phone,email,address\nJohn Doe,1234567890,invalid-email,123 Main St";
        $file = UploadedFile::fake()->createWithContent('customers.csv', $csvContent);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/import/customers', [
                'file' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('imported_count', 0)
            ->assertJsonPath('failed_rows.0.errors.0', 'The email field must be a valid email address.');

        $this->assertDatabaseMissing('customers', [
            'name' => 'John Doe',
            'phone' => '1234567890',
        ]);
    }

    /** @test */
    public function it_handles_malformed_date_in_work_order_csv()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // Create a customer first
        Customer::factory()->create([
            'name' => 'Jane Smith',
            'phone' => '9876543210',
        ]);

        $csvContent = "title,description,customer_name,customer_phone,customer_email,priority,due_at\n";
        $csvContent .= "Fix laptop,Screen repair,Jane Smith,9876543210,jane@example.com,high,not-a-date";

        $file = UploadedFile::fake()->createWithContent('work-orders.csv', $csvContent);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/import/work-orders', [
                'file' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('imported', 0)
            ->assertJson([
                'failed_count' => 1,
            ]);

        $this->assertDatabaseMissing('work_orders', [
            'title' => 'Fix laptop',
        ]);
    }

    /** @test */
    public function it_detects_duplicate_phone_in_customer_csv()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // Create existing customer
        Customer::factory()->create([
            'name' => 'Existing Customer',
            'phone' => '5555555555',
        ]);

        $csvContent = "name,phone,email,address\n";
        $csvContent .= "John Doe,1234567890,john@example.com,123 Main St\n";
        $csvContent .= "Duplicate Phone,5555555555,dup@example.com,456 Oak Ave";

        $file = UploadedFile::fake()->createWithContent('customers.csv', $csvContent);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/import/customers', [
                'file' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('imported_count', 1)
            ->assertJsonPath('duplicate_count', 1)
            ->assertJsonPath('duplicate_rows.0.reason', 'Phone number already exists in database.');

        // Only John Doe should be imported
        $this->assertDatabaseHas('customers', [
            'name' => 'John Doe',
            'phone' => '1234567890',
        ]);

        // Duplicate should not create new record
        $this->assertEquals(2, Customer::count()); // Existing + John Doe only
    }
}
