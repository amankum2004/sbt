import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { FaEye, FaEyeSlash, FaCut, FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

export const UpdatePassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: ""
  });

  const { email, password, otp } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleOTPVisibility = () => setShowOTP(!showOTP);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({ title: "Error", text: "Please enter your email", icon: "error" });
      return;
    }

    setIsSendingOTP(true);
    try {
      const res = await api.post(`/otp/forgot`, { email });
      if (res.status === 200) {
        setStep(2);
        Swal.fire({ title: "Success", text: "OTP sent to your email", icon: "success" });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        Swal.fire({ title: "Error", text: "User does not exist. Please sign up.", icon: "error" });
      } else {
        Swal.fire({ title: "Error", text: "Failed to send OTP. Please try again.", icon: "error" });
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !password) {
      Swal.fire({ title: "Error", text: "Please enter OTP and new password", icon: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/auth/update`, formData);
      if (res.data.success) {
        Swal.fire({ 
          title: "Success", 
          text: "Password updated successfully", 
          icon: "success" 
        });
        navigate("/login");
      } else {
        Swal.fire({ title: "Error", text: "Failed to update password", icon: "error" });
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Invalid OTP or error updating password", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const res = await api.post(`/otp/forgot`, { email });
      if (res.status === 200) {
        Swal.fire({ title: "Success", text: "OTP resent to your email", icon: "success" });
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Failed to resend OTP", icon: "error" });
    } finally {
      setIsSendingOTP(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background Icons */}
      <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
      <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

      <div className="w-full max-w-md bg-gray-700 p-8 rounded-xl shadow-xl z-10">
        <div className="text-center mb-6">
          <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto w-20" />
          <h1 className="text-2xl font-bold mt-2">
            {step === 1 ? "Reset Password" : "Create New Password"}
          </h1>
          <h6 className="text-gray-400 text-sm">
            {step === 1 
              ? "Enter your email to receive OTP" 
              : "Enter OTP and new password"
            }
          </h6>
        </div>

        <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-4">
          {/* Email Input - Always visible */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaEnvelope className="text-gray-400" />
            </span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={handleChange}
              disabled={step === 2 || isSubmitting}
              className="w-full h-10 pl-10 pr-4 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600 disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>

          {/* OTP and Password Inputs - Only visible in step 2 */}
          {step === 2 && (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaKey className="text-gray-400" />
                </span>
                <input
                  type={showOTP ? "text" : "password"}
                  name="otp"
                  placeholder="Enter OTP"
                  required
                  value={otp}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
                />
                <span 
                  className="absolute right-3 top-2 cursor-pointer text-black" 
                  onClick={toggleOTPVisibility}
                >
                  {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  required
                  value={password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
                />
                <span 
                  className="absolute right-3 top-2 cursor-pointer text-black" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </span>
              </div>

              {/* Resend OTP Link */}
              <div className="text-right">
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
              : (isSubmitting ? "Updating..." : "Update Password")
            }
          </button>

          {/* Back to Step 1 */}
          {step === 2 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                ← Back to change email
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-3">
            <span>
              Remember your password?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-500">
                Login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}





// import React, { useState } from "react";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";
// import { api } from "../utils/api";
// import { FaEye, FaEyeSlash, FaCut } from "react-icons/fa";
// import { GiComb } from "react-icons/gi";

// export default function UpdatePassword() {
//   const location = useLocation();
//   const otpEmail = location.state?.email ?? "";
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: localStorage.getItem("forgotpassEmail") || otpEmail || "",
//     password: "",
//     otp: "",
//   });

//   const { email, password, otp } = formData;
//   const [showPassword, setShowPassword] = useState(false);
//   const [showOTP, setShowOTP] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);
//   const toggleOTPVisibility = () => setShowOTP(!showOTP);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const res = await api.post(`/auth/update`, formData);
//       if (res.data.success) {
//         localStorage.removeItem("forgotpassEmail");
//         Swal.fire({ title: "Success", text: "Password updated successfully", icon: "success" });
//         navigate("/login");
//       } else {
//         Swal.fire({ title: "Error", text: "Failed to update password", icon: "error" });
//       }
//     } catch (err) {
//       Swal.fire({ title: "Error", text: "Invalid OTP", icon: "error" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
//       {/* Background Icons */}
//             <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
//             <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
//             <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
//             <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

//       <div className="w-full max-w-md bg-gray-700 p-8 rounded-xl shadow-xl z-10">
//         <div className="text-center mb-6">
//           <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto w-20" />
//           <h1 className="text-2xl font-bold mt-2">Update Password</h1>
//           <h6 className="text-gray-400 text-sm">Enter the new details here</h6>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <i className="fa fa-envelope text-gray-400"></i>
//             </span>
//             <input
//               type="email"
//               name="email"
//               value={email}
//               readOnly
//               className="w-full h-10 pl-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
//             />
//           </div>

//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <i className="fa fa-key text-gray-400"></i>
//             </span>
//             <input
//               type={showOTP ? "text" : "password"}
//               name="otp"
//               placeholder="OTP"
//               required
//               value={otp}
//               onChange={handleChange}
//               className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
//             />
//             <span className="absolute right-3 top-2 cursor-pointer text-black" onClick={toggleOTPVisibility}>
//               {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <i className="fa fa-lock text-gray-400"></i>
//             </span>
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="New Password"
//               required
//               value={password}
//               onChange={handleChange}
//               className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
//             />
//             <span className="absolute right-3 top-2 cursor-pointer text-black" onClick={togglePasswordVisibility}>
//               {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//           >
//             {isSubmitting ? "Updating..." : "Update"}
//           </button>

//           <div className="text-center mt-3">
//             <span>
//               Already have an account?{" "}
//               <Link to="/login" className="text-blue-400 hover:text-blue-500">
//                 Login
//               </Link>
//             </span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

