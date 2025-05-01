const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const register = async (req, res) => {
    try {
        const { name, email, password, role = "user" } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = generateToken(newUser._id, newUser.role);

        return res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token,
        });
    } catch (error) {
        console.error("[Register Error]:", error.message);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

// Login Handler with FULL DEBUGGING
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("============== LOGIN ATTEMPT ==============");
        console.log("Email entered:", email);
        console.log("Password entered:", password);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const isCustomerRoute = req.originalUrl.includes("/api/customers/auth/login");
        const roleFilter = isCustomerRoute ? { role: "customer" } : {};  // Adjust role filter for customer route

        const user = await User.findOne({ email, ...roleFilter });

        console.log("User fetched from DB:", user);

        if (!user) {
            console.log("[LOGIN FAIL] User not found or role mismatch");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("[LOGIN FAIL] Invalid password for:", email);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("[LOGIN SUCCESS] ✅ Logged in as:", user.email);

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error("[Login Error]:", error.message);
        return res.status(500).json({ message: "Server error during login" });
    }
};

// Fetch user profile (only after authentication)
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");  // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("[Profile Fetch Error]:", error.message);
        return res.status(500).json({ message: "Error fetching profile" });
    }
};

module.exports = {
    register,
    login,
    getProfile,
};
