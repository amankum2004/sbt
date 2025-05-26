import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from '../utils/api';
import { useLogin } from "../components/LoginContext";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { loggedIn, login } = useLogin();
  const [, setClicked] = useState("");
  const [formData, setFormData] = useState({
    email: localStorage.getItem("signupEmail") || "",
    password: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loggedIn;
      navigate("/");
    }
  }, [loggedIn, navigate]);

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', formData);
      if (response.status === 200) {
        login(response.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        Swal.fire({ title: "Error", text: "User not found", icon: "error" });
      } else if (err.response?.status === 401) {
        Swal.fire({ title: "Error", text: "Email or password is wrong", icon: "error" });
      } else {
        Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
      }
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.onkeydown = async (e) => {
      if (e.key === "Enter") {
        setClicked(true);
        await handleSubmit(e);
        navigate("/login");
      }
    };
  }, [formData, navigate]);

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Login Form Section */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800 p-4">
          <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
            <div className="logo mb-3 text-center">
              <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
            </div>
            <h1 className="text-white text-2xl font-bold text-center mb-1">Login</h1>
            <h4 className="text-gray-300 text-center mb-4">Please enter your credentials</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa fa-envelope text-gray-400"></i>
                </span>
                <input
                  type="email"
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                  name="email"
                  placeholder="Enter your email"
                  id="email"
                  required
                  disabled={isSubmitting}
                  value={formData.email}
                  autoComplete="off"
                  onChange={handleInput}
                />
              </div>

              <div className="mb-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa fa-lock text-gray-400"></i>
                </span>
                <input
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  id="password"
                  required
                  autoComplete="off"
                  value={formData.password}
                  onChange={handleInput}
                />
                <span
                  className="absolute right-3 top-2 cursor-pointer text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
                Forgot password?
              </Link>

              <button
                className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
                type="button"
                disabled={isSubmitting}
                onClick={async (e) => {
                  setClicked(true);
                  await handleSubmit(e);
                }}
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </button>

              <div className="mt-3 text-center">
                <span className="text-gray-300 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link className="text-blue-500" to="/getOTP">
                    Register
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Background Image Section */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
      </div>
    </>
  );
};

export default Login;
