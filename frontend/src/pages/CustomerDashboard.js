import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../auth';
import {
  FaShoppingCart,
  FaUser,
  FaBoxOpen,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaPhone,
  FaEnvelope,
  FaUserEdit,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaCalendarAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import CartItem from '../components/CartItem';
import { CartProvider, useCart } from '../contexts/CartContext';

const CustomerDashboardContent = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('customerDarkMode') === 'true'
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop');
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [cartAddSuccess, setCartAddSuccess] = useState(false);
  const [cartAddMessage, setCartAddMessage] = useState('');
  const [profileExpanded, setProfileExpanded] = useState(false);

  const { cart, cartTotal, clearCart } = useCart();

  useEffect(() => {
    const token = getToken('customer');
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

        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer || data);
          setOrders(data.orders || []);
        } else if (response.status === 401) {
          logout('customer');
          navigate('/customer-login');
        } else {
          console.error('Failed to fetch customer data');
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
    fetchProducts();
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    const token = getToken('customer');
    try {
      const response = await fetch(
        'http://localhost:5000/api/orders/my-orders',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    logout('customer');
    navigate('/customer-login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('customerDarkMode', newMode.toString());
  };

  // Show a notification when a product is added to the cart
  const showCartAddNotification = (productName) => {
    setCartAddMessage(`${productName} added to cart successfully!`);
    setCartAddSuccess(true);
    setTimeout(() => {
      setCartAddSuccess(false);
    }, 3000);
  };

  const placeOrder = async () => {
    if (!shippingAddress) {
      alert('Please provide a shipping address');
      return;
    }

    const token = getToken('customer');
    if (!token) {
      navigate('/customer-login');
      return;
    }

    try {
      // Calculate prices
      const itemsPrice = cartTotal;
      const shippingPrice = cartTotal > 100 ? 0 : 10;
      const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
      const totalPrice = Number(
        (itemsPrice + shippingPrice + taxPrice).toFixed(2)
      );

      // Format order items in the format expected by the backend
      const orderItems = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const orderData = {
        orderItems,
        customer: customer._id,
        shippingAddress,
        paymentMethod: 'Pay on Delivery',
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderSuccess(true);
        clearCart();
        setShippingAddress('');
        setShowShippingForm(false);
        fetchOrders(); // Refresh orders list
        setTimeout(() => {
          setOrderSuccess(false);
          setActiveTab('orders');
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Order failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-amber-500';
      case 'Shipped':
        return 'bg-blue-500';
      case 'Delivered':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <FaCreditCard className="mr-2" />;
      case 'Shipped':
        return <FaTruck className="mr-2" />;
      case 'Delivered':
        return <FaBoxOpen className="mr-2" />;
      default:
        return null;
    }
  };

  const renderProfileSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-5xl text-white font-bold">
            {customer.name?.charAt(0) || 'C'}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {customer.name}
            </h2>
            <button className="mt-2 sm:mt-0 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              <FaUserEdit /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaEnvelope className="text-gray-500 dark:text-gray-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaPhone className="text-gray-500 dark:text-gray-400" />
              <span>{customer.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaHome className="text-gray-500 dark:text-gray-400" />
              <span>{customer.address || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaCalendarAlt className="text-gray-500 dark:text-gray-400" />
              <span>
                Member since:{' '}
                {new Date(customer.createdAt).toLocaleDateString() || 'N/A'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Shipping Address
            </h3>
            <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              {customer.shippingAddress || 'No default shipping address set'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
          <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400">
            {orders.length}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Orders Placed
          </span>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
          <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
            ₹
            {orders
              .reduce((total, order) => total + (order.totalPrice || 0), 0)
              .toFixed(2)}
          </span>
          <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
          <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400">
            {orders.filter((order) => order.status === 'Delivered').length}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Completed Orders
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'
      }`}
    >
      {/* Header */}
      <header
        className={`py-4 px-6 shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShopEase
            </h1>
          </div>

          <div className="flex items-center space-x-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`hover:text-blue-500 transition-colors ${
                activeTab === 'shop'
                  ? 'text-blue-500 font-semibold border-b-2 border-blue-500'
                  : ''
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center hover:text-blue-500 transition-colors ${
                activeTab === 'cart'
                  ? 'text-blue-500 font-semibold border-b-2 border-blue-500'
                  : ''
              }`}
            >
              <FaShoppingCart className="mr-1" />
              <span className="mr-1">Cart</span>
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center hover:text-blue-500 transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-500 font-semibold border-b-2 border-blue-500'
                  : ''
              }`}
            >
              <FaBoxOpen className="mr-1" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center hover:text-blue-500 transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-500 font-semibold border-b-2 border-blue-500'
                  : ''
              }`}
            >
              <FaUser className="mr-1" />
              Profile
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="flex items-center hover:text-blue-500 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full"
              >
                <span className="mr-1 font-medium">
                  {customer.name.split(' ')[0]}
                </span>
                {profileExpanded ? (
                  <FaChevronUp className="ml-1" />
                ) : (
                  <FaChevronDown className="ml-1" />
                )}
              </button>

              {profileExpanded && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="py-1 rounded-md overflow-hidden">
                    <div className="px-4 py-3 text-sm border-b">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {customer.email}
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Success Messages */}
      {orderSuccess && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">
                Order placed successfully! Thank you for your purchase.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cart Add Success Message */}
      {cartAddSuccess && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center">
              <FaCheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">{cartAddMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-20 pt-8">
        {activeTab === 'shop' && (
          <>
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 mb-12 shadow-lg">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome back, {customer.name.split(' ')[0]}!
                </h1>
                <p className="text-lg mb-6 opacity-90">
                  Discover our latest products and exclusive deals just for you.
                </p>
              </div>
            </div>

            {/* All Products - with enhanced ProductCard that will use the showCartAddNotification function */}
            <h2 className="text-2xl font-bold mb-6">Our Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => showCartAddNotification(product.name)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'cart' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <FaShoppingCart className="text-blue-500 mr-2" /> Your Cart
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="h-32 w-32 text-gray-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
                <p className="text-gray-500 mb-8 max-w-md">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-8">
                  {cart.map((item) => (
                    <CartItem key={item._id} item={item} />
                  ))}
                </div>

                <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {cartTotal > 100 ? (
                          <span className="text-green-600 dark:text-green-400">
                            Free
                          </span>
                        ) : (
                          '₹50.00'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (15%):</span>
                      <span>₹{(cartTotal * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="border-t dark:border-gray-600 my-2 pt-2"></div>
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total:</span>
                      <span>
                        ₹
                        {(
                          cartTotal +
                          (cartTotal > 100 ? 0 : 10) +
                          cartTotal * 0.15
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {showShippingForm ? (
                    <div className="mt-6 border-t dark:border-gray-600 pt-6">
                      <h3 className="font-semibold mb-3">
                        Shipping Information
                      </h3>
                      <div className="flex items-start mb-4">
                        <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2" />
                        <textarea
                          className="flex-1 p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          rows="3"
                          placeholder="Enter your complete shipping address"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:space-x-3">
                        <button
                          className="w-full sm:flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                          onClick={placeOrder}
                        >
                          <FaBoxOpen className="mr-2" /> Place Order (Pay on
                          Delivery)
                        </button>
                        <button
                          className="mt-3 sm:mt-0 py-3 px-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                          onClick={() => setShowShippingForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow flex items-center justify-center"
                      onClick={() => setShowShippingForm(true)}
                    >
                      <FaCreditCard className="mr-2" /> Proceed to Checkout
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && renderProfileSection()}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <FaBoxOpen className="text-blue-500 mr-2" /> Your Orders
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-32 w-32 mx-auto text-gray-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-xl text-gray-500 mb-4">No orders yet</p>
                <p className="text-gray-500 mb-8">
                  When you place an order, it will appear here
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div
                    key={order._id || `order-${Math.random()}`}
                    className="border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center">
                          <span className="font-bold text-lg mr-2">
                            Order #
                          </span>
                          <span>
                            {order._id
                              ? order._id.substring(order._id.length - 8)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <FaCalendarAlt className="mr-1" />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )
                            : 'Date unavailable'}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <span
                          className={`px-4 py-2 rounded-full text-white text-sm font-medium flex items-center ${getStatusColor(
                            order.status || 'Processing'
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status || 'Processing'}
                        </span>
                        <span className="font-bold text-lg">
                          ₹{(order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="space-y-4 mb-6">
                        {order.orderItems &&
                          order.orderItems.map((item) => (
                            <div
                              key={item._id || `item-${Math.random()}`}
                              className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex items-center">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border dark:border-gray-700">
                                  <img
                                    src={
                                      item.image ||
                                      'https://via.placeholder.com/150'
                                    }
                                    alt={item.name || 'Product'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        'https://via.placeholder.com/150';
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.name || 'Product'}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    ₹{item.price || 0} × {item.quantity || 0}
                                  </p>
                                </div>
                              </div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                ₹
                                {(
                                  (item.price || 0) * (item.quantity || 0)
                                ).toFixed(2)}
                              </p>
                            </div>
                          ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                            <FaMapMarkerAlt className="text-gray-500 mr-2" />{' '}
                            Shipping Address
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            {order.shippingAddress || 'No address provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                            <FaCreditCard className="text-gray-500 mr-2" />{' '}
                            Payment Method
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            {order.paymentMethod || 'Pay on Delivery'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`py-6 px-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mt-8`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const CustomerDashboard = () => {
  return (
    <CartProvider>
      <CustomerDashboardContent />
    </CartProvider>
  );
};

export default CustomerDashboard;
