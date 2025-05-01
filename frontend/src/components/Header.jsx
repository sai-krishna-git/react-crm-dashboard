import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getPageName = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/customers":
        return "Customers";
      case "/orders":
        return "Orders";
      case "/products":
        return "Products";
      case "/financials":
        return "Financials";
      case "/reports":
        return "Reports";
      case "/email-marketing":
        return "Email Marketing";
      case "/about":
        return "About";
      case "/email-verification":
        return "Email Verification";
      default:
        return "CRM";
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
      <h1 className="text-xl font-semibold">{getPageName()}</h1>
      <span className="text-sm text-gray-500">Admin Panel</span>
    </div>
  );
};

export default Header;
