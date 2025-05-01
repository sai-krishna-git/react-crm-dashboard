import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setToken } from "../auth";
import { toast } from "react-toastify";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FaUser, FaLock, FaGoogle, FaGithub } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle token and user data from OAuth redirects
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const name = queryParams.get("name");
    const email = queryParams.get("email");

    if (token) {
      setToken(token);

      if (name && email) {
        localStorage.setItem("user", JSON.stringify({ name, email }));
      }

      toast.success(`Login Successful${name ? ` - Welcome ${name}` : ""}`);
      navigate("/dashboard");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setToken("fake-jwt-token");
      toast.success("Login Successful");
      navigate("/dashboard");
    } else {
      toast.error("Invalid Credentials!");
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  const handleGitHubLogin = () => {
    window.open("http://localhost:5000/auth/github", "_self");
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } h-screen flex items-center justify-center relative transition-colors duration-500`}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: { enable: true },
            move: { enable: true, speed: 2 },
            number: {
              density: { enable: true, area: 800 },
              value: 80,
            },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      <form
        onSubmit={handleLogin}
        className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-black/30 p-8 rounded-2xl shadow-2xl w-96 animate-fade-in"
      >
        <h2 className="text-3xl mb-6 text-center font-bold">Admin Login</h2>

        {/* Username */}
        <div className="flex items-center border rounded px-2 mb-4 bg-white/20 dark:bg-white/10">
          <FaUser className="text-gray-600 dark:text-gray-300 mr-2" />
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
              toast.info("Forgot Password functionality coming soon!")
            }
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-2 rounded-xl hover:bg-blue-800 transition transform hover:scale-105"
        >
          Login
        </button>

        {/* OAuth Buttons */}
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

        {/* Toggle Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          type="button"
          className="mt-4 text-sm underline w-full text-center"
        >
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
      </form>
    </div>
  );
};

export default Login;
