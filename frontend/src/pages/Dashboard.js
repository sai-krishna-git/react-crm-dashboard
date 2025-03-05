import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import { FaShoppingCart, FaDollarSign, FaHeart, FaUser } from "react-icons/fa";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { MdDashboard } from "react-icons/md";
import WebsiteAnalysis from "../components/WebsiteAnalysis";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar className="bg-blue-900 text-white w-64">
        <Menu>
          <MenuItem icon={<MdDashboard />}>Dashboard</MenuItem>
          <MenuItem icon={<FaShoppingCart />}>Orders</MenuItem>
          <MenuItem icon={<FaDollarSign />}>Sales</MenuItem>
        </Menu>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-500 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <FaShoppingCart className="text-3xl" />
            <div>
              <p>Total Profit</p>
              <h2 className="text-xl font-bold">$1.5M</h2>
            </div>
          </div>
          <div className="bg-blue-500 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <FaHeart className="text-3xl" />
            <div>
              <p>Likes</p>
              <h2 className="text-xl font-bold">4,231</h2>
            </div>
          </div>
          <div className="bg-green-500 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <FaDollarSign className="text-3xl" />
            <div>
              <p>Sales</p>
              <h2 className="text-xl font-bold">460</h2>
            </div>
          </div>
          <div className="bg-yellow-500 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <FaUser className="text-3xl" />
            <div>
              <p>New Members</p>
              <h2 className="text-xl font-bold">248</h2>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Bar Chart */}
          <div className="p-4 bg-white shadow-md rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
            <Bar
              data={{
                labels: ["Jan", "Feb", "Mar"],
                datasets: [
                  {
                    data: [65, 59, 80],
                    backgroundColor: "blue",
                  },
                ],
              }}
            />
          </div>

          {/* Pie Chart */}
          <div className="p-4 bg-white shadow-md rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Browser Usage</h3>
            <Pie
              data={{
                labels: ["Chrome", "Firefox", "Edge"],
                datasets: [
                  {
                    data: [55, 25, 20],
                    backgroundColor: ["#f00", "#0f0", "#00f"],
                  },
                ],
              }}
            />
          </div>
        </div>

        {/* Website Analysis */}
        <div className="mt-6">
          <WebsiteAnalysis />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
