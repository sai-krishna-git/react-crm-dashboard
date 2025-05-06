import React, { useEffect, useState } from 'react';

import {
  BrowserRouter as Router, // ✅ Use BrowserRouter for query string handling
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// Add this import for toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Sidebar from './components/Sidebar';
import Protected from './components/Protected';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Products from './pages/Products';
import About from './pages/About';
import EmailVerification from './pages/EmailVerification';
import Reports from './pages/Reports';
import EmailMarketing from './pages/EmailMarketing';
import Financials from './pages/Financials';
import Login from './pages/Login';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import NotFound from './pages/NotFound';
import Home from './pages/Home'; // Import Home component
import AdminRegister from './pages/AdminRegister';
import CustomerRegister from './pages/CustomerRegister';
import Checkout from './pages/Checkout';

// Auth
import { getToken } from './auth';

import './App.css';

// ✅ Google OAuth handler
function GoogleAuthHandler({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromGoogle = urlParams.get('token');

    if (tokenFromGoogle) {
      localStorage.setItem('admin_token', tokenFromGoogle);
      setToken(tokenFromGoogle);
      navigate('/dashboard', { replace: true }); // ✅ Navigate and clean URL
    }
  }, [location, navigate, setToken]);

  return null;
}

// App Layout with conditional sidebar
function AppLayout({ children, adminToken }) {
  const location = useLocation();

  const isAdminRoute = [
    '/dashboard',
    '/checkout',
    '/customers',
    '/orders',
    '/products',
    '/financials',
    '/reports',
    '/about',
    '/email-verification',
    '/email-marketing',
  ].some((route) => location.pathname.startsWith(route));

  return (
    <div className="App flex">
      {adminToken && isAdminRoute && <Sidebar />}
      <main className="content flex-1 p-4">{children}</main>
    </div>
  );
}

function App() {
  const [adminToken, setAdminToken] = useState(getToken('admin'));
  const [customerToken, setCustomerToken] = useState(getToken('customer'));

  useEffect(() => {
    const handleStorageChange = () => {
      setAdminToken(getToken('admin'));
      setCustomerToken(getToken('customer'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      {/* Add ToastContainer here */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <GoogleAuthHandler setToken={setAdminToken} />
      <AppLayout adminToken={adminToken}>
        <Routes>
          {/* Default Root: Redirect to Admin Login */}
          <Route path="/" element={<Home />} />

          {/* Admin Login */}
          <Route
            path="/login"
            element={
              adminToken ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Customer Login */}
          <Route
            path="/customer-login"
            element={
              customerToken ? (
                <Navigate to="/customer-dashboard" replace />
              ) : (
                <CustomerLoginPage />
              )
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/customer-dashboard"
            element={
              customerToken ? (
                <CustomerDashboard />
              ) : (
                <Navigate to="/customer-login" replace />
              )
            }
          />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/customer-register" element={<CustomerRegister />} />

          <Route path="/about" element={<About />} />

          {/* Admin Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />
          <Route
            path="/customers"
            element={
              <Protected>
                <Customers />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/products"
            element={
              <Protected>
                <Products />
              </Protected>
            }
          />
          <Route
            path="/financials"
            element={
              <Protected>
                <Financials />
              </Protected>
            }
          />
          <Route
            path="/email-verification"
            element={
              <Protected>
                <EmailVerification />
              </Protected>
            }
          />
          <Route
            path="/reports"
            element={
              <Protected>
                <Reports />
              </Protected>
            }
          />
          <Route
            path="/email-marketing"
            element={
              <Protected>
                <EmailMarketing />
              </Protected>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
