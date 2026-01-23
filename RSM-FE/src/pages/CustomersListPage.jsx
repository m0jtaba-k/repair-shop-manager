import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

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
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        {hasRole('Admin') && (
          <button
            onClick={() => navigate('/customers/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Customer
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            className="w-full border rounded px-4 py-2 pr-10"
            placeholder="Search customers by name, phone, or email..."
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table - only this component re-renders when search/page changes */}
      <CustomersTable data={data} isLoading={isLoading} onPageChange={handlePageChange} />
    </div>
  );
}
