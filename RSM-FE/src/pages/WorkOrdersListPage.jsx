import { useState, memo} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../contexts/AuthContext';


// Memoized table component that only re-renders when data changes
const WorkOrdersTable = memo(function WorkOrdersTable({ data, isLoading, onPageChange }) {
  const navigate = useNavigate();

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.data?.map((workOrder) => (
            <tr
              key={workOrder.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/work-orders/${workOrder.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm">#{workOrder.id}</td>
              <td className="px-6 py-4 text-sm">{workOrder.title}</td>
              <td className="px-6 py-4 text-sm">{workOrder.customer?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={workOrder.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityBadge priority={workOrder.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {workOrder.due_at ? new Date(workOrder.due_at).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Showing {data?.meta?.from || 0} to {data?.meta?.to || 0} of {data?.meta?.total || 0} results
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            disabled={!data?.meta || data?.meta?.current_page === 1}
            onClick={() => onPageChange(data?.meta?.current_page - 1)}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {data?.meta?.current_page || 1} of {data?.meta?.last_page || 1}
          </span>
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            disabled={!data?.meta || data?.meta?.current_page >= data?.meta?.last_page}
            onClick={() => onPageChange(data?.meta?.current_page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

export default function WorkOrdersListPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    customer_phone: '',
    customer_name: '',
    due_date_from: '',
    due_date_to: '',
    overdue: false,
    page: 1,
  });

  // Temporary state for date pickers
  const [tempDates, setTempDates] = useState({
    due_date_from: '',
    due_date_to: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/work-orders?${params}`);
      console.log('Work Orders API Response:', response.data);
      return response.data;
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: value, 
      ...(key !== 'page' && { page: 1 }) // Only reset to page 1 if not changing page itself
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };


  const applyDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      due_date_from: tempDates.due_date_from,
      due_date_to: tempDates.due_date_to,
      page: 1,
    }));
  };

  const clearDateFilter = () => {
    setTempDates({ due_date_from: '', due_date_to: '' });
    setFilters((prev) => ({
      ...prev,
      due_date_from: '',
      due_date_to: '',
      page: 1,
    }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        {hasRole('Admin') && (
          <button
            onClick={() => navigate('/work-orders/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Work Order
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting Customer</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium mb-2">Customer Phone</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Search by phone..."
              value={filters.customer_phone}
              onChange={(e) => handleFilterChange('customer_phone', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Due Date From</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={tempDates.due_date_from}
              onChange={(e) => setTempDates((prev) => ({ ...prev, due_date_from: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date To</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={tempDates.due_date_to}
              onChange={(e) => setTempDates((prev) => ({ ...prev, due_date_to: e.target.value }))}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.overdue}
                onChange={(e) => handleFilterChange('overdue', e.target.checked)}
              />
              <span className="text-sm font-medium">Overdue Only</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={applyDateFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!tempDates.due_date_from && !tempDates.due_date_to}
          >
            Apply Date Filter
          </button>
          {(filters.due_date_from || filters.due_date_to) && (
            <button
              onClick={clearDateFilter}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Table - only this component re-renders when filters change */}
      <WorkOrdersTable data={data} isLoading={isLoading} onPageChange={handlePageChange} />
    </div>
  );
}
