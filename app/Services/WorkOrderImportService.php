<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WorkOrderImportService
{
    /**
     * Import work orders from CSV file.
     *
     * @param string $filePath
     * @param int $userId The user creating the work orders
     * @return array
     */
    public function import(string $filePath, int $userId): array
    {
        $imported = 0;
        $importedData = [];
        $failed = [];
        $duplicates = [];

        if (!file_exists($filePath)) {
            throw new \Exception('File not found.');
        }

        $file = fopen($filePath, 'r');
        if ($file === false) {
            throw new \Exception('Unable to open file.');
        }

        // Read header row
        $headers = fgetcsv($file);
        if ($headers === false) {
            fclose($file);
            throw new \Exception('Unable to read CSV headers.');
        }

        // Normalize headers using flexible mapping
        $headerMap = $this->mapHeaders($headers);

        $lineNumber = 1; // Start at 1 (header row)

        while (($row = fgetcsv($file)) !== false) {
            $lineNumber++;

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Map row data to normalized keys
            $data = $this->mapRowData($row, $headers, $headerMap);

            // Trim all values
            $data = array_map('trim', $data);

            // Normalize phone if present
            if (isset($data['customer_phone'])) {
                $data['customer_phone'] = preg_replace('/[^0-9]/', '', $data['customer_phone']);
            }

            // Validate data
            $validator = Validator::make($data, [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'customer_phone' => 'required|string',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'nullable|email|max:255',
                'priority' => 'nullable|in:low,medium,high',
                'due_at' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                $failed[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'errors' => $validator->errors()->all(),
                ];
                continue;
            }

            try {
                // Find or create customer
                $customer = Customer::where('phone', $data['customer_phone'])->first();

                if (!$customer) {
                    $customer = Customer::create([
                        'name' => $data['customer_name'],
                        'phone' => $data['customer_phone'],
                        'email' => $data['customer_email'] ?? null,
                    ]);
                }

                // Create work order
                $workOrder = WorkOrder::create([
                    'title' => $data['title'],
                    'description' => $data['description'] ?? null,
                    'customer_id' => $customer->id,
                    'created_by' => $userId,
                    'status' => 'new',
                    'priority' => $data['priority'] ?? 'medium',
                    'due_at' => isset($data['due_at']) ? \Carbon\Carbon::parse($data['due_at']) : null,
                ]);

                $importedData[] = [
                    'title' => $workOrder->title,
                    'description' => $workOrder->description,
                    'status' => $workOrder->status,
                    'priority' => $workOrder->priority,
                    'due_at' => $workOrder->due_at?->format('Y-m-d'),
                    'customer_name' => $customer->name,
                    'customer_phone' => $customer->phone,
                    'customer_email' => $customer->email,
                ];

                $imported++;
            } catch (\Exception $e) {
                $failed[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'errors' => [$e->getMessage()],
                ];
            }
        }

        fclose($file);

        return [
            'imported' => $imported,
            'imported_data' => $importedData,
            'failed' => $failed,
            'failed_count' => count($failed),
            'duplicates' => count($duplicates),
            'duplicate_rows' => $duplicates,
        ];
    }

    /**
     * Map CSV headers to normalized field names with flexible matching.
     *
     * @param array $headers
     * @return array
     */
    private function mapHeaders(array $headers): array
    {
        $headerMap = [];

        $mappings = [
            'title' => ['title', 'work_order_title', 'job_title', 'subject'],
            'description' => ['description', 'details', 'notes', 'work_order_description'],
            'customer_name' => ['customer_name', 'customer', 'name', 'client_name'],
            'customer_phone' => ['customer_phone', 'phone', 'mobile', 'telephone', 'cell'],
            'customer_email' => ['customer_email', 'email', 'e-mail', 'customer_e-mail'],
            'priority' => ['priority', 'urgency', 'importance'],
            'due_at' => ['due_at', 'due_date', 'deadline', 'due'],
        ];

        foreach ($headers as $index => $header) {
            $normalizedHeader = strtolower(trim($header));
            $normalizedHeader = str_replace([' ', '-', '_'], '', $normalizedHeader);

            foreach ($mappings as $field => $aliases) {
                foreach ($aliases as $alias) {
                    $normalizedAlias = str_replace([' ', '-', '_'], '', strtolower($alias));
                    if ($normalizedHeader === $normalizedAlias) {
                        $headerMap[$index] = $field;
                        break 2;
                    }
                }
            }
        }

        return $headerMap;
    }

    /**
     * Map CSV row data to normalized array.
     *
     * @param array $row
     * @param array $headers
     * @param array $headerMap
     * @return array
     */
    private function mapRowData(array $row, array $headers, array $headerMap): array
    {
        $data = [];

        foreach ($row as $index => $value) {
            if (isset($headerMap[$index])) {
                $data[$headerMap[$index]] = $value;
            }
        }

        return $data;
    }
}
