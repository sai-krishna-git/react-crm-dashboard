const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      customer,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid,
      paidAt,
    } = req.body;

    // Validate that order items exist
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Create the order
    const order = new Order({
      customer,
      orderItems: await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) throw new Error(`Product ${item.product} not found`);

          return {
            product: item.product,
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            image: product.image,
          };
        })
      ),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: paymentMethod === 'Cash' ? 'Delivered' : 'Processing',
      // Handle payment status based on the payment method
      isPaid:
        paymentMethod === 'Cash' ||
        paymentMethod === 'Stripe' ||
        isPaid === true,
      paidAt:
        paymentMethod === 'Cash' ||
        paymentMethod === 'Stripe' ||
        isPaid === true
          ? paidAt || Date.now()
          : null,
      deliveredAt: paymentMethod === 'Cash' ? Date.now() : null,
    });

    const savedOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({
      message: 'Server error while creating order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders for a customer
 * @route   GET /api/orders
 * @access  Private (Customer)
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort('-createdAt')
      .populate('customer', 'name email');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Customer or Admin)
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'customer',
      'name email'
    );

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user has permission to view this order
    // Admin can view any order, but customer can only view their own orders
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Processing', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res
      .status(500)
      .json({ message: 'Server error while updating order status' });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/admin
 * @access  Private (Admin only)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort('-createdAt')
      .populate('customer', 'name email');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};
