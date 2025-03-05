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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaBox className="text-blue-500" /> Orders
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border hover:bg-gray-100">
                <td className="p-3 border text-center">{order.id}</td>
                <td className="p-3 border">{order.customer}</td>
                <td className="p-3 border text-center font-semibold">{order.total}</td>
                <td className="p-3 border flex items-center gap-2 justify-center">
                  {order.icon} {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
