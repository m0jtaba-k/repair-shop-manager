<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view-work-orders',
            'create-work-orders',
            'edit-work-orders',
            'delete-work-orders',
            'change-work-order-status',
            'cancel-work-orders',
            'add-work-order-notes',
            'view-customers',
            'create-customers',
            'edit-customers',
            'delete-customers',
            'import-customers',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Admin role with all permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Create Staff role
        $staffRole = Role::create(['name' => 'Staff']);
        $staffRole->givePermissionTo([
            'view-work-orders',
            'create-work-orders',
            'edit-work-orders',
            'change-work-order-status',
            'add-work-order-notes',
            'view-customers',
            'create-customers',
            'edit-customers',
            'import-customers',
        ]);

        // Create Support role
        $supportRole = Role::create(['name' => 'Support']);
        $supportRole->givePermissionTo([
            'view-work-orders',
            'add-work-order-notes',
            'change-work-order-status', // Limited by policy logic
            'view-customers',
        ]);
    }
}
