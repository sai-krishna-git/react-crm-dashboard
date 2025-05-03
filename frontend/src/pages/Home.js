import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../components/ParticlesBackground';

const Home = () => {
  const navigate = useNavigate();
  const [darkMode] = useState(
    localStorage.getItem('customerDarkMode') !== 'false'
  );

  useEffect(() => {
    document.body.className = darkMode
      ? 'bg-gray-900 text-white'
      : 'bg-gray-100 text-black';
  }, [darkMode]);

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      } h-screen flex items-center justify-center relative transition-colors duration-500`}
    >
      <ParticlesBackground darkMode={darkMode} />

      <div className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 p-8 rounded-2xl shadow-2xl w-96 max-w-full text-center">
        <h1 className="text-4xl font-bold text-blue-500 dark:text-green-400 mb-4">
          Welcome to Our CRM
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Manage your customers, track orders, and grow your business with ease.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
          >
            Admin Login
          </button>
          <button
            onClick={() => navigate('/customer-login')}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
          >
            Customer Login
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700 transition"
          >
            About Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
