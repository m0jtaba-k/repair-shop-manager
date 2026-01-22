# Repair Shop Manager

A comprehensive repair shop management system built with Laravel 11 and React 19. Manage work orders, customers, notes, and status tracking with role-based permissions.

## Features

- 🔐 **Authentication** - Sanctum token-based auth
- 👥 **Role-Based Access Control** - Admin, Staff, and Support roles with granular permissions
- 📋 **Work Order Management** - Create, track, and manage repair work orders
- 👤 **Customer Management** - Customer database with contact information
- 📝 **Notes & History** - Add notes and track status changes
- 📊 **CSV Import** - Bulk import customers and work orders with flexible header mapping
- 🔍 **Advanced Filtering** - Filter by status, priority, date ranges, and search
- � **Queue Notifications** - Async customer notifications when status changes to waiting_customer
- �📱 **Responsive UI** - Modern React SPA with Tailwind CSS

## Tech Stack

### Backend

- Laravel 11.x
- PHP 8.2+
- MySQL 8.0+
- Laravel Sanctum (Authentication)
- Spatie Laravel-Permission (Authorization)

### Frontend

- React 19.2.0
- Vite 7.3.1
- TanStack Query (React Query)
- Tailwind CSS 4.x
- Axios

---

## Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 20.17.0
- MySQL >= 8.0
- Git

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd repair-shop-manager
```

### 2. Backend Setup (Laravel)

```bash
cd RSM-BE

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=repair_shop
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database with test data
php artisan db:seed

# This creates:
# - 3 users (admin@example.com, staff1@example.com, support1@example.com)
# - 50 customers
# - 200+ work orders with notes and status histories
# Default password for all users: password
```

### 3. Frontend Setup (React)

```bash
cd ../RSM-FE

# Install Node dependencies
npm install

# Copy environment file (if needed)
# Create .env file if you need custom API URL
echo "VITE_API_URL=http://localhost:8000" > .env
```

---

## Running the Application

### Start Backend (Laravel)

```bash
cd RSM-BE

# Start development server
php artisan serve

# Backend will run on http://localhost:8000
```

### Start Queue Worker (Required)

The application uses Laravel queues for sending status notifications. A queue job is automatically dispatched when a work order status changes to `waiting_customer`. You must run a queue worker:

```bash
cd RSM-BE

# Start queue worker
php artisan queue:work

# Or run in background (production)
php artisan queue:work --daemon --tries=3 --timeout=60

# Monitor queue
php artisan queue:monitor notifications

# Process failed jobs
php artisan queue:retry all
```

**Note:** Queue tables (`jobs`, `failed_jobs`, `job_batches`) are already created by Laravel's default migrations. Without a queue worker running, customer notifications won't be sent when status changes to `waiting_customer`.

### Configure Queue Driver (Optional)

By default, the app uses the `database` queue driver. To use Redis:

```bash
# Install Redis PHP extension
# Windows: uncomment extension=redis in php.ini
# Linux: sudo apt-get install php-redis

# Update .env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Install predis (if not using phpredis extension)
composer require predis/predis

# Start Redis server
redis-server
```

### Start Frontend (React)

```bash
cd RSM-FE

# Start Vite dev server
npm run dev

# Frontend will run on http://localhost:5175
# (Vite may use 5173 if 5175 is taken)
```

### Access the Application

1. Open browser to `http://localhost:5175`
2. Login with test credentials:
    - **Admin**: `admin@example.com` / `password`
    - **Staff**: `staff1@example.com` / `password`
    - **Support**: `support1@example.com` / `password`

---

## Running Tests

### Backend Tests (PHPUnit)

```bash
cd RSM-BE

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ApiEndpointTest.php

# Run with coverage (requires Xdebug)
php artisan test --coverage

# Run specific test method
php artisan test --filter=it_can_list_work_orders_with_filters
```

### Test Suites

- **ApiEndpointTest** - Tests API endpoints (list, create, notes, status)
- **StatusTransitionTest** - Tests status change validation
- **RoleAuthorizationTest** - Tests permission-based access control
- **CsvImportEdgeCasesTest** - Tests CSV import error handling

---

## Queue Workers

```bash
cd RSM-BE

# Start queue worker
php artisan queue:work

# Run queue worker in background (production)
php artisan queue:work --daemon

# Process failed jobs
php artisan queue:retry all

# Monitor queue status
php artisan queue:monitor
```

---

## Queue System

### How It Works

When a work order status changes to `waiting_customer`, a job is automatically dispatched to the queue:

1. **Status Change** → `WorkOrderService::changeStatus()`
2. **Job Dispatched** → `SendStatusNotificationJob` added to queue
3. **Queue Worker** → Processes job asynchronously
4. **Notification Sent** → Customer receives notification

### Queue Configuration

```bash
# .env configuration
QUEUE_CONNECTION=database  # or 'redis', 'sync' (for testing)

# Queue-specific settings
QUEUE_FAILED_DRIVER=database-uuids
```

### Managing Queues

```bash
# List failed jobs
php artisan queue:failed

# Retry specific failed job
php artisan queue:retry {job-id}

# Retry all failed jobs
php artisan queue:retry all

# Flush all failed jobs
php artisan queue:flush

# Clear all jobs from queue (use with caution!)
php artisan queue:clear

# Restart queue workers (after code changes)
php artisan queue:restart
```

### Queue Tables

The system uses these queue-related tables:

- `jobs` - Pending jobs
- `failed_jobs` - Jobs that failed after max retries
- `job_batches` - Batch job tracking

### Monitoring in Production

```bash
# Supervisor configuration example (Linux)
[program:repair-shop-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/queue-worker.log
```

---

## Development

### Backend Development

```bash
cd RSM-BE

# Watch for file changes (if using Laravel Mix)
npm run dev

# Clear application cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Generate IDE helper files
php artisan ide-helper:generate
php artisan ide-helper:models

# Run code style fixer
./vendor/bin/pint
```

### Frontend Development

```bash
cd RSM-FE

# Run dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Project Structure

```
repair-shop-manager/
├── RSM-BE/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/       # Business logic layer
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── tests/
│       └── Feature/
│
├── RSM-FE/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   └── pages/
│   └── public/
│
├── DECISIONS.md            # Architecture decisions
├── PERFORMANCE.md          # Performance guidelines
└── README.md              # This file
```
