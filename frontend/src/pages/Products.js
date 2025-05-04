import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import { getToken } from '../auth';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = getToken('admin');

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
  });

  // Categories options
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Other'];

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === 'price' || name === 'stock' ? parseFloat(value) || '' : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      stock: '',
    });
    setIsEditing(false);
    setSelectedProductId(null);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (isFormVisible) {
      resetForm();
    }
  };

  // Create new product
  const createProduct = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.image ||
      !form.category
    ) {
      setError('All fields are required except stock.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create product');
      }

      toast.success('Product added successfully');
      resetForm();
      setIsFormVisible(false);
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err.message);
      setError(err.message || 'Failed to create product. Please try again.');
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err.message);
      setError('Failed to delete product. Please try again.');
    }
  };

  // Edit product - populate form with product data
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
    });
    setIsEditing(true);
    setSelectedProductId(product._id);
    setIsFormVisible(true);
  };

  // Update product
  const updateProduct = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.image ||
      !form.category
    ) {
      setError('All fields are required except stock.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${selectedProductId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      resetForm();
      setIsFormVisible(false);
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err.message);
      setError(err.message || 'Failed to update product. Please try again.');
    }
  };

  // Handle form submission - either create or update
  const handleSubmit = (e) => {
    if (isEditing) {
      updateProduct(e);
    } else {
      createProduct(e);
    }
  };

  // Check for authentication for admin actions
  const isAdmin = !!token;

  return (
    <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🛍️ Products Management
        </h2>
        {isAdmin && (
          <button
            onClick={toggleForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
          >
            {isFormVisible ? (
              'Cancel'
            ) : (
              <>
                <FaPlus /> Add New Product
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Product Form */}
      {isFormVisible && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Product name"
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Product description"
                rows="3"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 p-2 border rounded-l focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                  />
                  <div className="bg-gray-200 p-2 rounded-r flex items-center justify-center">
                    <FaImage className="text-gray-600" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsFormVisible(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isEditing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">No products available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden transition-transform transform hover:scale-102"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/product-placeholder.png';
                      }}
                    />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-blue-100"
                          title="Edit Product"
                        >
                          <FaEdit className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="bg-white p-2 rounded-full shadow-md hover:bg-red-100"
                          title="Delete Product"
                        >
                          <FaTrash className="text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold truncate">
                        {product.name}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium text-lg">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-sm mb-3 h-12 overflow-hidden">
                      {product.description.substring(0, 60)}
                      {product.description.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs ${
                          product.stock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : 'Out of stock'}
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
