const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @desc    Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Customer Login
 * @route   POST /api/customers/login
 * @access  Public
 */
exports.customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return customer data along with JWT token
    res.status(200).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
      token: generateToken(customer._id),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Admin
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ message: 'Server error while fetching customers' });
  }
};

/**
 * @desc    Add  customer
 * @route   POST /api/customers
 * @access  Admin
 */
exports.addCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password = '123456' } = req.body;
    const name = `${firstName} ${lastName}`; // Combine first and last name
    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    // Create new customer
    const newCustomer = new Customer({
      name,
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    await newCustomer.save();
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (err) {
    console.error('Error adding customer:', err.message);
    res.status(500).json({ message: 'Server error while adding customer' });
  }
};

/**
 * @desc    Get a single customer by ID
 * @route   GET /api/customers/:id
 * @access  Admin
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err.message);
    res.status(500).json({ message: 'Server error while fetching customer' });
  }
};

/**
 * @desc    Update a customer by ID
 * @route   PUT /api/customers/:id
 * @access  Admin
 */
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update customer details
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    if (req.body.password) {
      customer.password = req.body.password; // Ensure password hashing is done in the model
    }

    const updatedCustomer = await customer.save();
    const { password, ...customerWithoutPassword } = updatedCustomer.toObject();

    res.status(200).json(customerWithoutPassword);
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ message: 'Server error while updating customer' });
  }
};

/**
 * @desc    Delete a customer by ID
 * @route   DELETE /api/customers/:id
 * @access  Admin
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.deleteOne();
    res.status(200).json({ message: 'Customer removed successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ message: 'Server error while deleting customer' });
  }
};

/**
 * @desc    Get dashboard info for logged-in customer
 * @route   GET /api/customers/dashboard
 * @access  Customer
 */
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer dashboard data fetched successfully',
      customer,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res
      .status(500)
      .json({ message: 'Server error while fetching dashboard data' });
  }
};

/**
 * @desc    Get customer profile for logged-in customer
 * @route   GET /api/customers/profile
 * @access  Customer
 */
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    // Mock order data — replace this with real DB fetch later
    const orders = [
      { id: 1, product: 'Product A', date: '2025-04-01', status: 'Delivered' },
      { id: 2, product: 'Product B', date: '2025-04-15', status: 'Shipped' },
    ];

    res.status(200).json({
      message: 'Customer profile data fetched successfully',
      customer,
      orders,
    });
  } catch (err) {
    console.error('Profile error:', err.message);
    res
      .status(500)
      .json({ message: 'Server error while fetching customer profile' });
  }
};
