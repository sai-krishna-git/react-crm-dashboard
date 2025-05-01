import React from "react";
import { FaLaptop, FaMobileAlt, FaHeadphones, FaTabletAlt, FaCamera } from "react-icons/fa";

const Products = () => {
  const products = [
    { id: 1, name: "Laptop", price: "$1200", icon: <FaLaptop className="text-blue-500 text-3xl" /> },
    { id: 2, name: "Smartphone", price: "$800", icon: <FaMobileAlt className="text-green-500 text-3xl" /> },
    { id: 3, name: "Headphones", price: "$150", icon: <FaHeadphones className="text-purple-500 text-3xl" /> },
    { id: 4, name: "Tablet", price: "$600", icon: <FaTabletAlt className="text-yellow-500 text-3xl" /> },
    { id: 5, name: "Camera", price: "$500", icon: <FaCamera className="text-red-500 text-3xl" /> },
  ];

  return (
    <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        🛍️ Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-300 rounded-lg shadow-lg p-4 lg:p-6 bg-white text-center transition-transform transform hover:scale-105"
          >
            <div className="flex justify-center mb-2">{product.icon}</div>
            <h4 className="text-lg font-semibold">{product.name}</h4>
            <p className="text-gray-600 font-medium">{product.price}</p>
            <button className="mt-3 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 hover:shadow-lg transition">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
