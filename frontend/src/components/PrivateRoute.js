import { Navigate } from "react-router-dom";
import { getToken } from "../auth"; // token helper

const PrivateRoute = ({ children }) => {
  const token = getToken();

  // if token doesn't exist redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // else allow access
  return children;
};

export default PrivateRoute;
