<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CustomerImportService
{
    /**
     * Import customers from CSV file.
     *
     * @param string $filePath
     * @return array
     */
    public function import(string $filePath): array
    {
        $imported = 0;
        $importedData = [];
        $failed = [];
        $duplicates = [];
        $existingPhones = [];
        $csvPhones = [];

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

            // Normalize phone
            if (isset($data['phone'])) {
                $data['phone'] = preg_replace('/[^0-9]/', '', $data['phone']);
            }

            // Validate data
            $validator = Validator::make($data, [
                'name' => 'required|string|max:255',
                'phone' => 'required|string',
                'email' => 'nullable|email|max:255',
                'address' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                $failed[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'errors' => $validator->errors()->all(),
                ];
                continue;
            }

            $validatedData = $validator->validated();

            // Check for duplicate phone in database
            if (isset($existingPhones[$validatedData['phone']])) {
                $duplicates[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'reason' => 'Phone number already exists in database.',
                ];
                continue;
            }

            if (Customer::where('phone', $validatedData['phone'])->exists()) {
                $existingPhones[$validatedData['phone']] = true;
                $duplicates[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'reason' => 'Phone number already exists in database.',
                ];
                continue;
            }

            // Check for duplicate within this CSV
            if (isset($csvPhones[$validatedData['phone']])) {
                $duplicates[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'reason' => 'Phone number already exists in this CSV file.',
                ];
                continue;
            }

            $csvPhones[$validatedData['phone']] = true;

            // Create customer
            try {
                $customer = Customer::create($validatedData);
                $importedData[] = [
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'email' => $customer->email,
                    'address' => $customer->address,
                ];
                $imported++;
            } catch (\Exception $e) {
                $failed[] = [
                    'line_number' => $lineNumber,
                    'row_data' => $data,
                    'errors' => ['Failed to create customer: ' . $e->getMessage()],
                ];
            }
        }

        fclose($file);

        return [
            'imported_count' => $imported,
            'imported_data' => $importedData,
            'failed_rows' => $failed,
            'duplicate_count' => count($duplicates),
            'duplicate_rows' => $duplicates,
        ];
    }

    /**
     * Map CSV headers to normalized field names.
     *
     * @param array $headers
     * @return array
     */
    protected function mapHeaders(array $headers): array
    {
        $map = [];

        foreach ($headers as $index => $header) {
            $normalized = Str::slug($header, '_');

            // Map variations to standard field names
            $standardField = match (true) {
                in_array($normalized, ['name', 'full_name', 'customer_name', 'client_name']) => 'name',
                in_array($normalized, ['phone', 'phone_number', 'contact', 'telephone', 'mobile']) => 'phone',
                in_array($normalized, ['email', 'email_address', 'e_mail']) => 'email',
                in_array($normalized, ['address', 'location', 'street_address']) => 'address',
                default => $normalized,
            };

            $map[$index] = $standardField;
        }

        return $map;
    }

    /**
     * Map row data to normalized keys.
     *
     * @param array $row
     * @param array $headers
     * @param array $headerMap
     * @return array
     */
    protected function mapRowData(array $row, array $headers, array $headerMap): array
    {
        $data = [];

        foreach ($row as $index => $value) {
            if (isset($headerMap[$index])) {
                $key = $headerMap[$index];
                $data[$key] = $value;
            }
        }

        return $data;
    }
}
