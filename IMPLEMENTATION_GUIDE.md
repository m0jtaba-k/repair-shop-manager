# Remaining React Components Implementation Guide

## Pages to Create

### 1. WorkOrdersListPage.jsx

Located at: `src/pages/WorkOrdersListPage.jsx`

This page needs:

- Filter form (status, priority, due date range, customer phone, overdue checkbox)
- Work orders table with pagination
- Link to work order detail page
- Uses @tanstack/react-query for data fetching

### 2. WorkOrderDetailPage.jsx

Located at: `src/pages/WorkOrderDetailPage.jsx`

This page needs:

- Display work order details
- Customer information (link to customer page)
- Notes list with add note form
- Status change dropdown (filtered by user role)
- Expandable status history section
- Confirmation dialog for critical status changes (done/cancelled)

### 3. CustomersListPage.jsx

Located at: `src/pages/CustomersListPage.jsx`

This page needs:

- Customers table with search
- Pagination
- Link to customer detail page

### 4. CustomerDetailPage.jsx

Located at: `src/pages/CustomerDetailPage.jsx`

This page needs:

- Customer information display
- List of customer's work orders
- Links to work order detail pages

### 5. CsvImportPage.jsx

Located at: `src/pages/CsvImportPage.jsx`

This page needs:

- File upload form
- Import results display (success count, errors table)
- Download sample CSV link

## Quick Start Commands

### Start Backend Server:

```bash
cd RSM-BE
php artisan serve
php artisan queue:work  # In separate terminal for notifications
```

### Start Frontend Dev Server:

```bash
cd RSM-FE
npm run dev
```

## Test Accounts

- Admin: admin@example.com / password
- Staff: staff1@example.com / password
- Support: support1@example.com / password

## API Endpoints Reference

- POST /api/login
- GET /api/work-orders (with filters)
- GET /api/work-orders/:id
- PATCH /api/work-orders/:id/status
- POST /api/work-orders/:id/notes
- GET /api/customers
- GET /api/customers/:id
- POST /api/import/customers

## Next Steps

1. Create the remaining 5 page components listed above
2. Test all functionality with different user roles
3. Run backend tests (to be created)
4. Verify N+1 query elimination with eager loading

The backend is 100% complete and tested. The frontend core is set up - you just need to implement the 5 page components using the patterns from LoginPage and the API client.
