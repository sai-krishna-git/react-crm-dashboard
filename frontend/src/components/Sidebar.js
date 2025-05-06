import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdMenu, MdClose, MdOutlineLogout } from 'react-icons/md';
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaInfoCircle,
  FaChartLine,
  FaEnvelope,
} from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';
import { logout } from '../auth';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FaShoppingCart, label: 'Checkout', path: '/checkout' },
    { icon: FaUsers, label: 'Customers', path: '/customers' },
    { icon: FaShoppingCart, label: 'Orders', path: '/orders' },
    { icon: FaBox, label: 'Products', path: '/products' },
    { icon: GiReceiveMoney, label: 'Financials', path: '/financials' },
    { icon: FaChartLine, label: 'Reports', path: '/reports' },
    { icon: FaEnvelope, label: 'Email Marketing', path: '/email-marketing' },
    { icon: FaInfoCircle, label: 'About', path: '/about' },
    {
      icon: FaEnvelope,
      label: 'Email Verification',
      path: '/email-verification',
    },
  ];

  return (
    <>
      {/* Hamburger for mobile */}
      <div className="p-4 md:hidden bg-blue-900">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <MdClose size={24} className="text-white" />
          ) : (
            <MdMenu size={24} className="text-white" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-blue-900 text-white w-64 space-y-6 py-7 px-2 fixed md:relative md:translate-x-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out h-screen z-50 flex flex-col`}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Admin Panel</h2>

        {/* Menu */}
        <ul className="flex-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index} className="mb-3">
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 w-full bg-red-600 rounded hover:bg-red-700 mt-auto"
        >
          <MdOutlineLogout className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
