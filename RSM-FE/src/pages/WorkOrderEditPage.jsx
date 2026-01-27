import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import CustomerNameAutocomplete from '../components/CustomerNameAutocomplete';

export default function WorkOrderEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'new',
    customer_id: '',
    due_at: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { isLoading } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: async () => {
      const response = await api.get(`/work-orders/${id}`);
      const workOrder = response.data.data;
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'new',
        customer_id: workOrder.customer_id || '',
        due_at: workOrder.due_at ? new Date(workOrder.due_at).toISOString().slice(0, 16) : '',
      });
      setSelectedCustomer(workOrder.customer);
      return workOrder;
    },
  });

  const updateWorkOrderMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch(`/work-orders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrder', id]);
      alert('Work order updated successfully!');
      navigate(`/work-orders/${id}`);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update work order');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customer_id: customer?.id || '' }));
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

    updateWorkOrderMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Work Order</h1>
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
        <div>
          <label className="block text-sm font-medium mb-2">
            Customer <span className="text-red-500">*</span>
          </label>
          <CustomerNameAutocomplete
            value={selectedCustomer?.name || ''}
            onSelect={handleCustomerSelect}
          />
          
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
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
            disabled={updateWorkOrderMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateWorkOrderMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/work-orders/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
