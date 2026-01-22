<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CsvImportController;
use App\Http\Controllers\Api\WorkOrderController;
use App\Http\Controllers\Api\WorkOrderNoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Work Orders
    Route::get('/work-orders', [WorkOrderController::class, 'index']);
    Route::post('/work-orders', [WorkOrderController::class, 'store']);
    Route::get('/work-orders/{work_order}', [WorkOrderController::class, 'show']);
    Route::patch('/work-orders/{work_order}', [WorkOrderController::class, 'update']);
    Route::delete('/work-orders/{work_order}', [WorkOrderController::class, 'destroy']);
    Route::patch('/work-orders/{work_order}/status', [WorkOrderController::class, 'updateStatus']);
    Route::get('/work-orders/{work_order}/status-history', [WorkOrderController::class, 'statusHistory']);

    // Work Order Notes
    Route::get('/work-orders/{work_order}/notes', [WorkOrderNoteController::class, 'index']);
    Route::post('/work-orders/{work_order}/notes', [WorkOrderNoteController::class, 'store']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::patch('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    // CSV Import
    Route::post('/import/customers', [CsvImportController::class, 'importCustomers']);
    Route::post('/import/work-orders', [CsvImportController::class, 'importWorkOrders']);
});
