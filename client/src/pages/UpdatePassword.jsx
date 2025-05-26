import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import {FaEye, FaEyeSlash} from "react-icons/fa";

export default function UpdatePassword() {
  const location = useLocation();
  const otpEmail = location.state?.email ?? "";
  const [formData, setFormData] = useState({
    email: localStorage.getItem("forgotpassEmail") || otpEmail || "",
    password: "",
    otp: "",
  });

  const { email, password, otp } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleOTPVisibility = () => {
    setShowOTP(!showOTP);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/auth/update`, formData);
      if (res.data.success) {
        localStorage.removeItem("forgotpassEmail");
        Swal.fire({ title: "Success", text: "Password updated successfully", icon: "success" });
        navigate("/login");
      } else {
        console.error("failed to save");
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Invalid OTP", icon: "error" });
    }
  };

  return (
    <>
      <div className="container-fluid h-1500 flex">
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
          <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
            <div className="logo mb-3 text-center">
              <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
            </div>
            <h1 className="text-white text-2xl font-bold text-center mb-1">Update Password</h1>
            <h4 className="text-gray-300 text-center mb-4">Enter the new details here</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa fa-envelope text-gray-400"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  readOnly
                  required
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="mb-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa fa-key text-gray-400"></i>
                </span>
                <input
                  type={showOTP ? "text" : "password"}
                  id="otp"
                  name="otp"
                  value={otp}
                  required
                  placeholder="OTP"
                  onChange={handleChange}
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
                <span
                  className="absolute right-3 top-2 cursor-pointer"
                  onClick={toggleOTPVisibility}
                >
                  {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              <div className="mb-6 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="fa fa-lock text-gray-400"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  required
                  placeholder="New Password"
                  onChange={handleChange}
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
                <span
                  className="absolute right-3 top-2 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>
              
              <button
                className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
                type="submit"
              >
                Update
              </button>
              <div className="mt-3 text-center">
                <span className="text-gray-300 text-sm">
                  Already have an account?{" "}
                  <Link className="text-blue-500" to="/login">
                    Login
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
      </div>
    </>
  );
}
