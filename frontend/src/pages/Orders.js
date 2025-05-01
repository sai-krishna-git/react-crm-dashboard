import React from "react";
import { FaBox, FaShippingFast, FaCheckCircle, FaClock } from "react-icons/fa";

const Orders = () => {
  const orders = [
    { id: 1, customer: "John Doe", total: "$250", status: "Shipped", icon: <FaShippingFast className="text-blue-500" /> },
    { id: 2, customer: "Jane Smith", total: "$150", status: "Pending", icon: <FaClock className="text-yellow-500" /> },
    { id: 3, customer: "Michael Brown", total: "$320", status: "Delivered", icon: <FaCheckCircle className="text-green-500" /> },
    { id: 4, customer: "Emily Johnson", total: "$220", status: "Shipped", icon: <FaShippingFast className="text-blue-500" /> },
    { id: 5, customer: "David Lee", total: "$180", status: "Pending", icon: <FaClock className="text-yellow-500" /> },
  ];

  return (
    <div className="p-6 lg:ml-64 md:ml-48 sm:ml-0 transition-all duration-300">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBox className="text-blue-500" /> Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-lg text-gray-600">No orders available.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4 max-w-5xl">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white border-b border-gray-400">
                <th className="p-4 text-left border-r border-gray-400">Order ID</th>
                <th className="p-4 text-left border-r border-gray-400">Customer</th>
                <th className="p-4 text-center border-r border-gray-400">Total</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-gray-300 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition duration-200`}
                >
                  <td className="p-4 font-semibold border-r border-gray-300">{order.id}</td>
                  <td className="p-4 border-r border-gray-300">{order.customer}</td>
                  <td className="p-4 text-center font-bold text-lg border-r border-gray-300">{order.total}</td>
                  <td className="p-4 flex items-center gap-2 justify-center">{order.icon} <span className="font-medium">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
