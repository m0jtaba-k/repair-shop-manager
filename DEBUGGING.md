# Debugging Guide

Common tricky bugs encountered during development.

---

## 1. Duplicate Queue Migration Error

**Problem:** `SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'jobs' already exists`

**Solution:** Laravel 11 already includes queue tables in default migrations. Delete any custom queue table migrations:

```bash
Remove-Item database/migrations/*_create_queue_tables.php
```

---

## 2. Test Failing: Route Not Found (404)

**Problem:** Status change test returns 404 with `POST /api/work-orders/{id}/change-status`

**Solution:** Use correct route and HTTP method:

```php
// Wrong
$response = $this->postJson("/api/work-orders/{$workOrder->id}/change-status", [...]);

// Correct
$response = $this->patchJson("/api/work-orders/{$workOrder->id}/status", [...]);
```

Check actual routes with: `php artisan route:list --path=work-orders`

---

## 3. Test Failing: Missing Permissions (403)

**Problem:** Test fails with "This action is unauthorized" even though user has role.

**Solution:** Assign specific permissions, not just roles:

```php
$user->givePermissionTo('add-work-order-notes');
$user->givePermissionTo('change-work-order-status');
```

Common missing permissions: `add-work-order-notes`, `change-work-order-status`, `create-work-orders`, `import-customers`

---
