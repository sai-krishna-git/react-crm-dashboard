const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer'); // Changed from User to Customer

const {
  authMiddleware,
  customerMiddleware,
} = require('../middleware/authMiddleware');

// 🚀 Debug Middleware to confirm the router is active
router.use((req, res, next) => {
  console.log(
    '🚀 [DEBUG] customerAuthRoutes is active:',
    req.method,
    req.originalUrl
  );
  next();
});

/**
 * @route   POST /api/customers/auth/register
 * @desc    Register a new customer
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body; // Changed username to name
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'All fields (name, email, password) are required' });
    }

    const existingCustomer = await Customer.findOne({ email }); // Changed User to Customer
    if (existingCustomer) {
      return res
        .status(400)
        .json({ error: 'Customer with this email already exists' });
    }

    const customer = new Customer({
      name, // Changed username to name
      email,
      password, // password will be hashed automatically by the pre-save hook
    });

    await customer.save();
    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/customers/auth/login
 * @desc    Login for customers
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('📧 Login Attempt - Email:', email);

    const customer = await Customer.findOne({ email }); // Changed User to Customer
    if (!customer) {
      console.log('❌ No customer found for this email:', email);
      return res.status(404).json({ error: 'Customer not found' });
    }

    console.log('🔍 Customer found:', customer);

    const isMatch = await customer.matchPassword(password); // Ensure this method is implemented correctly
    console.log('🔐 Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: customer._id, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Adjust expiration as needed
    );

    console.log('✅ Login Successful - Token generated:', token);

    // Send redirect URL for frontend to handle token
    res.json({
      message: 'Login successful',
      token,
      redirectURL: `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/customer-dashboard?token=${token}`,
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @route   GET /api/customers/auth/profile
 * @desc    Get logged-in customer's profile
 * @access  Private (Customer only)
 */
router.get('/profile', customerMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id); // Changed User to Customer

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer profile data fetched successfully',
      customer,
    });
  } catch (error) {
    console.error('❌ Profile Error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

module.exports = router;
