// src/components/Protected.js

import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../auth";

const Protected = ({ children, expectedRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to={expectedRole === "customer" ? "/customer-login" : "/login"} replace />;
  }

  const userRole = getUserRole(); // Assumes function exists to get role: 'admin' or 'customer'
  if (expectedRole && userRole !== expectedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default Protected;
