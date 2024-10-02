// import "../CSS/style.css"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
// import { useAuth } from "../store/auth";
import Swal from "sweetalert2";
// import axios from "axios"
import { api } from "../utils/api";
import React from "react"; 

export const Register = () => {
  const location = useLocation()
  const otpEmail = location.state?.email ?? ''
  const [formData, setFormData] = useState({
    name: '',
    email: otpEmail || '',
    phone: '',
    usertype: 'customer',
    password: '',
    otp: ''
  });

  // const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const storedEmail = localStorage.getItem("getotpEmail");
  //   if (storedEmail) {
  //     setEmail(storedEmail);
  //   }
  // }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true)
    if (
      !/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(formData.email)
    ) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid  email ID.',
        icon: 'error'
      })
      return
    }
    try {
      // const response = await axios.post(`http://localhost:8000/api/auth/register`, {
      //   ...formData,
      //   email,
      // });
      // console.log(response);
      // localStorage.setItem("signupEmail", email);
      // localStorage.removeItem("getotpEmail");
      // toast.success("Registration successful")
      // navigate("/login");
      const res = await api.post(`/auth/register`, { ...formData, email })
      console.log(res);
      if (res.status === 201) {
        Swal.fire({ title: "Success", text: "Registration successful", icon: "success" });
        return navigate('/login', { state: { email: formData.email } })
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "Email already registered", icon: "error" });
      setIsSubmitting(false)
      console.error("Error occurred:", err);
    } finally {
      setIsSubmitting(false)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleOTPVisibility = () => {
    setShowOTP(!showOTP);
  };

  // if (!localStorage.getItem("getotpEmail")) {
  //   navigate("/getOTP");
  // }

  const { name, email, phone, password, otp, usertype } = formData;

  return (
    <>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
      {/* <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 col-md-6 form-container">
            <div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
              <div className="logo mt-5 mb-3">
						<img src="image/logo.png" width="150px"/>
					</div>
              <div className="heading mb-3">
                <h4>Create an account</h4>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-input">
                  <span><i className="fa fa-user"></i></span>
                  <input type="text"
                    name="name"
                    placeholder="Enter your name"
                    id="name"
                    required
                    autoComplete="off"
                    value={name}
                    disabled={isSubmitting}
                    onChange={handleInput} />
                </div>
                <div className="form-input">
                  <span><i className="fa fa-envelope"></i></span>
                  <input type="email"
                    name="email"
                    placeholder="Enter your email"
                    id="email"
                    required
                    autoComplete="off"
                    value={email}
                    disabled={isSubmitting}
                    readOnly
                    onChange={handleInput} />
                </div>
                <div className="form-input">
                  <span><i className="fa fa-phone"></i></span>
                  <input type="number"
                    name="phone"
                    placeholder="Enter your number"
                    id="phone"
                    required
                    autoComplete="off"
                    value={phone}
                    onChange={handleInput} />
                </div>

                <div>
                  <label style={{color:"white"}}>User Type:</label>
                  <select
                    name="usertype"
                    value={usertype}
                    onChange={handleInput}
                    required
                    style={{marginRight:"190px"}}
                  >
                    <option value="customer">Customer</option>
                    <option value="shopOwner">Shop Owner</option>
                  </select>
                </div>

                <div className="form-input" onClick={togglePasswordVisibility}>
                  <span><i className="fa fa-lock"></i></span>
                  <input type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    id="password"
                    required
                    autoComplete="off"
                    value={password}
                    onChange={handleInput} />
                </div>
                <div className="form-input" onClick={toggleOTPVisibility}>
                  <span><i className="fa fa-key"></i></span>
                  <input type={showOTP ? "password" : "text"}
                    name="otp"
                    placeholder="OTP"
                    id="otp"
                    required
                    autoComplete="off"
                    value={otp}
                    onChange={handleInput} />
                </div>
                <div className="row mb-3">
                  <div className="col-12 d-flex">
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="cb1" />
                      <label className="custom-control-label text-white" htmlFor="cb1">I agree all terms & conditions</label>
                    </div>
                  </div>
                </div>
                <div className="text-left mb-3">
                  <button type="submit" className="btn">Register</button>
                </div>
                <div className="text-white mb-3">or register with</div>
                <div className="row mb-3">
                  <div className="col-4">
                    <a href="https://www.facebook.com/" className="btn btn-block btn-social btn-facebook">
                      <i className="fa fa-facebook"></i>
                    </a>
                  </div>
                  <div className="col-4">
                    <a href="https://www.google.com/" className="btn btn-block btn-social btn-google">
                      <i className="fa fa-google"></i>
                    </a>
                  </div>
                  <div className="col-4">
                    <a href="https://twitter.com/" className="btn btn-block btn-social btn-twitter">
                      <i className="fa fa-twitter"></i>
                    </a>
                  </div>
                </div>
                <div className="text-white">Already have an account ?
                  <a href="/login" className="login-link"> Login here</a>
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 d-none d-md-block image-container"></div>
        </div>
      </div> */}
{/* 
<div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96">
        <h4 className="text-2xl font-semibold text-center mb-6">Create an account</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="border rounded-lg py-2 px-3 w-full"
              required
              autoComplete="off"
              value={name}
              disabled={isSubmitting}
              onChange={handleInput}
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border rounded-lg py-2 px-3 w-full"
              required
              autoComplete="off"
              value={email}
              disabled={isSubmitting}
              readOnly
              onChange={handleInput}
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              name="phone"
              placeholder="Enter your number"
              className="border rounded-lg py-2 px-3 w-full"
              required
              autoComplete="off"
              value={phone}
              onChange={handleInput}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-gray-700">User Type:</label>
            <select
              name="usertype"
              value={usertype}
              onChange={handleInput}
              required
              className="border rounded-lg py-2 px-3 w-full"
            >
              <option value="customer">Customer</option>
              <option value="shopOwner">Shop Owner</option>
            </select>
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="border rounded-lg py-2 px-3 w-full"
              required
              autoComplete="off"
              value={password}
              onChange={handleInput}
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '👁️' : '🙈'}
            </span>
          </div>

          <div className="mb-4 relative">
            <input
              type={showOTP ? "text" : "password"}
              name="otp"
              placeholder="OTP"
              className="border rounded-lg py-2 px-3 w-full"
              required
              autoComplete="off"
              value={otp}
              onChange={handleInput}
            />
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={toggleOTPVisibility}
            >
              {showOTP ? '👁️' : '🙈'}
            </span>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-600 transition duration-200"
            disabled={isSubmitting}
          >
            Register
          </button>
          <div className="text-center text-gray-500 my-3">or register with</div>
          <div className="flex justify-center space-x-4 mb-4">
            <a href="https://www.facebook.com/" className="bg-blue-600 text-white  py-2 px-3 rounded-full hover:bg-blue-700 transition duration-200">
              <i className="fa fa-facebook"></i>
            </a>
            <a href="https://www.google.com/" className="bg-red-600 text-white py-2 px-3 rounded-full hover:bg-red-700 transition duration-200">
              <i className="fa fa-google"></i>
            </a>
            <a href="https://twitter.com/" className="bg-blue-400 text-white py-2 px-3 rounded-full hover:bg-blue-500 transition duration-200">
              <i className="fa fa-twitter"></i>
            </a>
          </div>
          <div className="text-center text-gray-700">
            Already have an account? 
            <a href="/login" className="text-blue-500"> Login here</a>
          </div>
        </form>
      </div>
    </div> */}


<div className="container-fluid  flex">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-800">
        <div className="w-full max-w-md p-3 bg-gray-700 rounded-lg shadow-lg">
          <div className="logo mb-1 text-center">
            <img src="/images/sbt logo md.svg" alt="Logo" className="mx-auto" />
          </div>
          <h1 className="text-white text-2xl font-bold text-center mb-3">Create your account</h1>
          {/* <h4 className="text-gray-300 text-center mb-5">Create your account</h4> */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-user text-gray-400"></i>
              </span>
              <input
                type="text"
                placeholder="Enter your name"
                name="name"
                required
                autoComplete="off"
                value={name}
                onChange={handleInput}
                disabled={isSubmitting}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-envelope text-gray-400"></i>
              </span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                autoComplete="off"
                value={email}
                disabled={isSubmitting}
                readOnly
                onChange={handleInput}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-phone text-gray-400"></i>
              </span>
              <input
                type="number"
                name="phone"
                placeholder="Enter your number"
                required
                autoComplete="off"
                value={phone}
                onChange={handleInput}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">User Type:</label>
              <select
                name="usertype"
                value={usertype}
                onChange={handleInput}
                required
                className="block w-full h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              >
                <option value="customer">Customer</option>
                <option value="shopOwner">Shop Owner</option>
              </select>
            </div>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-lock text-gray-400"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                autoComplete="off"
                value={password}
                onChange={handleInput}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
            <div className="mb-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fa fa-key text-gray-400"></i>
              </span>
              <input
                type={showOTP ? "text" : "password"}
                name="otp"
                placeholder="OTP"
                required
                autoComplete="off"
                value={otp}
                onChange={handleInput}
                className="block w-full pl-10 h-10 border border-transparent rounded-lg bg-white focus:outline-none focus:border-red-600"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer"
                onClick={toggleOTPVisibility}
              >
                {showOTP ? '👁️' : '🙈'}
              </span>
            </div>
            <div className="mb-4">
              <button
                disabled={isSubmitting}
                className="w-full h-10 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition duration-200"
              >
                Register
              </button>
            </div>
            {/* <div className="text-center text-gray-500 my-3">or register with</div>
            <div className="flex justify-center space-x-4 mb-4">
              <a href="https://www.facebook.com/" className="bg-blue-600 text-white py-2 px-3 rounded-full hover:bg-blue-700 transition duration-200">
                <i className="fa fa-facebook"></i>
              </a>
              <a href="https://www.google.com/" className="bg-red-600 text-white py-2 px-3 rounded-full hover:bg-red-700 transition duration-200">
                <i className="fa fa-google"></i>
              </a>
              <a href="https://twitter.com/" className="bg-blue-400 text-white py-2 px-3 rounded-full hover:bg-blue-500 transition duration-200">
                <i className="fa fa-twitter"></i>
              </a>
            </div> */}
            <div className="text-center text-gray-300">
              Already have an account? 
              <a href="/login" className="text-blue-500"> Login here</a>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
    </div>
    </>
  )
}