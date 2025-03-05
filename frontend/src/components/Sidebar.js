import { Link } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers, FaShoppingCart, FaBox, FaInfoCircle } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-5 fixed">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <ul>
        <li className="mb-3">
          <Link to="/" className="flex items-center gap-2 p-2 hover:bg-blue-700">
            <MdDashboard /> Dashboard
          </Link>
        </li>
        <li className="mb-3">
          <Link to="/customers" className="flex items-center gap-2 p-2 hover:bg-blue-700">
            <FaUsers /> Customers
          </Link>
        </li>
        <li className="mb-3">
          <Link to="/orders" className="flex items-center gap-2 p-2 hover:bg-blue-700">
            <FaShoppingCart /> Orders
          </Link>
        </li>
        <li className="mb-3">
          <Link to="/products" className="flex items-center gap-2 p-2 hover:bg-blue-700">
            <FaBox /> Products
          </Link>
        </li>
        <li className="mb-3">
          <Link to="/about" className="flex items-center gap-2 p-2 hover:bg-blue-700">
            <FaInfoCircle /> About
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
