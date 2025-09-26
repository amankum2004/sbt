import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { FaEye, FaEyeSlash, FaCut } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

export default function UpdatePassword() {
  const location = useLocation();
  const otpEmail = location.state?.email ?? "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("forgotpassEmail") || otpEmail || "",
    password: "",
    otp: "",
  });

  const { email, password, otp } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleOTPVisibility = () => setShowOTP(!showOTP);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post(`/auth/update`, formData);
      if (res.data.success) {
        localStorage.removeItem("forgotpassEmail");
        Swal.fire({ title: "Success", text: "Password updated successfully", icon: "success" });
        navigate("/login");
      } else {
        Swal.fire({ title: "Error", text: "Failed to update password", icon: "error" });
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Invalid OTP", icon: "error" });
    } finally {
      setIsSubmitting(false);
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
          <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto w-20" />
          <h1 className="text-2xl font-bold mt-2">Update Password</h1>
          <h6 className="text-gray-400 text-sm">Enter the new details here</h6>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa fa-envelope text-gray-400"></i>
            </span>
            <input
              type="email"
              name="email"
              value={email}
              readOnly
              className="w-full h-10 pl-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa fa-key text-gray-400"></i>
            </span>
            <input
              type={showOTP ? "text" : "password"}
              name="otp"
              placeholder="OTP"
              required
              value={otp}
              onChange={handleChange}
              className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
            />
            <span className="absolute right-3 top-2 cursor-pointer text-black" onClick={toggleOTPVisibility}>
              {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa fa-lock text-gray-400"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              required
              value={password}
              onChange={handleChange}
              className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white text-black focus:outline-none focus:border-red-600"
            />
            <span className="absolute right-3 top-2 cursor-pointer text-black" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>

          <div className="text-center mt-3">
            <span>
              Already have an account?{" "}
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
// import { FaEye, FaEyeSlash } from "react-icons/fa";

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
//     <div className="h-screen flex">
//       <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800 p-4">
//         <div className="w-full max-w-md p-8 mt-10 bg-gray-700 rounded-lg shadow-lg">
//           <div className="logo mb-4 text-center">
//             <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
//           </div>

//           <h1 className="text-white text-2xl font-bold text-center mb-1">Update Password</h1>
//           <h4 className="text-gray-300 text-center mb-5">Enter the new details here</h4>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="relative">
//               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                 <i className="fa fa-envelope text-gray-400"></i>
//               </span>
//               <input
//                 type="email"
//                 name="email"
//                 value={email}
//                 readOnly
//                 className="w-full h-10 pl-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               />
//             </div>

//             <div className="relative">
//               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                 <i className="fa fa-key text-gray-400"></i>
//               </span>
//               <input
//                 type={showOTP ? "text" : "password"}
//                 name="otp"
//                 placeholder="OTP"
//                 required
//                 value={otp}
//                 onChange={handleChange}
//                 className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               />
//               <span className="absolute right-3 top-2 cursor-pointer" onClick={toggleOTPVisibility}>
//                 {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//               </span>
//             </div>

//             <div className="relative">
//               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                 <i className="fa fa-lock text-gray-400"></i>
//               </span>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 placeholder="New Password"
//                 required
//                 value={password}
//                 onChange={handleChange}
//                 className="w-full h-10 pl-10 pr-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               />
//               <span className="absolute right-3 top-2 cursor-pointer" onClick={togglePasswordVisibility}>
//                 {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//               </span>
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-200"
//             >
//               {isSubmitting ? "Updating..." : "Update"}
//             </button>

//             <div className="text-center mt-4">
//               <span className="text-white">
//                 Already have an account?{" "}
//                 <Link className="text-blue-400 hover:text-blue-500" to="/login">
//                   Login
//                 </Link>
//               </span>
//             </div>
//           </form>
//         </div>
//       </div>

//       <div
//         className="hidden md:block w-1/2 bg-cover bg-center"
//         style={{ backgroundImage: "url('/images/bg6.jpg')" }}
//       ></div>
//     </div>
//   );
// }



