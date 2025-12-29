import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from '../utils/api';
import { useLogin } from "../components/LoginContext";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaCut, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { GiComb } from "react-icons/gi";
import { useLoading } from "../components/Loading";

const Login = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { loggedIn, login, checkShopExists } = useLogin();
  const [, setClicked] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: localStorage.getItem("signupEmail") || "",
    phone: "",
    password: "",
    contactType: 'email'
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   console.log("Token on Login page load:", token);
  //   if (token) {
  //     loggedIn;
  //     navigate("/");
  //   }
  // }, [loggedIn, navigate]);

  // In Login.jsx, update the useEffect:
  // In Login.jsx, update the useEffect:
  useEffect(() => {
    console.log("Checking authentication...");
    
    // Check if we have JWT token AND user data
    const jwtToken = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('user_data');
    
    console.log("JWT token exists:", !!jwtToken);
    console.log("User data exists:", !!userData);
    
    // If we have both, user is authenticated
    if (jwtToken && userData) {
      console.log("✅ User is already authenticated");
      console.log("User data:", JSON.parse(userData));
      
      // Wait a moment then navigate (give LoginContext time to initialize)
      const timer = setTimeout(() => {
        console.log("Navigating to home page...");
        navigate("/", { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      console.log("❌ User needs to login");
      // Don't clear storage here - let LoginContext handle it
    }
  }, [navigate]);

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    setFormData(prev => ({
      ...prev,
      contactType: method,
      email: method === 'email' ? prev.email : '',
      phone: method === 'phone' ? prev.phone : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (loginMethod === 'email' && !formData.email) {
      Swal.fire({ title: "Error", text: "Email is required", icon: "error" });
      return;
    }

    if (loginMethod === 'phone' && !formData.phone) {
      Swal.fire({ title: "Error", text: "Phone number is required", icon: "error" });
      return;
    }

    if (!formData.password) {
      Swal.fire({ title: "Error", text: "Password is required", icon: "error" });
      return;
    }

    setIsSubmitting(true);
    showLoading('Verifying your details');

    try {
      const loginData = {
        password: formData.password,
        contactType: loginMethod,
        [loginMethod]: loginMethod === 'email' ? formData.email : formData.phone
      };

      const response = await api.post('/auth/login', loginData);
      console.log('Login response:', response.data);
      hideLoading();

      // Handle successful login
      if (response.data.success) {
        // ✅ Store the JWT token string
        if (response.data.token) {
          localStorage.setItem('jwt_token', response.data.token);
          console.log('✅ JWT token stored:', response.data.token.substring(0, 20) + '...');
        }
        
        // ✅ Store user data separately
        if (response.data.user) {
          localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        
        // Call your client-side login function
        await login(response.data.user);
        
        Swal.fire({
          title: "Success",
          text: response.data.message || "Login successful!",
          icon: "success",
          timer: 1500
        }).then(() => {
          navigate("/");
        });
      } else {
        // Handle cases where success is false in the response
        Swal.fire({ 
          title: "Error", 
          text: response.data.error || "Login failed", 
          icon: "error" 
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      hideLoading();
      console.error('Login error:', err);

      // FIXED ERROR HANDLING - Handle interceptor errors
      if (err.message === 'config is not defined') {
        // This is an interceptor error, not a backend error
        console.error('Interceptor configuration error - trying to continue...');
        
        // Try to get the original error
        if (err.originalError?.response) {
          const errorData = err.originalError.response.data;
          if (errorData.error) {
            Swal.fire({ 
              title: "Error", 
              text: errorData.error, 
              icon: "error" 
            });
          }
        } else {
          Swal.fire({ 
            title: "Login Error", 
            text: "An unexpected error occurred. Please try again.", 
            icon: "error" 
          });
        }
        
        setIsSubmitting(false);
        return;
      }
      
      // Your existing error handling for normal errors
      if (err.response && err.response.data) {
        // The backend returned an error response
        const errorData = err.response.data;
        
        if (errorData.error) {
          Swal.fire({ 
            title: "Error", 
            text: errorData.error, 
            icon: "error" 
          });
        } else {
          if (err.response.status === 404) {
            Swal.fire({ title: "Error", text: "User not found", icon: "error" });
          } else if (err.response.status === 401) {
            Swal.fire({ title: "Error", text: "Invalid credentials", icon: "error" });
          } else if (err.response.status === 400) {
            Swal.fire({ title: "Error", text: "Validation error", icon: "error" });
          } else {
            Swal.fire({ title: "Error", text: "An error occurred", icon: "error" });
          }
        }
      } else {
        Swal.fire({ 
          title: "Error", 
          text: "Network error. Please check your connection.", 
          icon: "error" 
        });
      }
      
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.onkeydown = async (e) => {
      if (e.key === "Enter") {
        setClicked(true);
        await handleSubmit(e);
      }
    };
  }, [formData, loginMethod]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Icons */}
      <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
      <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
      <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

      {/* Login Form Container */}
      <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg z-10">
        <div className="logo mb-3 text-center">
          <img src="/images/salonHub-logo.svg" alt="Logo" className="mx-auto w-20 rounded-full" />
        </div>
        <h1 className="text-white text-2xl font-bold text-center mb-1">Login</h1>
        <h4 className="text-gray-300 text-center mb-4">Please enter your details</h4>

        {/* Login Method Selector */}
        <div className="flex mb-6 bg-gray-600 rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleLoginMethodChange('email')}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${loginMethod === 'email'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white'
              }`}
          >
            <FaEnvelope className="inline mr-2" />
            Email
          </button>
          <button
            type="button"
            onClick={() => handleLoginMethodChange('phone')}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${loginMethod === 'phone'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-300 hover:text-white'
              }`}
          >
            <FaPhoneAlt className="inline mr-2" />
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email or Phone Input */}
          <div className="mb-4 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {loginMethod === 'email' ? (
                <FaEnvelope className="text-gray-400" />
              ) : (
                <FaPhoneAlt className="text-gray-400" />
              )}
            </span>
            <input
              type={loginMethod === 'email' ? 'email' : 'tel'}
              className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-blue-600"
              name={loginMethod}
              placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
              required
              disabled={isSubmitting}
              value={formData[loginMethod]}
              autoComplete="off"
              onChange={handleInput}
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fa fa-lock text-gray-400"></i>
            </span>
            <input
              className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-blue-600"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              autoComplete="off"
              value={formData.password}
              onChange={handleInput}
              disabled={isSubmitting}
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-gray-600"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>

          <Link to="/updatePassword" className="text-orange-400 text-sm mb-3 block text-right">
            Forgot password?
          </Link>

          <button
            className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Login"}
          </button>

          <div className="mt-3 text-center">
            <span className="text-gray-300">
              Don&apos;t have an account?{" "}
              <Link className="text-blue-500 hover:underline" to="/register">
                Register
              </Link>
            </span>
          </div>

        {/* Add this button temporarily for testing */}
{/* <button 
  onClick={() => {
    localStorage.clear();
    console.log('🗑️ Cleared all localStorage');
    window.location.reload();
  }}
  className="fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg z-50"
>
  Clear Storage & Refresh
</button> */}

          {/* Helper Text */}
          <div className="mt-3 text-center">
            <span className="text-gray-400 text-xs">
              {loginMethod === 'phone'
                ? 'Enter your registered phone number'
                : 'Enter your registered email address'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;


// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { api } from '../utils/api';
// import { useLogin } from "../components/LoginContext";
// import Swal from "sweetalert2";
// import { FaEye, FaEyeSlash, FaCut } from "react-icons/fa";
// import { GiComb } from "react-icons/gi";
// import { useLoading } from "../components/Loading";

// const Login = () => {
//   const { showLoading, hideLoading } = useLoading();
//   const { loggedIn, login } = useLogin();
//   const [, setClicked] = useState("");
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     email: localStorage.getItem("signupEmail") || "",
//     password: "",
//   });

//   const togglePasswordVisibility = () => {
//     setShowPassword((prevState) => !prevState);
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       loggedIn;
//       navigate("/");
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
//     setIsSubmitting(true);
//     showLoading('Verifying your details');
//   //   Swal.fire({
//   //   title: 'Please wait...',
//   //   text: 'Verifying your credentials',
//   //   allowOutsideClick: false,
//   //   didOpen: () => {
//   //     Swal.showLoading();
//   //   }
//   // });

//     try {
//       const response = await api.post('/auth/login', formData);
//       hideLoading();
//       if (response.status === 200) {
//         // Swal.close();
//         login(response.data);
//       }
//     } catch (err) {
//       hideLoading();
//       // Swal.close();
//       if (err.response?.status === 404) {
//         Swal.fire({ title: "Error", text: "User not found", icon: "error" });
//       } else if (err.response?.status === 401) {
//         Swal.fire({ title: "Error", text: "Email or password is wrong", icon: "error" });
//       } else {
//         Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
//       }
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     document.onkeydown = async (e) => {
//       if (e.key === "Enter") {
//         setClicked(true);
//         await handleSubmit(e);
//         navigate("/login");
//       }
//     };
//   }, [formData, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
//       {/* Background Icons */}
//       <FaCut className="text-white text-[100px] opacity-10 absolute top-10 left-10 rotate-12" />
//       <GiComb className="text-white text-[100px] opacity-10 absolute bottom-10 right-10 -rotate-12" />
//       <GiComb className="text-white text-[100px] opacity-10 absolute top-20 right-1/4 rotate-45" />
//       <FaCut className="text-white text-[100px] opacity-10 absolute bottom-20 left-1/4 -rotate-45" />

//       {/* Login Form Container */}
//       <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-lg z-10">
//         <div className="logo mb-3 text-center">
//           <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto w-20" />
//         </div>
//         <h1 className="text-white text-2xl font-bold text-center mb-1">Login</h1>
//         <h4 className="text-gray-300 text-center mb-4">Please enter your credentials</h4>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4 relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <i className="fa fa-envelope text-gray-400"></i>
//             </span>
//             <input
//               type="email"
//               className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               name="email"
//               placeholder="Enter your email"
//               id="email"
//               required
//               disabled={isSubmitting}
//               value={formData.email}
//               autoComplete="off"
//               onChange={handleInput}
//             />
//           </div>

//           <div className="mb-4 relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <i className="fa fa-lock text-gray-400"></i>
//             </span>
//             <input
//               className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               id="password"
//               required
//               autoComplete="off"
//               value={formData.password}
//               onChange={handleInput}
//             />
//             <span
//               className="absolute right-3 top-2 cursor-pointer text-gray-600"
//               onClick={togglePasswordVisibility}
//             >
//               {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
//             </span>
//           </div>

//           <Link to="/forget" className="text-orange-400 text-sm mb-3 block text-right">
//             Forgot password?
//           </Link>

//           <button
//             className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-300"
//             type="button"
//             disabled={isSubmitting}
//             onClick={async (e) => {
//               setClicked(true);
//               await handleSubmit(e);
//             }}
//           >
//             {isSubmitting ? "Logging In..." : "Login"}
//           </button>

//           <div className="mt-3 text-center">
//             <span className="text-gray-300 text-sm">
//               Don&apos;t have an account?{" "}
//               <Link className="text-blue-500" to="/getOTP">
//                 Register
//               </Link>
//             </span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

