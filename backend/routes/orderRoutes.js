const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  createPaymentIntent,
} = require('../controllers/orderController');
const {
  authMiddleware,
  adminMiddleware,
  customerMiddleware,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', customerMiddleware, getMyOrders);
// Add this route
router.post('/create-payment-intent', customerMiddleware, createPaymentIntent);

// Shared routes (for both customer and admin)
router.get('/:id', getOrderById);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
