import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import {
  FaShoppingCart,
  FaDollarSign,
  FaUsers,
  FaBoxOpen,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationCircle,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../auth';

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    recentOrders: [],
    topProducts: [],
  });

  // States for charts
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  const [productCategoryData, setProductCategoryData] = useState({
    labels: [],
    datasets: [],
  });

  const [customerGrowthData, setCustomerGrowthData] = useState({
    labels: [],
    datasets: [],
  });

  // ✅ 1. Extract token from URL & store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);
      navigate('/dashboard'); // Clean the URL after saving token
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [location.search, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = getToken();

    try {
      // Parallel requests for better performance
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/admin/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const orders = ordersRes.data;
      const customers = customersRes.data;
      const products = productsRes.data;

      // Calculate dashboard statistics
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      const pendingOrders = orders.filter((order) => !order.isPaid).length;

      // Get 5 most recent orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Calculate top selling products
      const productSales = {};
      orders.forEach((order) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item) => {
            const productId =
              typeof item.product === 'object'
                ? item.product._id
                : item.product;
            const quantity = item.quantity || 0;

            if (!productSales[productId]) {
              productSales[productId] = {
                quantity: 0,
                revenue: 0,
                name: item.name,
              };
            }

            productSales[productId].quantity += quantity;
            productSales[productId].revenue += item.price * quantity;
          });
        }
      });

      // Convert to array and get top 5
      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setDashboardStats({
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        pendingOrders,
        recentOrders,
        topProducts,
      });

      // Prepare monthly sales data
      prepareSalesChartData(orders);

      // Prepare product category data
      prepareProductCategoryData(products);

      // Prepare customer growth data
      prepareCustomerGrowthData(customers);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
      setLoading(false);
    }
  };

  const prepareSalesChartData = (orders) => {
    // Get last 6 months
    const months = [];
    const monthlySales = [];
    const monthlyCounts = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const monthYear = `${monthName} ${date.getFullYear()}`;
      months.push(monthYear);

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Filter orders for this month
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      // Calculate total sales for this month
      const monthlySale = monthOrders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      monthlySales.push(monthlySale);
      monthlyCounts.push(monthOrders.length);
    }

    setSalesData({
      labels: months,
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: monthlySales,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3B82F6',
          borderWidth: 2,
        },
        {
          label: 'Order Count',
          data: monthlyCounts,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: '#10B981',
          borderWidth: 2,
        },
      ],
    });
  };

  const prepareProductCategoryData = (products) => {
    // Count products by category
    const categories = {};

    products.forEach((product) => {
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });

    // Convert to arrays for chart
    const categoryLabels = Object.keys(categories);
    const categoryCounts = Object.values(categories);

    // Generate colors
    const backgroundColors = [
      '#EF4444',
      '#F59E0B',
      '#10B981',
      '#3B82F6',
      '#8B5CF6',
      '#EC4899',
      '#6366F1',
      '#14B8A6',
      '#F97316',
      '#8B5CF6',
    ];

    setProductCategoryData({
      labels: categoryLabels,
      datasets: [
        {
          data: categoryCounts,
          backgroundColor: backgroundColors.slice(0, categoryLabels.length),
          borderWidth: 1,
        },
      ],
    });
  };

  const prepareCustomerGrowthData = (customers) => {
    // Group customers by join month
    const months = [];
    const monthlyCounts = [];
    const cumulativeCounts = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const monthYear = `${monthName} ${date.getFullYear()}`;
      months.push(monthYear);

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Count customers who joined this month
      const monthlyCustomers = customers.filter((customer) => {
        const joinDate = new Date(customer.createdAt);
        return joinDate >= monthStart && joinDate <= monthEnd;
      }).length;

      monthlyCounts.push(monthlyCustomers);
    }

    // Calculate cumulative counts
    let cumulative = 0;
    for (let count of monthlyCounts) {
      cumulative += count;
      cumulativeCounts.push(cumulative);
    }

    setCustomerGrowthData({
      labels: months,
      datasets: [
        {
          label: 'New Customers',
          data: monthlyCounts,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: '#6366F1',
          borderWidth: 2,
          type: 'bar',
        },
        {
          label: 'Total Customers',
          data: cumulativeCounts,
          borderColor: '#EC4899',
          backgroundColor: 'rgba(236, 72, 153, 0.5)',
          borderWidth: 2,
          type: 'line',
          tension: 0.4,
        },
      ],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-lg">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
          <FaCalendarAlt className="text-blue-500" />
          <span>Last Updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: FaDollarSign,
            label: 'Total Revenue',
            value: formatCurrency(dashboardStats.totalRevenue),
            color: 'bg-green-500 dark:bg-green-600',
            changeText: 'Up from last month',
          },
          {
            icon: FaShoppingCart,
            label: 'Total Orders',
            value: dashboardStats.totalOrders,
            color: 'bg-blue-500 dark:bg-blue-600',
            changeText: `${Math.round(
              (dashboardStats.pendingOrders / dashboardStats.totalOrders) * 100
            )}% pending`,
          },
          {
            icon: FaUsers,
            label: 'Total Customers',
            value: dashboardStats.totalCustomers,
            color: 'bg-purple-500 dark:bg-purple-600',
            changeText: 'Active accounts',
          },
          {
            icon: FaBoxOpen,
            label: 'Pending Orders',
            value: dashboardStats.pendingOrders,
            color: 'bg-amber-500 dark:bg-amber-600',
            changeText: 'Require fulfillment',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className={`${stat.color} h-2`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <h2 className="text-2xl font-bold mt-1">{stat.value}</h2>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stat.changeText}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Sales & Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Revenue & Orders</h3>
            <div className="flex items-center text-sm text-blue-500">
              <FaChartLine className="mr-2" />
              Last 6 Months
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Customer Growth</h3>
            <div className="flex items-center text-sm text-purple-500">
              <FaUsers className="mr-2" />
              Acquisition Trend
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={customerGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Product Categories & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Product Categories Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie
              data={productCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      boxWidth: 10,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total =
                          context.chart.data.datasets[0].data.reduce(
                            (a, b) => a + b,
                            0
                          );
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      {order.customer?.name || 'Guest Customer'}
                    </td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.isPaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Products Section */}
          <h3 className="text-lg font-semibold mt-8 mb-4">
            Top Selling Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardStats.topProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col"
              >
                <div
                  className="font-medium text-gray-900 dark:text-white mb-1 truncate"
                  title={product.name}
                >
                  {product.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sold: {product.quantity} units
                </div>
                <div className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
