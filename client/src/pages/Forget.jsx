import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
// import axios from "axios";
// import { SERVERIP } from "../config";
import Swal from "sweetalert2";
import { api } from "../utils/api";

export default function Forget() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { email } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post(`${SERVERIP}/otp/user-otp1`, {
      const res = await api.post(`/otp/forgot`, {
        email,
      });
      if (res.status === 200) {
        setIsSubmitting(false);
        navigate('/update', { state: { email: formData.email } })
        // const res1 = await axios.post(`${SERVERIP}/otp/send-otp-forgot`,formData);
        // if (res1.data.success) {
        //   localStorage.setItem("forgotpassEmail", formData.email); // Store email in local storage
        //   navigate("/update");
        // } 
      }
    } catch (err) {
      if (err.response.status === 401) {
        Swal.fire({ title: "Error", text: "User does not exist please sign up", icon: "error" });
      } else if (err.response.status === 500) {
        Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
    <div className="h-screen flex">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
        <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
          <div className="logo mt-5 mb-3 text-center">
            <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
          </div>
          <h4 className="text-white text-2xl font-bold text-center mb-1">Reset your password</h4>
          <h6 className="text-gray-300 text-center mb-5">Enter email to receive OTP</h6>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-envelope text-gray-400"></i>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full h-10 pl-10 border border-transparent rounded-lg bg-white text-center focus:outline-none focus:border-red-600"
                placeholder="Enter your email"
                required
                value={email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <Link
              to="/forget"
              className="text-sm text-orange-400 hover:text-orange-500 block text-right mr-20px"
            >
              Resend OTP
            </Link>

            <button
              disabled={isSubmitting}
              className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-200"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <div className="text-center mt-4">
              <span className="text-white">
                Already have an account?{" "}
                <Link className="text-blue-400 hover:text-blue-500" to="/login">
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
