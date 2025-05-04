import React from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded mr-4"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/transparent.png';
          }}
        />
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-gray-500 dark:text-gray-400">
            ₹{item.price.toFixed(2)} each
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center border rounded mr-4">
          <button
            onClick={() => decreaseQuantity(item._id)}
            className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaMinus size={12} />
          </button>
          <span className="px-3">{item.quantity}</span>
          <button
            onClick={() => increaseQuantity(item._id)}
            className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={item.quantity >= item.stock}
          >
            <FaPlus size={12} />
          </button>
        </div>

        <div className="text-right">
          <p className="font-medium">
            ₹{(item.price * item.quantity).toFixed(2)}
          </p>
          <button
            onClick={() => removeFromCart(item._id)}
            className="text-red-500 mt-1 text-sm flex items-center hover:text-red-700"
          >
            <FaTrash size={12} className="mr-1" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
