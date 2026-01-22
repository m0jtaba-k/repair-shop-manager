import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export default function CsvImportPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [importType, setImportType] = useState('customers');

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const endpoint = importType === 'customers' ? '/import/customers' : '/import/work-orders';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Import result:', data);
      setResult(data);
      setFile(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Import failed');
    },
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const downloadSample = () => {
    const randomPhone = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const randomEmail = (name) => `${name.toLowerCase().replace(' ', '.')}@example.com`;
    const randomDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1);
      return date.toISOString().split('T')[0];
    };
    
    let csv, filename;
    
    if (importType === 'customers') {
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
      const streets = ['Main St', 'Oak Ave', 'Elm Blvd', 'Maple Dr', 'Pine Rd', 'Cedar Ln', 'Park Ave'];
      
      const customers = [];
      for (let i = 0; i < 3; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const phone = randomPhone();
        const email = randomEmail(name);
        const address = `${Math.floor(Math.random() * 999) + 100} ${streets[Math.floor(Math.random() * streets.length)]}`;
        customers.push(`${name},${phone},${email},${address}`);
      }
      
      csv = 'name,phone,email,address\n' + customers.join('\n');
      filename = 'customers-sample.csv';
    } else {
      const titles = ['Fix laptop screen', 'Install software', 'Repair phone', 'Replace battery', 'Configure network', 'Update OS'];
      const descriptions = [
        'Customer reports cracked screen',
        'Install office suite and antivirus',
        'Screen not responding to touch',
        'Battery draining too quickly',
        'Setup WiFi and printer connection',
        'Upgrade to latest version'
      ];
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
      const priorities = ['low', 'medium', 'high'];
      
      const workOrders = [];
      for (let i = 0; i < 3; i++) {
        const title = titles[Math.floor(Math.random() * titles.length)];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const phone = randomPhone();
        const email = randomEmail(name);
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const dueDate = randomDate();
        workOrders.push(`${title},${description},${name},${phone},${email},${priority},${dueDate}`);
      }
      
      csv = 'title,description,customer_name,customer_phone,customer_email,priority,due_at\n' + workOrders.join('\n');
      filename = 'work-orders-sample.csv';
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Import from CSV</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Import Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="importType"
                value="customers"
                checked={importType === 'customers'}
                onChange={(e) => {
                  setImportType(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                className="mr-2"
              />
              <span>Customers</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="importType"
                value="work-orders"
                checked={importType === 'work-orders'}
                onChange={(e) => {
                  setImportType(e.target.value);
                  setFile(null);
                  setResult(null);
                }}
                className="mr-2"
              />
              <span>Work Orders</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={downloadSample}
            className="text-blue-600 hover:underline text-sm"
          >
            Download Sample CSV for {importType === 'customers' ? 'Customers' : 'Work Orders'} [TESTING PURPOSES]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select CSV File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploadMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Importing...' : 'Import'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Import Results</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">
                {result.imported_count || result.imported || 0}
              </div>
              <div className="text-sm text-gray-600">Imported</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-600">
                {result.failed_rows?.length || result.failed_count || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {result.duplicate_count || result.duplicates || 0}
              </div>
              <div className="text-sm text-gray-600">Duplicates</div>
            </div>
          </div>

          {(result.failed_rows?.length > 0 || result.failed?.length > 0) && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Failed Rows:</h3>
              <div className="max-h-96 overflow-y-auto">
                {(result.failed_rows || result.failed).map((fail, index) => (
                  <div key={index} className="mb-3 p-3 bg-red-50 rounded border border-red-200">
                    <div className="font-medium text-red-800">Line {fail.line_number}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Data:</strong> {JSON.stringify(fail.row_data)}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      <strong>Errors:</strong> {fail.errors.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.duplicate_rows?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Duplicate Rows (Skipped):</h3>
              <div className="max-h-96 overflow-y-auto">
                {result.duplicate_rows.map((dup, index) => (
                  <div key={index} className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-800">Line {dup.line_number}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Data:</strong> {JSON.stringify(dup.row_data)}
                    </div>
                    <div className="text-sm text-yellow-600 mt-1">
                      <strong>Reason:</strong> {dup.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.imported_data && result.imported_data.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Successfully Imported:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {importType === 'customers' ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.imported_data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {importType === 'customers' ? (
                          <>
                            <td className="px-4 py-3 text-sm">{item.name}</td>
                            <td className="px-4 py-3 text-sm">{item.phone}</td>
                            <td className="px-4 py-3 text-sm">{item.email || '-'}</td>
                            <td className="px-4 py-3 text-sm">{item.address || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm font-medium">{item.title}</td>
                            <td className="px-4 py-3 text-sm">
                              <div>{item.customer_name}</div>
                              <div className="text-gray-500 text-xs">{item.customer_phone}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{item.due_at || '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

