import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
import React from "react"; 
import { api } from "../utils/api";
// import { SERVERIP } from "../config";
import Swal from "sweetalert2";

export default function GetOTP() {
  // const [formData, setFormData] = useState({
  //   email: "",
  // });
  // const { email } = formData;

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const navigate = useNavigate();

  // const handleChange = (e) => {
  //   setFormData({ 
  //     ...formData, 
  //     [e.target.name]: e.target.value 
  //   });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(email)
    ) {
      setEmail('')
      Swal.fire({
        title: 'Error',
        text: 'Invalid email id. Use valid mail id.',
        icon: 'error'
      })
      return setIsSubmitting(false)
    }
    setIsSubmitting(true)
    try {
        // const res = await axios.post(`${SERVERIP}/otp/user-otp`, {
        const res = await api.post(`/otp/user-otp`, {
          email
        });
        if (res.status === 200) {
          setIsSubmitting(false)
          navigate('/register', { state: { email } })
        }
        // if (res.status === 200) {
        //   setIsSubmitting(false);
        //   const sendOtpRes = await axios.post(`${SERVERIP}/otp/send-otp`, {
        //     email,
        //   });
        //   if (sendOtpRes.data.success){
        //     localStorage.setItem("getotpEmail", email); // Store email in local storage
        //     // localStorage.setItem("token", email); // Store email in local storage
        //     navigate("/register");
        //   } else {
        //     console.error("Failed to send");
        //   }
        // }
    } catch (err) {
        if (err.response.status === 401) {
          Swal.fire({
            title: "Error",
            text: "User already exists please login",
            icon: "error",
          })
          return setIsSubmitting(false)
        } else{
          Swal.fire({
            title: "Error",
            text: "Internal server error",
            icon: "error",
          });
        }
    }
    setIsSubmitting(false);
     
    
  };
  
  return (
    <>
    <div className="container-fluid h-1500 flex">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
        <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
          <div className="logo mb-3 text-center">
            <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
          </div>
          <h1 className="text-white text-2xl font-bold text-center mb-3">Enter your Email</h1>
          <h4 className="text-gray-300 text-center mb-5">Please verify email to continue</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-envelope text-gray-400"></i>
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                id="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
            </div>
            <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
              Resend OTP
            </Link>
            <button
              disabled={isSubmitting}
              className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <div className="mt-5 text-center">
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
