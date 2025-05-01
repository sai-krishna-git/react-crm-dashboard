const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer"); // Updated to use the Customer model

// General Authentication Middleware (Verifies JWT Token)
const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied, token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch full customer object from DB, excluding password
        const customer = await Customer.findById(decoded.id).select("-password");

        if (!customer) {
            return res.status(401).json({ message: "Customer not found" });
        }

        req.user = customer; // Attach customer object to request
        next();
    } catch (error) {
        console.error("JWT Verification Failed:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Admin-Only Middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied, Admins only" });
    }
    next();
};

// Customer-Only Middleware
const customerMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "customer") {
        return res.status(403).json({ message: "Access denied, Customers only" });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    customerMiddleware,
};
