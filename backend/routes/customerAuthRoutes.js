const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { authMiddleware, customerMiddleware } = require("../middleware/authMiddleware");

// \U0001f680 Debug Middleware to confirm the router is active
router.use((req, res, next) => {
    console.log("\U0001f680 [DEBUG] customerAuthRoutes is active:", req.method, req.originalUrl);
    next();
});

/**
 * @route   POST /api/customers/auth/register
 * @desc    Register a new customer
 * @access  Public
 */
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields (username, email, password) are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const user = new User({
            username,
            email,
            password, // password will be hashed automatically by the pre-save hook
            role: "customer"
        });

        await user.save();
        res.status(201).json({ message: "Customer registered successfully" });
    } catch (error) {
        console.error("\u274c Register Error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

/**
 * @route   POST /api/customers/auth/login
 * @desc    Login for customers
 * @access  Public
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        console.log("\U0001f4e7 Login Attempt - Email:", email);

        const user = await User.findOne({ email, role: "customer" });
        if (!user) {
            console.log("\u274c No user found for this email:", email);
            return res.status(404).json({ error: "Customer not found" });
        }

        console.log("\U0001f50d User found:", user);

        const isMatch = await user.matchPassword(password); // Ensure this method is implemented correctly
        console.log("\U0001f510 Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Adjust expiration as needed
        );

        console.log("\u2705 Login Successful - Token generated:", token);

        // Send redirect URL for frontend to handle token
        res.json({
            message: "Login successful",
            token,
            redirectURL: `${process.env.FRONTEND_URL || "http://localhost:3000"}/customer-dashboard?token=${token}`
        });
    } catch (error) {
        console.error("\u274c Login Error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

/**
 * @route   GET /api/customers/auth/profile
 * @desc    Get logged-in customer's profile
 * @access  Private (Customer only)
 */
router.get("/profile", authMiddleware, customerMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== "customer") {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.json({
            profile: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("\u274c Profile Error:", error);
        res.status(500).json({ error: "Server error while fetching profile" });
    }
});

module.exports = router;
