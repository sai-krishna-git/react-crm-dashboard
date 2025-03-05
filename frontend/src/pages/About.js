import React from "react";
import { FaUserTie, FaUserCog, FaUserShield } from "react-icons/fa";

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ml-[230px] px-10 mt-[-50px]">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-4 text-blue-700 flex items-center">
        📊 <span className="ml-2">About Our CRM Dashboard</span>
      </h2>

      {/* Description */}
      <p className="text-gray-700 text-lg text-center max-w-3xl mb-6 leading-relaxed">
        Welcome to our CRM Dashboard! Our system helps businesses track orders, 
        manage products, and improve customer relationships efficiently.
      </p>

      {/* Meet the Team */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        📋 <span className="ml-2">Meet Our Team</span>
      </h3>
      <ul className="space-y-4 text-lg text-gray-800">
        <li className="flex items-center space-x-3">
          <FaUserTie className="text-blue-500 text-2xl" /> <span>John Doe - CEO</span>
        </li>
        <li className="flex items-center space-x-3">
          <FaUserCog className="text-green-500 text-2xl" /> <span>Jane Smith - Product Manager</span>
        </li>
        <li className="flex items-center space-x-3">
          <FaUserShield className="text-red-500 text-2xl" /> <span>Mike Johnson - Lead Developer</span>
        </li>
      </ul>
    </div>
  );
};

export default About;
