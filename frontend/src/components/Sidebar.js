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
  ];

  return (
    <>
      {/* Hamburger for mobile - make this fixed at the top */}
      <div className="p-4 md:hidden bg-blue-900 fixed top-0 left-0 w-full z-40">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <MdClose size={24} className="text-white" />
          ) : (
            <MdMenu size={24} className="text-white" />
          )}
        </button>
      </div>

      {/* Add spacing for mobile to prevent content from hiding behind the hamburger */}
      <div className="md:hidden h-16"></div>

      {/* Mobile overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar with sticky position for desktop and fixed for mobile */}
      <div
        className={`bg-blue-900 text-white w-64 h-screen md:sticky md:top-0 fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-50 flex flex-col`}
      >
        <h2 className="text-2xl font-bold text-center py-6">Admin Panel</h2>

        {/* Scrollable menu area */}
        <div className="flex-grow overflow-y-auto px-2">
          <ul>
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
        </div>

        {/* Logout button fixed at bottom */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 w-full bg-red-600 rounded hover:bg-red-700 text-left"
          >
            <MdOutlineLogout className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
