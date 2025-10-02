import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { FaCut } from "react-icons/fa";
import { GiComb } from "react-icons/gi";

export default function GetOTP() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    setIsSubmitting(true);
    try {
      const res = await api.post(`/otp/user-otp`, { email });
      if (res.status === 200) {
        setIsSubmitting(false);
        navigate('/register', { state: { email } });
      }
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
          text: "Internal server error",
          icon: "error",
        });
      }
      setIsSubmitting(false);
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
          <img src="/images/salonify-logo.svg" alt="Logo" className="mx-auto w-20 rounded-full" />
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
  );
}



// import React from "react";
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";

// export default function GetOTP() {
//   const [email, setEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(email)) {
//       setEmail('');
//       Swal.fire({
//         title: 'Error',
//         text: 'Invalid email id. Use valid mail id.',
//         icon: 'error'
//       });
//       return setIsSubmitting(false);
//     }

//     setIsSubmitting(true);
//     try {
//       const res = await api.post(`/otp/user-otp`, { email });
//       if (res.status === 200) {
//         setIsSubmitting(false);
//         navigate('/register', { state: { email } });
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         Swal.fire({
//           title: "Error",
//           text: "User already exists please login",
//           icon: "error",
//         });
//       } else {
//         Swal.fire({
//           title: "Error",
//           text: "Internal server error",
//           icon: "error",
//         });
//       }
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex flex-col md:flex-row m-0 p-0 overflow-hidden">
//       {/* Left Side: Form */}
//       <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800 p-4">
//         <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
//           <div className="logo mb-3 text-center">
//             <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
//           </div>
//           <h1 className="text-white text-2xl font-bold text-center mb-3">Enter your Email</h1>
//           <h4 className="text-gray-300 text-center mb-5">Please verify email to continue</h4>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-4 relative">
//               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                 <i className="fa fa-envelope text-gray-400"></i>
//               </span>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 id="email"
//                 required
//                 autoComplete="off"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={isSubmitting}
//                 className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               />
//             </div>
//             <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
//               Resend OTP
//             </Link>
//             <button
//               disabled={isSubmitting}
//               className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//               type="submit"
//             >
//               {isSubmitting ? "Submitting..." : "Submit"}
//             </button>
//             <div className="mt-5 text-center">
//               <span className="text-gray-300 text-sm">
//                 Already have an account?{" "}
//                 <Link className="text-blue-500" to="/login">
//                   Login
//                 </Link>
//               </span>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Right Side: Background Image */}
//       <div
//         className="hidden md:block w-1/2 h-screen bg-cover bg-center"
//         style={{ backgroundImage: "url('/images/bg6.jpg')" }}
//       ></div>
//     </div>
//   );
// }


