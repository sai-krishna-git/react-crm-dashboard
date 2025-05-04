import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product, onAddToCart }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    if (onAddToCart) {
      onAddToCart(); // Trigger the notification
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/transparent.png';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 text-xs rounded-full">
            {product.category}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-300 mt-1 h-12 overflow-hidden">
          {product.description.length > 60
            ? `${product.description.substring(0, 60)}...`
            : product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold text-lg">₹{product.price.toFixed(2)}</p>
          <div>
            <span
              className={`text-xs ${
                product.stock > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`mt-3 w-full py-2 flex items-center justify-center rounded transition ${
            product.stock > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaShoppingCart className="mr-2" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
