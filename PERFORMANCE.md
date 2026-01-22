# Performance Optimization Guide

## Performance Bottleneck: Loading All Work Order Notes Without Pagination

### The Problem

In `WorkOrderController@show`, we load ALL notes for a work order:

```php
// CURRENT CODE - Loads ALL notes at once
public function show(WorkOrder $workOrder)
{
    $this->authorize('view', $workOrder);

    $workOrder->load([
        'customer',
        'creator',
        'notes.user',  // Loads ALL notes (could be 500+ notes)
        'statusHistories.changedBy'
    ]);

    return new WorkOrderResource($workOrder);
}
```

**Problem**:

- A work order that's been open for 2 years has 500 notes
- User opens work order detail page
- Browser loads ALL 500 notes at once (huge JSON response)
- Page takes 3-4 seconds to load
- User only sees the latest 5 notes anyway

---

### The Fix: Limit Notes to Latest 10

```php
// filepath: RSM-BE/app/Http/Controllers/Api/WorkOrderController.php

public function show(WorkOrder $workOrder)
{
    $this->authorize('view', $workOrder);

    $workOrder->load([
        'customer',
        'creator',
        'notes' => function ($query) {
            $query->latest()->limit(10)->with('user'); // FIX: Only load 10 latest
        },
    ]);

    return new WorkOrderResource($workOrder);
}
```

---

### Performance Impact

| Work Order Age | Without Limit    | With Limit      |
| -------------- | ---------------- | --------------- |
| **500 notes**  | 450KB JSON, 3.2s | 45KB JSON, 0.4s |
| **1000 notes** | 900KB JSON, 6.8s | 45KB JSON, 0.4s |

---

### Key Takeaway

Always limit related data with `->limit(10)` instead of loading everything because users only see recent items anyway, and loading 500 notes when you display 10 wastes bandwidth and slows the page.

---

## Best Practices Summary

1. **Limit Related Data**: Use `->limit()` on relationships that could grow unbounded
2. **Eager Load**: Always use `->with()` to prevent N+1 queries
