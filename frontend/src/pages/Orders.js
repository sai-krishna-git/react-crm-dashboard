import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaEdit,
} from 'react-icons/fa';
import { getToken } from '../auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState('');

  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://localhost:5000/api/orders/admin/all',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <FaClock className="text-yellow-500" />;
      case 'Shipped':
        return <FaShippingFast className="text-blue-500" />;
      case 'Delivered':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleStatusChange = (e) => {
    setStatusToUpdate(e.target.value);
  };

  const updateOrderStatus = async (orderId) => {
    if (!statusToUpdate) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: statusToUpdate }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update order status');
      }

      toast.success(`Order status updated to ${statusToUpdate}`);
      setEditingOrder(null);
      setStatusToUpdate('');
      fetchOrders(); // Refresh the order list
    } catch (err) {
      console.error('Error updating order status:', err.message);
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateId = (id) => id.substring(id.length - 6);

  if (loading) {
    return (
      <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 transition-all duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBox className="text-blue-500" /> Orders Management
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600">
            No orders available in the database.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">
              All Orders ({orders.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      #{truncateId(order._id)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {order.customer?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.customer?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {order.orderItems.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {editingOrder === order._id ? (
                        <div className="flex items-center space-x-2 justify-center">
                          <select
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            value={statusToUpdate}
                            onChange={handleStatusChange}
                          >
                            <option value="">Select Status</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => updateOrderStatus(order._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrder(null);
                              setStatusToUpdate('');
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingOrder(order._id);
                            setStatusToUpdate(order.status);
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mx-auto"
                        >
                          <FaEdit /> Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal (could be implemented for viewing details) */}
    </div>
  );
};

export default Orders;
