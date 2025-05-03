// auth.js

const API_URL = 'http://localhost:5000'; // Backend Base URL

// Role-specific token keys
const TOKEN_KEYS = {
  admin: 'admin_token',
  customer: 'customer_token',
};

// Save token to localStorage for a specific role (admin or customer)
export const setToken = (token, role = 'admin') => {
  console.log(`Setting token for role: ${role}`);
  console.log(`Token: ${token}`);
  const key = TOKEN_KEYS[role] || TOKEN_KEYS.admin;
  console.log(`Using key: ${key}`);
  localStorage.setItem(key, token);
  window.dispatchEvent(new Event('storage')); // Notify other app parts
};

// Retrieve token for a given role
export const getToken = (role = 'admin') => {
  const key = TOKEN_KEYS[role] || TOKEN_KEYS.admin;
  return localStorage.getItem(key);
};

// Check if a user is authenticated based on role
export const isAuthenticated = (role = 'admin') => {
  return Boolean(getToken(role));
};

// Identify logged-in user role (if any)
export const getUserRole = () => {
  if (localStorage.getItem(TOKEN_KEYS.admin)) return 'admin';
  if (localStorage.getItem(TOKEN_KEYS.customer)) return 'customer';
  return null;
};

// Log out user of a specific role
export const logout = (role = 'admin') => {
  const key = TOKEN_KEYS[role] || TOKEN_KEYS.admin;
  localStorage.removeItem(key);
  window.dispatchEvent(new Event('storage'));
};

// Full logout: remove both tokens
export const clearAllTokens = () => {
  Object.values(TOKEN_KEYS).forEach(localStorage.removeItem.bind(localStorage));
  window.dispatchEvent(new Event('storage'));
};

// Unified login function for admin/customer
export const login = async (email, password, role = 'admin') => {
  const loginEndpoint =
    role === 'customer'
      ? `${API_URL}/api/customers/auth/login`
      : `${API_URL}/api/admin/auth/login`;

  try {
    const response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || 'Login failed';
      throw new Error(`${response.status} - ${errorMsg}`);
    }

    if (data.token) {
      setToken(data.token, role);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Unexpected error during login');
  }
};

// Optional: Stub for token expiry/refresh check (future-proofing)
/*
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
};
*/
