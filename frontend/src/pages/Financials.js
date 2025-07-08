import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth';
import {
  FaRupeeSign,
  FaMoneyBillWave,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaUser,
  FaChartLine,
  FaSearch,
  FaUserCircle,
  FaBox,
  FaBoxes,
} from 'react-icons/fa';
import { Tab } from '@headlessui/react';

const Financials = () => {
  const [financials, setFinancials] = useState([]);
  const [customerFinancials, setCustomerFinancials] = useState({});
  const [productFinancials, setProductFinancials] = useState({});
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // Fetch orders
        const ordersRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/orders/admin/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch customers
        const customersRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/customers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const orders = ordersRes.data;
        const customersData = customersRes.data;

        setFinancials(orders);

        // Calculate summary data from orders
        const summaryData = orders.reduce(
          (acc, record) => {
            acc.totalAmount += record.totalPrice || 0;
            acc.totalPaid += record.isPaid ? record.totalPrice || 0 : 0;
            acc.totalPending += record.isPaid ? 0 : record.totalPrice || 0;
            acc.completedOrders += record.status === 'Delivered' ? 1 : 0;
            acc.pendingOrders += record.status !== 'Delivered' ? 1 : 0;
            return acc;
          },
          {
            totalAmount: 0,
            totalPaid: 0,
            totalPending: 0,
            completedOrders: 0,
            pendingOrders: 0,
          }
        );

        setSummary(summaryData);

        // Process customer financial data
        const customerData = {};
        customersData.forEach((customer) => {
          const customerOrders = orders.filter(
            (order) => order.customer?._id === customer._id
          );

          const totalSpent = customerOrders.reduce(
            (sum, order) => sum + (order.totalPrice || 0),
            0
          );

          const totalPaid = customerOrders.reduce(
            (sum, order) => sum + (order.isPaid ? order.totalPrice || 0 : 0),
            0
          );

          const totalPending = customerOrders.reduce(
            (sum, order) => sum + (order.isPaid ? 0 : order.totalPrice || 0),
            0
          );

          customerData[customer._id] = {
            customer,
            totalOrders: customerOrders.length,
            totalSpent,
            totalPaid,
            totalPending,
            lastOrderDate:
              customerOrders.length > 0
                ? new Date(
                    Math.max(
                      ...customerOrders.map((o) => new Date(o.createdAt))
                    )
                  )
                : null,
          };
        });
        // Process product financial data
        const productData = {};
        orders.forEach((order) => {
          if (!order.orderItems || !Array.isArray(order.orderItems)) return;

          order.orderItems.forEach((item) => {
            if (!item.product) return;

            const productId =
              typeof item.product === 'object'
                ? item.product._id
                : item.product;
            const productName = item.name;
            const productPrice = item.price || 0;
            const quantity = item.quantity || 0;
            const itemTotal = productPrice * quantity;
            const isPaid = order.isPaid;

            if (!productData[productId]) {
              productData[productId] = {
                id: productId,
                name: productName,
                totalQuantity: 0,
                totalRevenue: 0,
                paidRevenue: 0,
                pendingRevenue: 0,
                orderCount: 0,
              };
            }

            productData[productId].totalQuantity += quantity;
            productData[productId].totalRevenue += itemTotal;
            productData[productId].paidRevenue += isPaid ? itemTotal : 0;
            productData[productId].pendingRevenue += isPaid ? 0 : itemTotal;

            // Count each product occurrence in unique orders
            if (!productData[productId].orders) {
              productData[productId].orders = new Set();
            }
            productData[productId].orders.add(order._id);
          });
        });

        // Convert order sets to counts
        Object.values(productData).forEach((product) => {
          product.orderCount = product.orders ? product.orders.size : 0;
          delete product.orders; // Remove the Set as it's no longer needed
        });

        setProductFinancials(productData);
        setCustomerFinancials(customerData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching financial data', error);
        setError('Failed to load financial data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFinancials = React.useMemo(() => {
    const sortableItems = [...financials];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'customer') {
          aValue = a.customer?.name || '';
          bValue = b.customer?.name || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [financials, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter customers based on search term
  const filteredCustomers = React.useMemo(() => {
    const customerValues = Object.values(customerFinancials);
    if (!searchTerm) return customerValues;

    return customerValues.filter((item) => {
      const customer = item.customer;
      return (
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [customerFinancials, searchTerm]);

  // Sort customer financials
  const sortedCustomers = React.useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      // Default sort by total spent
      return b.totalSpent - a.totalSpent;
    });
  }, [filteredCustomers]);

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    const productValues = Object.values(productFinancials);
    if (!productSearchTerm) return productValues;

    return productValues.filter((item) => {
      return item.name?.toLowerCase().includes(productSearchTerm.toLowerCase());
    });
  }, [productFinancials, productSearchTerm]);

  // Sort product financials by total revenue
  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      return b.totalRevenue - a.totalRevenue;
    });
  }, [filteredProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Financial Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <FaRupeeSign className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <FaMoneyBillWave className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Paid Amount</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-500 bg-opacity-10">
              <FaClock className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">
                Pending Amount
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">
                Completed Orders
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {summary.completedOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
              <FaExclamationCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">
                Pending Orders
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {summary.pendingOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Order Records and Customer Records */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
        <Tab.Group>
          <Tab.List className="flex bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <Tab
              className={({ selected }) =>
                `py-3 px-6 text-sm font-medium outline-none ${
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <FaChartLine />
                Order Financial Records
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-6 text-sm font-medium outline-none ${
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <FaUser />
                Customer Financial Summary
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-3 px-6 text-sm font-medium outline-none ${
                  selected
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <FaBoxes />
                Product Financial Summary
              </div>
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Order Records Panel */}
            <Tab.Panel>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white">
                  Order Financial Records
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Detailed view of all order transactions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Date {getSortIndicator('createdAt')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('customer')}
                      >
                        Customer {getSortIndicator('customer')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('_id')}
                      >
                        Order ID {getSortIndicator('_id')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIndicator('status')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('totalPrice')}
                      >
                        Amount {getSortIndicator('totalPrice')}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('isPaid')}
                      >
                        Payment Status {getSortIndicator('isPaid')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {sortedFinancials.length > 0 ? (
                      sortedFinancials.map((record) => (
                        <tr
                          key={record._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(record.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.customer?.name || 'Guest Customer'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {record.customer?.email || 'No email provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            #
                            {record._id
                              .substring(record._id.length - 6)
                              .toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                record.status
                              )}`}
                            >
                              {record.status || 'Processing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(record.totalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.isPaid ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                        >
                          No financial records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>

            {/* Customer Records Panel */}
            <Tab.Panel>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white">
                  Customer Financial Summary
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Financial overview by customer
                </p>

                {/* Search bar */}
                <div className="mt-4 relative">
                  <input
                    type="text"
                    placeholder="Search customers by name, email or phone..."
                    className="w-full py-2 px-4 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pending Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {sortedCustomers.length > 0 ? (
                      sortedCustomers.map((item) => (
                        <tr
                          key={item.customer._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <FaUserCircle className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.customer.name ||
                                    `${item.customer.firstName} ${item.customer.lastName}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.customer.email}
                                </div>
                                {item.customer.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.customer.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(item.totalSpent)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(item.totalPaid)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.totalPending > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {formatCurrency(item.totalPending)}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                {formatCurrency(0)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(item.lastOrderDate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                        >
                          No customer financial records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
            {/* Product Records Panel */}
            <Tab.Panel>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white">
                  Product Financial Summary
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Financial overview by product
                </p>

                {/* Search bar */}
                <div className="mt-4 relative">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    className="w-full py-2 px-4 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Paid Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pending Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Number of Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {sortedProducts.length > 0 ? (
                      sortedProducts.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <FaBox className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name || 'Unknown Product'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID:{' '}
                                  {item.id
                                    .substring(item.id.length - 6)
                                    .toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(item.totalRevenue)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(item.paidRevenue)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.pendingRevenue > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {formatCurrency(item.pendingRevenue)}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                {formatCurrency(0)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.orderCount}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                        >
                          No product financial records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Financials;
