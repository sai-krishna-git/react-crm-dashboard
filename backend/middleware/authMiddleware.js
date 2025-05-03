const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Updated to use the User model
const CUstomer = require('../models/Customer'); // Updated to use the Customer model
const Customer = require('../models/Customer');

// General Authentication Middleware (Verifies JWT Token)
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Access denied, token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user object from DB, excluding password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error('JWT Verification Failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin-Only Middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, Admins only' });
  }
  next();
};

// Customer-Only Middleware
const customerMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Access denied, token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user object from DB, excluding password
    const user = await Customer.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user object to request
  } catch (error) {
    console.error('JWT Verification Failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  console.log('Customer Middleware:', req.user); // Debugging line
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied, Customers only' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  customerMiddleware,
};
