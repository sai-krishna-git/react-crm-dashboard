const express = require("express");
const {
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerDashboard,
    getCustomerProfile, // Added for customer profile
} = require("../controllers/customerController");

const {
    authMiddleware,
    adminMiddleware,
    customerMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// \u2705 GET /api/customers/dashboard - Customer Dashboard (Customer only)
router.get("/dashboard", authMiddleware, customerMiddleware, getCustomerDashboard);

// \u2705 GET /api/customers/profile - Customer Profile (Customer only)
router.get("/profile", authMiddleware, customerMiddleware, getCustomerProfile); // Added profile route

// \u2705 GET /api/customers - Get all customers (Admin only)
router.get("/", authMiddleware, adminMiddleware, getAllCustomers);

// \u2705 GET /api/customers/:id - Get a single customer by ID (Admin only)
router.get("/:id", authMiddleware, adminMiddleware, getCustomerById);

// \u2705 PUT /api/customers/:id - Update a customer by ID (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, updateCustomer);

// \u2705 DELETE /api/customers/:id - Delete a customer by ID (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteCustomer);

module.exports = router;
