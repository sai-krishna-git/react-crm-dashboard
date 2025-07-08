import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaHome,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import ParticlesBackground from '../components/ParticlesBackground';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('customerDarkMode') === 'true'
  );
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('customerDarkMode', newMode.toString());
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      toast.error('All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const { firstName, lastName, email, phone, address, password } = formData;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            address,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/customer-login');
        }, 2000);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      } min-h-screen flex items-center justify-center relative transition-colors duration-500 py-8`}
    >
      <ParticlesBackground darkMode={darkMode} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-blue-500 hover:text-blue-700 transition"
        >
          <FaArrowLeft className="mr-2" />
        </button>

        <h2 className="text-3xl mb-6 text-center font-bold">
          Customer Registration
        </h2>

        <div className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
              <FaUser className="text-gray-600 dark:text-gray-300 mr-2" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="w-full bg-transparent p-2 focus:outline-none"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="w-full bg-transparent p-2 focus:outline-none"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
            <FaEnvelope className="text-gray-600 dark:text-gray-300 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full bg-transparent p-2 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
            <FaPhone className="text-gray-600 dark:text-gray-300 mr-2" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="w-full bg-transparent p-2 focus:outline-none"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="flex items-start border rounded px-2 py-1 bg-white/20 dark:bg-white/10">
            <FaHome className="text-gray-600 dark:text-gray-300 mr-2 mt-2" />
            <textarea
              name="address"
              placeholder="Shipping Address"
              rows="2"
              className="w-full bg-transparent p-2 focus:outline-none resize-none"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Password */}
          <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
            <FaLock className="text-gray-600 dark:text-gray-300 mr-2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="w-full bg-transparent p-2 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-600 dark:text-gray-300"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border rounded px-2 bg-white/20 dark:bg-white/10">
            <FaLock className="text-gray-600 dark:text-gray-300 mr-2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full bg-transparent p-2 focus:outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-green-600 text-white p-3 rounded-xl mt-6 hover:bg-green-700 transition transform hover:scale-105 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link
              to="/customer-login"
              className="text-green-500 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="mt-4 text-sm underline w-full text-center"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </form>
    </div>
  );
};

export default CustomerRegister;
