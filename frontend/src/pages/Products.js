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
    <div className="p-6 ml-[260px]"> {/* Push content to the right, avoiding sidebar */}
      <h2 className="text-2xl font-bold mb-6 text-center">🛍️ Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-md p-6 bg-white text-center transition transform hover:scale-105">
            <div className="flex justify-center mb-2">{product.icon}</div>
            <h4 className="text-lg font-semibold">{product.name}</h4>
            <p className="text-gray-600 font-medium">{product.price}</p>
            <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
