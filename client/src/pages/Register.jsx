import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { FaEye, FaEyeSlash, FaCut, FaUser, FaEnvelope, FaPhoneAlt, FaUserTag, FaLock, FaKey } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const otpEmail = location.state?.email ?? "";

  useEffect(() => {
    if (!otpEmail) {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "Please verify your email first.",
      });
      navigate("/getOTP");
    }
  }, [otpEmail, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: otpEmail || "",
    phone: "",
    usertype: "customer",
    password: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { email } = formData;

    // Fixed email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid email address',
        icon: 'error'
      });
      return;
    }

    try {
      const res = await api.post("/auth/register", formData);
      if (res.status === 201) {
        Swal.fire({
          title: "Success",
          text: "Registration successful",
          icon: "success",
        });
        navigate("/login", { state: { email } });
      }
    } catch (err) {
      console.error("Registration Error:", err);
      Swal.fire({
        title: "Error",
        text: "Email/Phone already registered",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">

      {/* Background Icons */}
      <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
      <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

      <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-xl z-10">
        <h1 className="text-white text-2xl font-bold text-center mb-4">Create your account</h1>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="mb-4 relative">
            <FaUser className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              required
              autoComplete="off"
              value={formData.name}
              onChange={handleInput}
              disabled={isSubmitting}
              className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Email */}
          <div className="mb-4 relative">
            <FaEnvelope className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              readOnly
              className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
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
              value={formData.phone}
              onChange={handleInput}
              className="block w-full pl-10 pr-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
            />
          </div>

          {/* User Type */}
          <div className="mb-4 relative flex items-center gap-2">
            <FaUserTag className="text-gray-400 ml-1" />
            <label className="text-gray-400 font-semibold w-24">User Type:</label>
            <select
              name="usertype"
              value={formData.usertype}
              onChange={handleInput}
              required
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
              value={formData.password}
              onChange={handleInput}
              className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
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
              value={formData.otp}
              onChange={handleInput}
              className="block w-full pl-10 pr-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              onClick={() => setShowOTP(!showOTP)}
            >
              {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>
          <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
            Resend OTP
          </Link>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          <div className="text-center text-gray-300 mt-4">
            Already have an account?
            <a href="/login" className="text-blue-400 hover:underline ml-1">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};




// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Swal from "sweetalert2";
// import { api } from "../utils/api";
// import { FaEye, FaEyeSlash, FaCut } from "react-icons/fa";
// import { GiComb } from "react-icons/gi";

// export const Register = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const otpEmail = location.state?.email ?? '';

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

//     if (!/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(email)) {
//       Swal.fire({
//         title: "Error",
//         text: "Please enter a valid email ID.",
//         icon: "error",
//       });
//       setIsSubmitting(false);
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
//         text: "Email already registered",
//         icon: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">

//       {/* Background Icons */}
//       {/* Background Icons */}
//             <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
//             <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
//             <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
//             <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

//       <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-xl z-10">
//         {/* <div className="logo mb-1 text-center">
//           <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto h-20 w-15" />
//         </div> */}
//         <h1 className="text-white text-2xl font-bold text-center mb-4">Create your account</h1>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <input
//               type="text"
//               name="name"
//               placeholder="Enter your name"
//               required
//               autoComplete="off"
//               value={formData.name}
//               onChange={handleInput}
//               disabled={isSubmitting}
//               className="block w-full px-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//           </div>

//           <div className="mb-4">
//             <input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               required
//               value={formData.email}
//               readOnly
//               className="block w-full px-4 h-10 border border-transparent rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
//             />
//           </div>

//           <div className="mb-4">
//             <input
//               type="number"
//               name="phone"
//               placeholder="Enter your mobile number"
//               required
//               autoComplete="off"
//               value={formData.phone}
//               onChange={handleInput}
//               className="block w-full px-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//           </div>

//           <div className="mb-4 flex items-center gap-2">
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

//           <div className="mb-4 relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               required
//               value={formData.password}
//               onChange={handleInput}
//               className="block w-full px-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//             <span
//               className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           <div className="mb-4 relative">
//             <input
//               type={showOTP ? "text" : "password"}
//               name="otp"
//               placeholder="OTP"
//               required
//               value={formData.otp}
//               onChange={handleInput}
//               className="block w-full px-4 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//             />
//             <span
//               className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
//               onClick={() => setShowOTP(!showOTP)}
//             >
//               {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//           >
//             {isSubmitting ? "Registering..." : "Register"}
//           </button>

//           <div className="text-center text-gray-300 mt-4">
//             Already have an account?
//             <a href="/login" className="text-blue-400 hover:underline ml-1">Login here</a>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };





// import React from "react";
// import { useState } from "react"
// import { useNavigate, useLocation } from "react-router-dom"
// import Swal from "sweetalert2";
// import { api } from "../utils/api";
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// export const Register = () => {
//   const location = useLocation()
//   const otpEmail = location.state?.email ?? ''
//   const [formData, setFormData] = useState({
//     name: '',
//     email: otpEmail || '',
//     phone: '',
//     usertype: 'customer',
//     password: '',
//     otp: ''
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showOTP, setShowOTP] = useState(false);
//   const navigate = useNavigate();

//   const handleInput = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });

//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true)
//     if (
//       !/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(formData.email)
//     ) {
//       Swal.fire({
//         title: 'Error',
//         text: 'Please enter a valid  email ID.',
//         icon: 'error'
//       })
//       return
//     }
//     try {
//       const res = await api.post(`/auth/register`, { ...formData, email })
//       console.log(res);
//       if (res.status === 201) {
//         Swal.fire({ title: "Success", text: "Registration successful", icon: "success" });
//         return navigate('/login', { state: { email: formData.email } })
//       }
//     } catch (err) {
//       Swal.fire({ title: "Error", text: "Email already registered", icon: "error" });
//       setIsSubmitting(false)
//       console.error("Error occurred:", err);
//     } finally {
//       setIsSubmitting(false)
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };
//   const toggleOTPVisibility = () => {
//     setShowOTP(!showOTP);
//   };

//   // if (!localStorage.getItem("getotpEmail")) {
//   //   navigate("/getOTP");
//   // }

//   const { name, email, phone, password, otp, usertype } = formData;

//   return (
//     <>
//       <div className="min-h-screen flex flex-col md:flex-row">
//         <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800 ">
//           <div className="w-full max-w-md p-8 mt-2  bg-gray-700 rounded-lg shadow-lg">
//             <div className="logo mb-1 text-center">
//               <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto h-35 w-35" />
//             </div>
//             <h1 className="text-white text-2xl font-bold text-center mb-3">Create your account</h1>
//             {/* <h4 className="text-gray-300 text-center mb-5">Create your account</h4> */}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-user text-gray-400"></i>
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Enter your name"
//                   name="name"
//                   required
//                   autoComplete="off"
//                   value={name}
//                   onChange={handleInput}
//                   disabled={isSubmitting}
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                 />
//               </div>
//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-envelope text-gray-400"></i>
//                 </span>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   required
//                   autoComplete="off"
//                   value={email}
//                   disabled={isSubmitting}
//                   readOnly
//                   onChange={handleInput}
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                 />
//               </div>
//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-phone text-gray-400"></i>
//                 </span>
//                 <input
//                   type="number"
//                   name="phone"
//                   placeholder="Enter your mobile number"
//                   required
//                   autoComplete="off"
//                   value={phone}
//                   onChange={handleInput}
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                 />
//               </div>
//               <div className="mb-4 flex items-center gap-1">
//                 <label className="text-gray-400 font-bold w-20">User Type:</label>
//                 <select
//                   name="usertype"
//                   value={usertype}
//                   onChange={handleInput}
//                   required
//                   className="flex-1 h-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-red-600 px-3"
//                 >
//                   <option value="customer">Customer</option>
//                   <option value="shopOwner">Shop Owner</option>
//                 </select>
//               </div>


//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-lock text-gray-400"></i>
//                 </span>
//                 <input
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   placeholder="Password"
//                   required
//                   autoComplete="off"
//                   value={password}
//                   onChange={handleInput}
//                 />
//                 <span
//                   className="absolute right-3 top-2 cursor-pointer"
//                   onClick={togglePasswordVisibility}
//                 >
//                   {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//                 </span>
//               </div>

//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-key text-gray-400"></i>
//                 </span>
//                 <input
//                   type={showOTP ? "text" : "password"}
//                   name="otp"
//                   placeholder="OTP"
//                   required
//                   autoComplete="off"
//                   value={otp}
//                   onChange={handleInput}
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                 />
//                 <span
//                   className="absolute right-3 top-2 cursor-pointer"
//                   onClick={toggleOTPVisibility}
//                 >
//                   {showOTP ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//                 </span>
//               </div>

//               <div className="mb-4">
//                 <button
//                   disabled={isSubmitting}
//                   className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-200"
//                 >
//                   Register
//                 </button>
//               </div>
//               {/* <div className="text-center text-gray-500 my-3">or register with</div>
//             <div className="flex justify-center space-x-4 mb-4">
//               <a href="https://www.facebook.com/" className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-200">
//                 <i className="fa fa-facebook"></i>
//               </a>
//               <a href="https://www.google.com/" className="bg-red-600 text-white py-2 px-3 rounded-full hover:bg-red-700 transition duration-200">
//                 <i className="fa fa-google"></i>
//               </a>
//               <a href="https://twitter.com/" className="bg-blue-400 text-white py-2 px-3 rounded-full hover:bg-blue-500 transition duration-200">
//                 <i className="fa fa-twitter"></i>
//               </a>
//             </div> */}
//               <div className="text-center text-gray-300">
//                 Already have an account?
//                 <a href="/login" className="text-blue-500"> Login here</a>
//               </div>
//             </form>
//           </div>
//         </div>
//         <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
//       </div>
//     </>
//   )
// }