import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const response = await api.get(`/work-orders/${id}`);
      return response.data.data;
    },
  });

  const { data: statusHistory } = useQuery({
    queryKey: ['work-order-history', id],
    queryFn: async () => {
      const response = await api.get(`/work-orders/${id}/status-history`);
      return response.data.data;
    },
    enabled: showHistory,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteText) => {
      await api.post(`/work-orders/${id}/notes`, { note: noteText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['work-order', id]);
      setNote('');
      alert('Note added successfully');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: async (status) => {
      await api.patch(`/work-orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['work-order', id]);
      setNewStatus('');
      alert('Status updated successfully');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteWorkOrderMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/work-orders/${id}`);
    },
    onSuccess: () => {
      alert('Work order deleted successfully');
      navigate('/work-orders');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete work order');
    },
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (note.trim()) {
      addNoteMutation.mutate(note);
    }
  };

  const handleStatusChange = (e) => {
    e.preventDefault();
    const status = newStatus;
    
    if (status === 'done' || status === 'cancelled') {
      if (confirm(`Are you sure you want to change status to ${status}?`)) {
        changeStatusMutation.mutate(status);
      }
    } else {
      changeStatusMutation.mutate(status);
    }
  };

  const getAvailableStatuses = () => {
    const allStatuses = ['new', 'in_progress', 'waiting_customer', 'done', 'cancelled'];
    
    if (user?.roles?.includes('Support')) {
      return ['in_progress', 'waiting_customer'];
    }
    
    if (user?.roles?.includes('Staff')) {
      return allStatuses.filter((s) => s !== 'cancelled');
    }
    
    return allStatuses;
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this work order? This action cannot be undone.')) {
      deleteWorkOrderMutation.mutate();
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Order #{workOrder.id}</h1>
        {hasRole('Admin') && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/work-orders/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteWorkOrderMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deleteWorkOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{workOrder.title}</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <StatusBadge status={workOrder.status} />
                <PriorityBadge priority={workOrder.priority} />
              </div>
              <p className="text-gray-700">{workOrder.description || 'No description'}</p>
              <div className="text-sm text-gray-600">
                <p>Due Date: {workOrder.due_at ? new Date(workOrder.due_at).toLocaleString() : 'Not set'}</p>
                <p>Created: {new Date(workOrder.created_at).toLocaleString()}</p>
                <p>Created by: {workOrder.creator?.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Customer</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{workOrder.customer?.name}</p>
              <p>Phone: {workOrder.customer?.phone}</p>
              {workOrder.customer?.email && <p>Email: {workOrder.customer.email}</p>}
              {workOrder.customer?.address && <p>Address: {workOrder.customer.address}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Notes</h3>
            <div className="space-y-4 mb-6">
              {workOrder.notes?.length > 0 ? (
                workOrder.notes.map((n) => (
                  <div key={n.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-700">{n.note}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {n.user?.name} - {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notes yet</p>
              )}
            </div>

            {hasPermission('add-work-order-notes') && (
              <form onSubmit={handleAddNote}>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  rows="3"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={!note.trim() || addNoteMutation.isPending}
                >
                  Add Note
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              className="font-semibold mb-4 flex items-center gap-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              Status History
              <span className="text-gray-500">{showHistory ? '▼' : '▶'}</span>
            </button>
            
            {showHistory && statusHistory && (
              <div className="space-y-3">
                {statusHistory.map((history) => (
                  <div key={history.id} className="border-l-2 border-gray-300 pl-4 py-2">
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={history.from_status} />
                      <span>→</span>
                      <StatusBadge status={history.to_status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Changed by {history.changed_by_user?.name} on{' '}
                      {new Date(history.changed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {hasPermission('change-work-order-status') && workOrder.status !== 'done' && (
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="font-semibold mb-4">Change Status</h3>
              <form onSubmit={handleStatusChange}>
                <select
                  className="w-full border rounded px-3 py-2 mb-4"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select status...</option>
                  {getAvailableStatuses().map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={!newStatus || changeStatusMutation.isPending}
                >
                  Update Status
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
