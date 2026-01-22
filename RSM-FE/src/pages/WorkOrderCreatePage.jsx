import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function WorkOrderCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'new',
    customer_id: '',
    due_at: '',
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ['customer-search', customerSearch],
    queryFn: async () => {
      if (!customerSearch || customerSearch.length < 2) return { data: [] };
      const response = await api.get(`/customers?search=${encodeURIComponent(customerSearch)}`);
      return response.data;
    },
    enabled: customerSearch.length >= 2,
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/work-orders', data);
      return response.data;
    },
    onSuccess: (data) => {
      alert('Work order created successfully!');
      navigate(`/work-orders/${data.data.id}`);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create work order');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSearch = (e) => {
    setCustomerSearch(e.target.value);
    setShowCustomerDropdown(true);
  };

  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({ ...prev, customer_id: customer.id }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }

    createWorkOrderMutation.mutate(formData);
  };

  const selectedCustomer = customers?.data?.find((c) => c.id === formData.customer_id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Work Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter work order title..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            placeholder="Enter work order description..."
          />
        </div>

        {/* Customer Search */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerSearch}
            onChange={handleCustomerSearch}
            onFocus={() => customerSearch.length >= 2 && setShowCustomerDropdown(true)}
            className="w-full border rounded px-3 py-2"
            placeholder="Search customer by name, phone, or email..."
            required
          />
          
          {showCustomerDropdown && customers?.data && customers.data.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {customers.data.map((customer) => (
                <div
                  key={customer.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-xs text-gray-500">
                    {customer.phone} {customer.email && `• ${customer.email}`}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="font-medium text-sm">Selected: {selectedCustomer.name}</div>
              <div className="text-xs text-gray-600">{selectedCustomer.phone}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="datetime-local"
              name="due_at"
              value={formData.due_at}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createWorkOrderMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createWorkOrderMutation.isPending ? 'Creating...' : 'Create Work Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/work-orders')}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
