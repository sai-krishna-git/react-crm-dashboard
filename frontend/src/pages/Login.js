import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../auth';
import { toast } from 'react-toastify';
import ParticlesBackground from '../components/ParticlesBackground';
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
} from 'react-icons/fa';

const Login = () => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle token and user data from OAuth redirects
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const name = queryParams.get('name');
    const email = queryParams.get('email');

    if (token) {
      setToken(token);

      if (name && email) {
        localStorage.setItem('user', JSON.stringify({ name, email }));
      }

      toast.success(`Login Successful${name ? ` - Welcome ${name}` : ''}`);
      navigate('/dashboard');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Invalid Credentials!');
        return;
      }

      // Save the token and navigate to the dashboard
      setToken(data.token, 'admin');
      toast.success('Login Successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  const handleGitHubLogin = () => {
    window.open('http://localhost:5000/auth/github', '_self');
  };

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      } h-screen flex items-center justify-center relative transition-colors duration-500`}
    >
      <ParticlesBackground darkMode={darkMode} />

      <form
        onSubmit={handleLogin}
        className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 p-8 rounded-2xl shadow-2xl w-96 animate-fade-in"
      >
        {/* Back Arrow Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-blue-500 hover:text-blue-700 transition"
        >
          <FaArrowLeft className="mr-2" />
        </button>
        <h2 className="text-3xl mb-6 text-center font-bold">Admin Login</h2>

        {/* Email */}
        <div className="flex items-center border rounded px-2 mb-4 bg-white/20 dark:bg-white/10">
          <FaUser className="text-gray-600 dark:text-gray-300 mr-2" />
          <input
            type="email"
            placeholder="email"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="flex items-center border rounded px-2 mb-4 bg-white/20 dark:bg-white/10">
          <FaLock className="text-gray-600 dark:text-gray-300 mr-2" />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex justify-between mb-4 text-sm">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-blue-500"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() =>
              toast.info('Forgot Password functionality coming soon!')
            }
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin-register')}
          className="text-blue-500 hover:underline"
        >
          Register now?
        </button>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-2 rounded-xl hover:bg-blue-800 transition transform hover:scale-105"
        >
          Login
        </button>

        {/* Toggle Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          type="button"
          className="mt-4 text-sm underline w-full text-center"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </form>
    </div>
  );
};

export default Login;
