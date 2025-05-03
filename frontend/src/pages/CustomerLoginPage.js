import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { setToken } from '../auth';
import ParticlesBackground from '../components/ParticlesBackground';

const CustomerLoginPage = () => {
  const [email, setEmail] = useState(
    localStorage.getItem('rememberedEmail') || ''
  );
  const [password, setPassword] = useState(
    localStorage.getItem('rememberedPassword') || ''
  );
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('rememberedEmail')
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('customerDarkMode') === 'true'
  );
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const name = queryParams.get('name');
    const email = queryParams.get('email');

    if (token) {
      //setToken(token, 'customer');
      if (name && email) {
        localStorage.setItem('user', JSON.stringify({ name, email }));
      }
      toast.success(
        `Customer Login Successful${name ? ` - Welcome ${name}` : ''}`
      );
      navigate('/customer-dashboard');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in both email and password.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/customers/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const { token, role, name } = data;

        setToken(token, 'customer');
        localStorage.setItem('user', JSON.stringify({ name, email, role }));

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }

        toast.success(`Login Successful. Welcome ${name}`);
        navigate('/customer-dashboard');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    }
  };

  const handleGoogleLogin = () =>
    window.open('http://localhost:5000/auth/google', '_self');
  const handleGitHubLogin = () =>
    window.open('http://localhost:5000/auth/github', '_self');

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('customerDarkMode', newMode);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      } h-screen flex items-center justify-center relative transition-colors duration-500`}
    >
      <ParticlesBackground darkMode={darkMode} />

      <form
        onSubmit={handleLogin}
        className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 p-8 rounded-2xl shadow-2xl w-96 max-w-full animate-fade-in"
      >
        {/* Back Arrow Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-blue-500 hover:text-blue-700 transition"
        >
          <FaArrowLeft className="mr-2" />
        </button>
        <h2 className="text-3xl mb-6 text-center font-bold">Customer Login</h2>

        <div className="flex items-center border rounded px-2 mb-4 bg-white/20 dark:bg-white/10">
          <FaUser className="text-gray-600 dark:text-gray-300 mr-2" />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={email}
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Customer Email"
          />
        </div>

        <div className="flex items-center border rounded px-2 mb-4 bg-white/20 dark:bg-white/10">
          <FaLock className="text-gray-600 dark:text-gray-300 mr-2" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={password}
            autoComplete="current-password"
            required
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Customer Password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-600 dark:text-gray-300 ml-2"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

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
          type="submit"
          className="w-full bg-green-700 text-white p-2 rounded-xl hover:bg-green-800 transition transform hover:scale-105"
        >
          Login
        </button>

        <div className="flex space-x-2 mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex-1 flex items-center justify-center border rounded p-2 hover:bg-red-500 hover:text-white transition"
          >
            <FaGoogle className="mr-2" /> Google
          </button>

          <button
            type="button"
            onClick={handleGitHubLogin}
            className="flex-1 flex items-center justify-center border rounded p-2 hover:bg-gray-800 hover:text-white transition"
          >
            <FaGithub className="mr-2" /> GitHub
          </button>
        </div>

        <button
          onClick={toggleDarkMode}
          type="button"
          className="mt-4 text-sm underline w-full text-center"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </form>
    </div>
  );
};

export default CustomerLoginPage;
