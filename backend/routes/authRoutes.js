const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// ==========================
// ✅ JWT Token Generator
// ==========================
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ==========================
// ✅ Register (Admin / Customer)
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role)
      return res.status(400).json({ error: 'All fields are required' });
    if (!['admin', 'customer'].includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ username, email, password, role });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================
// ✅ Login (Admin / Customer)
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT Token
    const token = generateToken(user._id, user.role);

    // Redirect URL for successful login (Customer Dashboard if user is customer)
    let redirectURL = 'http://localhost:3000/admin-dashboard'; // Default to Admin Dashboard
    if (user.role === 'customer') {
      redirectURL = `http://localhost:3000/customer-dashboard?token=${token}`;
    }

    return res.json({
      message: 'Login successful',
      token: token,
      redirectURL: redirectURL,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ==========================
// ✅ Google Login
// ==========================
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Google Callback + Redirect to Login Page with Token
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login?error=google_auth_failed',
  }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect('http://localhost:3000/login?error=user_not_found');
      }

      const token = generateToken(user._id, user.role);
      let redirectURL = `http://localhost:3000/login?token=${token}&name=${encodeURIComponent(
        user.name
      )}&email=${encodeURIComponent(user.email)}`;

      if (user.role === 'customer') {
        redirectURL = `http://localhost:3000/customer-dashboard?token=${token}`;
      }

      res.redirect(redirectURL);
    } catch (error) {
      console.error('❌ Google Callback Error:', error);
      res.redirect('http://localhost:3000/login?error=google_auth_failed');
    }
  }
);

// ==========================
// ✅ GitHub Login
// ==========================
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// ✅ GitHub Callback + Redirect to Login Page with Token
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: 'http://localhost:3000/login?error=github_auth_failed',
  }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect('http://localhost:3000/login?error=user_not_found');
      }

      const token = generateToken(user._id, user.role);
      let redirectURL = `http://localhost:3000/login?token=${token}&name=${encodeURIComponent(
        user.name
      )}&email=${encodeURIComponent(user.email)}`;

      if (user.role === 'customer') {
        redirectURL = `http://localhost:3000/customer-dashboard?token=${token}`;
      }

      res.redirect(redirectURL);
    } catch (error) {
      console.error('❌ GitHub Callback Error:', error);
      res.redirect('http://localhost:3000/login?error=github_auth_failed');
    }
  }
);

module.exports = router;
