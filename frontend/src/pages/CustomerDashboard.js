import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../auth';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('customerDarkMode') === 'true'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken('customer');
    console.log('Customer token:', token); // Debugging line
    if (!token) {
      navigate('/customer-login');
      return;
    }

    const fetchCustomerData = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/customers/auth/profile',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Response:', response); // Debugging line
        if (response.ok) {
          const data = await response.json();
          // If your backend returns just customer object (not wrapped)
          setCustomer(data.customer || data);
          setOrders(data.orders || []);
        } else if (response.status === 401) {
          console.log(response);
          logout('customer');
          navigate('/customer-login');
        } else {
          console.error('Failed to fetch customer data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/customer-login');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate]);

  const handleLogout = () => {
    logout('customer');
    navigate('/customer-login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('customerDarkMode', newMode.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading your dashboard...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        Failed to load customer data. Please login again.
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {customer?.name} 👋
          </h1>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 text-sm rounded bg-gray-300 dark:bg-gray-700"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Here’s a quick overview of your account.
        </p>

        {/* Profile */}
        <div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p>
            <strong>Email:</strong> {customer?.email}
          </p>
          <p>
            <strong>Phone:</strong> {customer?.phone}
          </p>
          <p>
            <strong>Address:</strong> {customer?.address}
          </p>
        </div>

        {/* Orders */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Your Orders</h2>
          {orders.length > 0 ? (
            <ul className="space-y-2">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>
                    {order.product} ({order.date})
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm ${
                      order.status === 'Delivered'
                        ? 'bg-green-500'
                        : order.status === 'Shipped'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No orders found.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between items-center">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">
            Contact Support
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
