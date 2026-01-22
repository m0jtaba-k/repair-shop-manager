import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customer Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{customer.name}</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Phone:</span> {customer.phone}
              </div>
              {customer.email && (
                <div>
                  <span className="font-medium">Email:</span> {customer.email}
                </div>
              )}
              {customer.address && (
                <div>
                  <span className="font-medium">Address:</span> {customer.address}
                </div>
              )}
              <div className="text-gray-500 pt-2">
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Work Orders</h3>
            
            {customer.work_orders?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.work_orders.map((wo) => (
                      <tr
                        key={wo.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm">#{wo.id}</td>
                        <td className="px-4 py-3 text-sm">{wo.title}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={wo.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PriorityBadge priority={wo.priority} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {wo.due_at ? new Date(wo.due_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No work orders for this customer yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
