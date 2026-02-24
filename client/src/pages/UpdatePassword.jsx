import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { FaEye, FaEyeSlash, FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import BackgroundIcons from "../components/BackgroundIcons";

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
      const res = await api.post(
        `/otp/forgot`,
        { email },
        { allowSuccessFalse: true }
      );

      if (res.data?.success) {
        setStep(2);
        Swal.fire({ title: "Success", text: "OTP sent to your email", icon: "success" });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Unable to send OTP",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Failed to send OTP. Please try again.",
        icon: "error"
      });
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
      const res = await api.post(`/auth/update`, formData, { allowSuccessFalse: true });
      if (res.data.success) {
        Swal.fire({ 
          title: "Success", 
          text: "Password updated successfully", 
          icon: "success" 
        });
        navigate("/login");
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Failed to update password",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Invalid OTP or error updating password",
        icon: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const res = await api.post(
        `/otp/forgot`,
        { email },
        { allowSuccessFalse: true }
      );

      if (res.data?.success) {
        Swal.fire({ title: "Success", text: "OTP resent to your email", icon: "success" });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || res.data?.error || "Unable to resend OTP",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data?.error || "Failed to resend OTP",
        icon: "error"
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <BackgroundIcons count={7} />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/15 bg-slate-900/75 p-7 shadow-[0_20px_60px_-24px_rgba(8,47,73,0.9)] backdrop-blur md:p-8">
          <div className="mb-6 text-center">
            <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto h-16 w-16 rounded-full bg-white p-1" />
            <h1 className="mt-4 bg-gradient-to-r from-cyan-200 via-amber-200 to-orange-200 bg-clip-text text-3xl font-black text-transparent">
              {step === 1 ? "Reset Password" : "Create New Password"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and set your new password"}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={handleChange}
                disabled={step === 2 || isSubmitting}
                className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {step === 2 && (
              <>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FaKey />
                  </span>
                  <input
                    type={showOTP ? "text" : "password"}
                    name="otp"
                    placeholder="Enter OTP"
                    required
                    value={otp}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-slate-300 transition hover:text-white"
                    onClick={toggleOTPVisibility}
                  >
                    {showOTP ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/65 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-slate-300 transition hover:text-white"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isSendingOTP}
                    className="text-sm font-medium text-amber-300 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendingOTP ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (step === 1 && isSendingOTP)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === 1
                ? (isSendingOTP ? "Sending OTP..." : "Send OTP")
                : (isSubmitting ? "Updating..." : "Update Password")}
            </button>

            {step === 2 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-300 hover:text-white"
                >
                  Back to change email
                </button>
              </div>
            )}

            <div className="text-center text-sm text-slate-300">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
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

