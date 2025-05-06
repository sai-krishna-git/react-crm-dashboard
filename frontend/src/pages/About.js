import React from 'react';
import { FaUserTie, FaUserCog, FaUserShield } from 'react-icons/fa';

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-10 mt-0 transition-all duration-300">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-6 text-blue-700 flex items-center">
        📊 <span className="ml-2">About Our CRM Dashboard</span>
      </h2>

      {/* Description */}
      <p className="text-gray-900 text-lg text-center max-w-3xl mb-6 leading-loose">
        Welcome to our CRM Dashboard! Our system empowers businesses to track
        orders, manage products, and enhance customer relationships with
        efficiency and ease.
      </p>

      {/* Meet the Team */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        📋 <span className="ml-2">Meet Our Team</span>
      </h3>
      <ul className="space-y-4 text-lg text-gray-800">
        <li className="flex items-center space-x-3 hover:scale-105 transition-transform">
          <FaUserTie className="text-blue-500 text-2xl" />{' '}
          <span>John Doe - CEO</span>
        </li>
        <li className="flex items-center space-x-3 hover:scale-105 transition-transform">
          <FaUserCog className="text-green-500 text-2xl" />{' '}
          <span>Jane Smith - Product Manager</span>
        </li>
        <li className="flex items-center space-x-3 hover:scale-105 transition-transform">
          <FaUserShield className="text-red-500 text-2xl" />{' '}
          <span>Mike Johnson - Lead Developer</span>
        </li>
      </ul>
    </div>
  );
};

export default About;
