import React, { useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaShoppingCart, FaDollarSign, FaHeart, FaUser } from 'react-icons/fa';
import WebsiteAnalysis from '../components/WebsiteAnalysis';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 1. Extract token from URL & store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', token);
      navigate('/dashboard'); // Clean the URL after saving token
    }
  }, [location.search, navigate]);

  // Bar Chart Data
  const salesData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Monthly Sales',
        data: [65, 59, 80, 81, 56],
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart Data
  const browserData = {
    labels: ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'],
    datasets: [
      {
        data: [55, 20, 15, 7, 3],
        backgroundColor: [
          '#EF4444',
          '#22C55E',
          '#3B82F6',
          '#F59E0B',
          '#6366F1',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      {/* Navbar */}
      <Navbar />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {[
          {
            icon: FaShoppingCart,
            label: 'Total Profit',
            value: '₹1.5M',
            color: 'bg-red-500 dark:bg-red-700',
          },
          {
            icon: FaHeart,
            label: 'Likes',
            value: '4,231',
            color: 'bg-blue-500 dark:bg-blue-700',
          },
          {
            icon: FaDollarSign,
            label: 'Sales',
            value: '460',
            color: 'bg-green-500 dark:bg-green-700',
          },
          {
            icon: FaUser,
            label: 'New Members',
            value: '248',
            color: 'bg-yellow-500 dark:bg-yellow-700',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} text-white p-5 rounded-xl shadow-md flex items-center justify-between`}
          >
            <stat.icon className="text-3xl" />
            <div>
              <p>{stat.label}</p>
              <h2 className="text-xl font-bold">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Website Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {/* Bar Chart */}
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h3 className="text-lg font-semibold mb-3">Sales Overview</h3>
          <div className="h-80">
            <Bar
              data={salesData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <h3 className="text-lg font-semibold mb-3">Browser Usage</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie
              data={browserData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Website Analysis */}
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl">
          <WebsiteAnalysis />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
