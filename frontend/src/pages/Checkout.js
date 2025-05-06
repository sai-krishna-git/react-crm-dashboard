import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaPrint,
  FaUserPlus,
} from 'react-icons/fa';
import { getToken } from '../auth';

const Checkout = () => {
  const navigate = useNavigate();
  const token = getToken('admin');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const invoiceRef = useRef(null);

  const shippingFee = 50;
  const taxRate = 0.15; // 15%

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchCustomers();
    fetchProducts();
  }, [token, navigate]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (error) {
      toast.error('Error loading customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('Error loading products: ' + error.message);
    }
  };

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item._id === product._id);

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return currentCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        toast.warning(
          `Cannot add more than ${product.stock} units of ${product.name}`
        );
        return currentCart;
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) => {
      const product = products.find((p) => p._id === productId);
      const cartItem = currentCart.find((item) => item._id === productId);

      if (cartItem && product && cartItem.quantity < product.stock) {
        return currentCart.map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.warning(`Maximum stock reached for this product`);
      return currentCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== productId)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * taxRate;
  const total = subtotal + (cart.length > 0 ? shippingFee : 0) + taxAmount;

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchCustomer.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  const filteredProducts = products.filter((product) => {
    const searchLower = searchProduct.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleCustomerChange = (customer) => {
    console.log('Selected customer:', customer);
    setSelectedCustomer(customer);
    setSearchCustomer('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();

    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast.error('First name, last name, and email are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add customer');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      toast.success('Customer added successfully');

      // Fetch the updated customer list
      await fetchCustomers();

      // Find and select the newly added customer
      const updatedCustomers = await response.json();
      const newlyAddedCustomer = updatedCustomers.find(
        (c) => c.email === newCustomer.email
      );
      if (newlyAddedCustomer) {
        setSelectedCustomer(newlyAddedCustomer);
      }

      // Reset form and hide it
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
      });
      setShowAddCustomerForm(false);
    } catch (error) {
      toast.error('Error adding customer: ' + error.message);
    }
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const itemsPrice = subtotal;
      const orderData = {
        orderItems,
        customer: selectedCustomer._id,
        shippingAddress: selectedCustomer.address || 'Store Pickup',
        paymentMethod: 'Cash',
        itemsPrice,
        shippingPrice: shippingFee,
        taxPrice: taxAmount,
        totalPrice: total,
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const orderResponse = await response.json();
      setOrderDetails({
        ...orderResponse,
        customer: selectedCustomer,
        items: cart,
        orderDate: new Date().toLocaleDateString(),
        orderTime: new Date().toLocaleTimeString(),
        subtotal,
        tax: taxAmount,
        shipping: shippingFee,
        total,
      });

      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      setCart([]);
    } catch (error) {
      toast.error('Error placing order: ' + error.message);
    }
  };

  const printInvoice = () => {
    const printContent = invoiceRef.current;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 transition-all duration-300">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Offline Order Checkout
      </h1>

      {orderPlaced ? (
        <div>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-600">
                Order Placed Successfully!
              </h2>
              <button
                onClick={printInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
              >
                <FaPrint /> Print Invoice
              </button>
            </div>

            <div
              ref={invoiceRef}
              className="p-6 border border-gray-200 rounded-lg"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">ShopEase</h1>
                <p>123 Store Street, Shopping Mall</p>
                <p>City, Country, ZIP</p>
                <p>Phone: (123) 456-7890</p>
                <p className="mt-4 text-xl font-semibold">INVOICE</p>
              </div>

              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-semibold">Bill To:</p>
                  <p>{orderDetails?.customer?.name}</p>
                  <p>{orderDetails?.customer?.email}</p>
                  <p>{orderDetails?.customer?.phone || 'N/A'}</p>
                  <p>{orderDetails?.customer?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Invoice Details:</p>
                  <p>Date: {orderDetails?.orderDate}</p>
                  <p>Time: {orderDetails?.orderTime}</p>
                  <p>
                    Invoice #:{' '}
                    {orderDetails?._id?.substring(
                      orderDetails?._id?.length - 8
                    )}
                  </p>
                  <p>Payment Method: Cash on Delivery</p>
                </div>
              </div>

              <table className="w-full mt-6 mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails?.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="text-right py-2">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-1/3">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>₹{orderDetails?.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>₹{orderDetails?.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (15%):</span>
                    <span>₹{orderDetails?.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>₹{orderDetails?.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <p>Thank you for your business!</p>
                <p className="text-sm mt-4">
                  For any queries, please contact support@shopease.com
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderPlaced(false);
                setOrderDetails(null);
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Order
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h2 className="text-xl font-semibold">Select Customer</h2>
            </div>

            <div className="p-4">
              {selectedCustomer ? (
                <div className="mb-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                  <p className="text-gray-600">
                    {selectedCustomer.phone || 'No phone'}
                  </p>
                  <p className="text-gray-600">
                    {selectedCustomer.address || 'No address'}
                  </p>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="mt-2 bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex mb-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full p-2 border rounded-l focus:outline-none focus:ring focus:border-blue-300"
                        value={searchCustomer}
                        onChange={(e) => setSearchCustomer(e.target.value)}
                      />
                      <FaSearch className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button
                      className="bg-green-600 text-white p-2 rounded-r hover:bg-green-700"
                      onClick={() =>
                        setShowAddCustomerForm(!showAddCustomerForm)
                      }
                    >
                      <FaUserPlus />
                    </button>
                  </div>

                  {showAddCustomerForm && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold mb-3">Add New Customer</h3>
                      <form onSubmit={handleAddCustomer}>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            className="p-2 border rounded focus:outline-none focus:ring"
                            value={newCustomer.firstName}
                            onChange={handleInputChange}
                            required
                          />
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            className="p-2 border rounded focus:outline-none focus:ring"
                            value={newCustomer.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          className="w-full p-2 border rounded focus:outline-none focus:ring mb-2"
                          value={newCustomer.email}
                          onChange={handleInputChange}
                          required
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone"
                          className="w-full p-2 border rounded focus:outline-none focus:ring mb-2"
                          value={newCustomer.phone}
                          onChange={handleInputChange}
                        />
                        <textarea
                          name="address"
                          placeholder="Address"
                          className="w-full p-2 border rounded focus:outline-none focus:ring mb-2"
                          value={newCustomer.address}
                          onChange={handleInputChange}
                          rows="2"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            onClick={() => setShowAddCustomerForm(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Add Customer
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                          <li
                            key={customer._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCustomerChange(customer)}
                          >
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">
                              {customer.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              {customer.phone || 'No phone'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center p-4 text-gray-500">
                        No customers found
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-green-600 text-white p-4">
              <h2 className="text-xl font-semibold">Select Products</h2>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex">
                        <div className="h-24 w-24 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        </div>
                        <div className="p-3 flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{product.name}</h3>
                            <span className="text-green-600 font-medium">
                              ₹{product.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                product.stock > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.stock > 0
                                ? `${product.stock} in stock`
                                : 'Out of stock'}
                            </span>
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              className={`px-3 py-1 rounded text-white ${
                                product.stock > 0
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-purple-600 text-white p-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No items in cart
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <li key={item._id} className="py-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{item.name}</span>
                          <span>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() => decreaseQuantity(item._id)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="px-3">{item.quantity}</span>
                            <button
                              onClick={() => increaseQuantity(item._id)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity >= item.stock}
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>₹{shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax (15%):</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleCheckout}
                disabled={!selectedCustomer || cart.length === 0}
                className={`w-full py-3 mt-4 rounded-lg text-white ${
                  selectedCustomer && cart.length > 0
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
