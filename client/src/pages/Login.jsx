// // import "../CSS/style.css"
// import { useState, useEffect } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import { api } from '../utils/api'
// // import axios from "axios"
// import React from "react";
// import { useLogin } from "../components/LoginContext";
// import Swal from "sweetalert2";

// const Login = () => {
//   const { loggedIn, login } = useLogin()
//   const [, setClicked] = useState("");
//   const [formData, setFormData] = useState({
//     email: localStorage.getItem("signupEmail") || "",
//     password: "",
//   });
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const togglePasswordVisibility = () => {
//     setShowPassword((prevState) => !prevState);
//   };

//   useEffect(() => {
//     // Check if token exists in local storage on component mount
//     const token = localStorage.getItem("token");
//     if (token) {
//       loggedIn; // Update login status in context if token exists
//       navigate("/"); // Redirect to form if already logged in
//     }
//   }, [loggedIn, navigate]);

//   const handleInput = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true)
//     try {
//       const response = await api.post('/auth/login', ...formData)
//       if (response.status === 200) {
//         login(response.data)
//       }
//     } catch (err) {
//       if (err.response.status === 404) {
//         Swal.fire({ title: "Error", text: "User not found", icon: "error" });
//         setIsSubmitting(false)
//       } else if (err.response.status === 401) {
//         Swal.fire({ title: "Error", text: "Email or password is wrong", icon: "error" });
//         setIsSubmitting(false)
//       } else {
//         Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
//         console.log(err)
//         setIsSubmitting(false)
//       }

//     }
//   };

//   useEffect(() => {
//     onkeydown = async (e) => {
//       if (e.key === "Enter") {
//         setClicked(() => true);
//         await handleSubmit({ formData });
//         navigate("/login");
//       }
//     };
//   }, [formData, navigate]);

//   return (
//     <>
//       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
//       <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
//       <div className="container-fluid h-1500 flex">
//         <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
//           <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg">
//             <div className="logo mb-3 text-center">
//               <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
//             </div>
//             <h1 className="text-white text-2xl font-bold text-center mb-1">Login</h1>
//             <h4 className="text-gray-300 text-center mb-4">Please enter your credentials</h4>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4 relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <i className="fa fa-envelope text-gray-400"></i>
//                 </span>
//                 <input type="email"
//                   className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//                   name="email"
//                   placeholder="Enter your email"
//                   id="email"
//                   required
//                   disabled={isSubmitting}
//                   autoComplete="off"
//                   value={formData.email}
//                   onChange={handleInput} />
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
//                   id="password"
//                   required
//                   autoComplete="off"
//                   value={formData.password}
//                   onChange={handleInput} />
//                 <span
//                   className="absolute right-3 top-2 cursor-pointer"
//                   onClick={togglePasswordVisibility}
//                 >
//                   {showPassword ? '👁️' : '🙈'}
//                 </span>
//               </div>
//               <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
//                 Forgot password?
//               </Link>
//               <button
//                 className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={async () => {
//                   setClicked(() => true);
//                   await handleSubmit({ formData });
//                 }}>Login
//               </button>
//               <div className="mt-3 text-center">
//                 <span className="text-gray-300 text-sm">
//                   Don't have an account?{" "}
//                   <Link className="text-blue-500" to="/getOTP">
//                     Register
//                   </Link>
//                 </span>
//               </div>
//             </form>
//           </div>
//         </div>
//         <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
//       </div>
//     </>
//   )
// }

// export default Login;



import "../CSS/style.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from '../utils/api';
import React from "react";
import { useLogin } from "../components/LoginContext";
import Swal from "sweetalert2";

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
      loggedIn; // Update login status in context if token exists
      navigate("/"); // Redirect to home if already logged in
    }
  }, [loggedIn, navigate]);

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent form submission
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', formData); // Corrected formData usage
      if (response.status === 200) {
        login(response.data);
      }
    } catch (err) {
      if (err.response.status === 404) {
        Swal.fire({ title: "Error", text: "User not found", icon: "error" });
      } else if (err.response.status === 401) {
        Swal.fire({ title: "Error", text: "Email or password is wrong", icon: "error" });
      } else {
        Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
      }
      setIsSubmitting(false);  // Reset submission state
    }
  };

  useEffect(() => {
    document.onkeydown = async (e) => {
      if (e.key === "Enter") {
        setClicked(true);
        await handleSubmit(e); // Corrected: pass the event
        navigate("/login");
      }
    };
  }, [formData, navigate]);

  return (
    <>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
      <div className="container-fluid h-1500 flex">
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
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
                <input type="email"
                  className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
                  name="email"
                  placeholder="Enter your email"
                  id="email"
                  required
                  disabled={isSubmitting}
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleInput} />
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
                  onChange={handleInput} />
                <span
                  className="absolute right-3 top-2 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '👁️' : '🙈'}
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
                  await handleSubmit(e); // Corrected: pass the event
                }}>{isSubmitting ? "LoggingIn..." : "Login"}
              </button>
              <div className="mt-3 text-center">
                <span className="text-gray-300 text-sm">
                  Don't have an account?{" "}
                  <Link className="text-blue-500" to="/getOTP">
                    Register
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
      </div>
    </>
  )
}

export default Login;
