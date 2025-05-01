const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');  // Ensure correct path

// Connect to the database
mongoose.connect('mongodb://localhost:27017/crmDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// The password to hash
const plainPassword = 'cust1234';

bcrypt.hash(plainPassword, 10)
  .then(async (hashedPassword) => {
    // Find the user and update the password
    const user = await User.findOne({ email: "customer@example.com" });
    if (user) {
      user.password = hashedPassword;
      await user.save();
      console.log("Password updated successfully");
    } else {
      console.log("User not found");
    }
  })
  .catch((err) => {
    console.error("Error hashing password:", err);
  });
