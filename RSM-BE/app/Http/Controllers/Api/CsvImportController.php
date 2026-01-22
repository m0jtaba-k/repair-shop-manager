<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportCustomersRequest;
use App\Services\CustomerImportService;
use App\Services\WorkOrderImportService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CsvImportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected CustomerImportService $customerImportService,
        protected WorkOrderImportService $workOrderImportService
    ) {
    }

    /**
     * Handle customer CSV import.
     */
    public function importCustomers(ImportCustomersRequest $request)
    {
        $this->authorize('import-customers');

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        try {
            $result = $this->customerImportService->import($filePath);

            return response()->json([
                'message' => 'Import completed successfully',
                'imported_count' => $result['imported_count'],
                'imported_data' => $result['imported_data'],
                'failed_rows' => $result['failed_rows'],
                'duplicate_count' => $result['duplicate_count'],
                'duplicate_rows' => $result['duplicate_rows'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle work order CSV import.
     */
    public function importWorkOrders(Request $request)
    {
        $this->authorize('create-work-orders');

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $filePath = $file->getRealPath();

        try {
            $result = $this->workOrderImportService->import($filePath, $request->user()->id);

            return response()->json([
                'message' => 'Import completed successfully',
                'imported' => $result['imported'],
                'imported_data' => $result['imported_data'],
                'failed_count' => $result['failed_count'],
                'failed' => $result['failed'],
                'duplicates' => $result['duplicates'],
                'duplicate_rows' => $result['duplicate_rows'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
