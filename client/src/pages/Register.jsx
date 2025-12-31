import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaCut, FaUser, FaEnvelope, FaPhoneAlt, FaUserTag, FaLock, FaKey } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Registration form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    usertype: "customer",
    password: "",
    otp: ""
  });

  const { email, name, phone, usertype, password, otp } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleOTPVisibility = () => setShowOTP(!showOTP);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!emailRegex.test(email)) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid email address',
        icon: 'error'
      });
      return;
    }

    setIsSendingOTP(true);
    try {
      const res = await api.post(`/otp/user-otp`, { email });
      if (res.status === 200) {
        setStep(2);
        Swal.fire({
          title: "Success",
          text: "OTP sent to your email",
          icon: "success"
        });
      }
      else if (res.status === 401) {
        Swal.fire({
          title: "Error",
          text: "User already exists, please login",
          icon: "error",
        });
      };
    } catch (err) {
      if (err.response?.status === 401) {
        Swal.fire({
          title: "Error",
          text: "User already exists, please login",
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to send OTP. Please try again.",
          icon: "error",
        });
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Step 2: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!emailRegex.test(email)) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid email address',
        icon: 'error'
      });
      return;
    }

    if (!name || !phone || !password || !otp) {
      Swal.fire({
        title: 'Error',
        text: 'Please fill all required fields',
        icon: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", formData);
      if (res.status === 201) {
        Swal.fire({
          title: "Success",
          text: "Registration successful",
          icon: "success",
        });
        navigate("/login", { state: { email } });
      }else if(res.status==400){
        Swal.fire({
          title: "Success",
          text: "User already registered with this email",
          icon: "success",
        });
      }
    } catch (err) {
      
      console.error("Registration Error:", err);
      Swal.fire({
        title: "Error",
        text: "Email/Phone already registered or invalid OTP",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const res = await api.post(`/otp/user-otp`, { email });
      if (res.status === 200) {
        Swal.fire({
          title: "Success",
          text: "OTP resent to your email",
          icon: "success"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to resend OTP",
        icon: "error",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Icons */}
      <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute top-1/4 right-1/4 rotate-45" />
      <FaCut className="text-white text-[100px] opacity-10 absolute bottom-1/4 left-1/4 -rotate-45" />

      {/* Form Card */}
      <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg z-10">
        <div className="logo mb-3 text-center">
          <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto w-20 rounded-full" />
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mb-3">
          {step === 1 ? "Verify Your Email" : "Complete Registration"}
        </h1>
        
        <h4 className="text-gray-300 text-center mb-5">
          {step === 1 
            ? "Please enter your email to continue" 
            : "Fill in your details to create account"
          }
        </h4>

        <form onSubmit={step === 1 ? handleSendOTP : handleRegister}>
          {/* Email Input - Always visible */}
          <div className="mb-4 relative">
            <FaEnvelope className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="john@gmail.com"
              required
              autoComplete="off"
              value={email}
              onChange={handleInput}
              disabled={(step === 2 && !isSubmitting) || isSendingOTP}
              className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>

          {/* Registration Form - Only visible in step 2 */}
          {step === 2 && (
            <>
              {/* Name */}
              <div className="mb-4 relative">
                <FaUser className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                  autoComplete="off"
                  value={name}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Phone */}
              <div className="mb-4 relative">
                <FaPhoneAlt className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="number"
                  name="phone"
                  placeholder="Enter your mobile number"
                  required
                  autoComplete="off"
                  value={phone}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
              </div>

              {/* User Type */}
              <div className="mb-4 relative flex items-center gap-2">
                <FaUserTag className="text-gray-400 ml-1" />
                <label className="text-gray-400 font-semibold w-24">User Type:</label>
                <select
                  name="usertype"
                  value={usertype}
                  onChange={handleInput}
                  required
                  disabled={isSubmitting}
                  className="flex-1 h-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-red-600 px-3"
                >
                  <option value="customer">Customer</option>
                  <option value="shopOwner">Shop Owner</option>
                </select>
              </div>

              {/* Password */}
              <div className="mb-4 relative">
                <FaLock className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              {/* OTP */}
              <div className="mb-4 relative">
                <FaKey className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showOTP ? "text" : "password"}
                  name="otp"
                  placeholder="OTP"
                  required
                  value={otp}
                  onChange={handleInput}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                  onClick={toggleOTPVisibility}
                >
                  {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              {/* Resend OTP Link */}
              <div className="text-right mb-4">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                  className="text-sm text-orange-400 hover:text-orange-500 disabled:text-orange-300 disabled:cursor-not-allowed"
                >
                  {isSendingOTP ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (step === 1 && isSendingOTP)}
            className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {step === 1 
              ? (isSendingOTP ? "Sending OTP..." : "Send OTP")
              : (isSubmitting ? "Registering..." : "Register")
            }
          </button>

          {/* Back to Step 1 */}
          {step === 2 && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="text-sm text-gray-400 hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                ← Back to change email
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center text-gray-300 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-500">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import Swal from "sweetalert2";
// import { api } from "../utils/api";
// import { FaEye, FaEyeSlash, FaCut, FaUser, FaEnvelope, FaPhoneAlt, FaUserTag, FaLock, FaKey } from "react-icons/fa";
// import { GiComb } from "react-icons/gi";

// export const Register = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const otpEmail = location.state?.email ?? "";

//   useEffect(() => {
//     if (!otpEmail) {
//       Swal.fire({
//         icon: "warning",
//         title: "Access Denied",
//         text: "Please verify your email first.",
//       });
//       navigate("/getOTP");
//     }
//   }, [otpEmail, navigate]);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: otpEmail || "",
//     phone: "",
//     usertype: "customer",
//     password: "",
//     otp: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showOTP, setShowOTP] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleInput = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const { email } = formData;

//     // Fixed email validation regex
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     if (!emailRegex.test(email)) {
//       Swal.fire({
//         title: 'Error',
//         text: 'Please enter a valid email address',
//         icon: 'error'
//       });
//       return;
//     }

//     try {
//       const res = await api.post("/auth/register", formData);
//       if (res.status === 201) {
//         Swal.fire({
//           title: "Success",
//           text: "Registration successful",
//           icon: "success",
//         });
//         navigate("/login", { state: { email } });
//       }
//     } catch (err) {
//       console.error("Registration Error:", err);
//       Swal.fire({
//         title: "Error",
//         text: "Email/Phone already registered",
//         icon: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">

//       {/* Background Icons */}
//       <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
//       <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
//       <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
//       <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

//       <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-xl z-10">
//         <h1 className="text-white text-2xl font-bold text-center mb-4">Create your account</h1>

//         <form onSubmit={handleSubmit}>

//           {/* Name */}
//           <div className="mb-4 relative">
//             <FaUser className="absolute left-3 top-2.5 text-gray-500" />
//             <input
//               type="text"
//               name="name"
//               placeholder="Enter your name"
//               required
//               autoComplete="off"
//               value={formData.name}
//               onChange={handleInput}
//               disabled={isSubmitting}
//               className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//           </div>

//           {/* Email */}
//           <div className="mb-4 relative">
//             <FaEnvelope className="absolute left-3 top-2.5 text-gray-500" />
//             <input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               required
//               value={formData.email}
//               readOnly
//               className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
//             />
//           </div>

//           {/* Phone */}
//           <div className="mb-4 relative">
//             <FaPhoneAlt className="absolute left-3 top-2.5 text-gray-500" />
//             <input
//               type="number"
//               name="phone"
//               placeholder="Enter your mobile number"
//               required
//               autoComplete="off"
//               value={formData.phone}
//               onChange={handleInput}
//               className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//           </div>

//           {/* User Type */}
//           <div className="mb-4 relative flex items-center gap-2">
//             <FaUserTag className="text-gray-400 ml-1" />
//             <label className="text-gray-400 font-semibold w-24">User Type:</label>
//             <select
//               name="usertype"
//               value={formData.usertype}
//               onChange={handleInput}
//               required
//               className="flex-1 h-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-red-600 px-3"
//             >
//               <option value="customer">Customer</option>
//               <option value="shopOwner">Shop Owner</option>
//             </select>
//           </div>

//           {/* Password */}
//           <div className="mb-4 relative">
//             <FaLock className="absolute left-3 top-2.5 text-gray-500" />
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               required
//               value={formData.password}
//               onChange={handleInput}
//               className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//             <span
//               className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           {/* OTP */}
//           <div className="mb-4 relative">
//             <FaKey className="absolute left-3 top-2.5 text-gray-500" />
//             <input
//               type={showOTP ? "text" : "password"}
//               name="otp"
//               placeholder="OTP"
//               required
//               value={formData.otp}
//               onChange={handleInput}
//               className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//             <span
//               className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
//               onClick={() => setShowOTP(!showOTP)}
//             >
//               {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>
//           <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
//             Resend OTP
//           </Link>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//           >
//             {isSubmitting ? "Registering..." : "Register"}
//           </button>

//           <div className="text-center text-gray-300 mt-4">
//             Already have an account?
//             <a href="/login" className="text-blue-400 hover:underline ml-1">Login</a>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };



