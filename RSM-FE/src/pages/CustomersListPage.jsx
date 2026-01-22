import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

// Memoized table component that only re-renders when data changes
const CustomersTable = memo(function CustomersTable({ data, isLoading, onPageChange }) {
  const navigate = useNavigate();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.data?.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm">#{customer.id}</td>
              <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.phone}</td>
              <td className="px-6 py-4 text-sm">{customer.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Showing {data?.meta?.from || 0} to {data?.meta?.to || 0} of {data?.meta?.total || 0} results
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            disabled={data?.meta?.current_page === 1}
            onClick={() => onPageChange(data?.meta?.current_page - 1)}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            disabled={data?.meta?.current_page === data?.meta?.last_page}
            onClick={() => onPageChange(data?.meta?.current_page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

export default function CustomersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      const url = `/customers?${params.toString()}`;
      console.log('Customer search URL:', url);
      console.log('Search state:', search);
      const response = await api.get(url);
      console.log('Customer search response total:', response.data.meta?.total);
      return response.data;
    },
  });

  const handleSearch = () => {
    console.log('handleSearch called');
    console.log('tempSearch:', tempSearch);
    console.log('current search state:', search);
    setSearch(tempSearch);
    setPage(1);
    console.log('after setState');
  };

  const clearSearch = () => {
    setTempSearch('');
    setSearch('');
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          className="flex-1 max-w-md border rounded px-4 py-2"
          placeholder="Search customers by name, phone, or email..."
          value={tempSearch}
          onChange={(e) => setTempSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
        {search && (
          <button
            onClick={clearSearch}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table - only this component re-renders when search/page changes */}
      <CustomersTable data={data} isLoading={isLoading} onPageChange={handlePageChange} />
    </div>
  );
}
