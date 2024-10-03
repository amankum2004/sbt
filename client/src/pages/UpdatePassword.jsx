import React from "react"; 
import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";

export default function UpdatePassword() {
  const [formData, setFormData] = useState({
    email: localStorage.getItem("forgotpassEmail") || "",
    password: "",
    otp: "",
  });

  const { email, password, otp } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post(`${SERVERIP}/api/auth/update`, formData);
      const res = await api.post(`/auth/update`, formData);
      if (res.data.success) {
        localStorage.removeItem("forgotpassEmail");
        Swal.fire({ title: "Success", text: "Password updated successfully", icon: "success" })
        navigate("/login");
      } else {
        console.error("failed to save");
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: "invalid otp", icon: "error" });
    }
  };

  // Check if forgotpassEmail exists in localStorage, if not, redirect to /forgot
  // if (!localStorage.getItem("forgotpassEmail")) {
  //   navigate("/forget");
  // }

  return (
  //   <div className="container-fluid">
	// 	<div className="row">
	// 		<div className="col-lg-6 col-md-6 form-container">
	// 			<div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
	// 				<div className="logo mt-5 mb-3">
	// 					<img src="/images/sbt logo md.svg"/>
	// 				</div>
	// 				<div className="heading mb-3">
	// 					<h4>Enter the new details here</h4>
	// 				</div>
	// 				<form onSubmit={handleSubmit}>
	// 					<div className="form-input">
	// 						<span><i className="fa fa-envelope"></i></span>
	// 						<input type="email"
  //               name="email"
  //               id="email"
  //               required
  //               autoComplete="off"
  //               value={email}
  //               onChange={handleChange}
  //               readOnly />
	// 					</div>
  //           <div className="form-input">
  //           <span><i className="fa fa-key"></i></span>
  //               <input
  //                 type="password"
  //                 id="otp"
  //                 name="otp"
  //                 required
  //                 value={otp}
  //                 placeholder="OTP"
  //                 onChange={handleChange}/>
                
  //             </div>
	// 					<div className="form-input" >
	// 						<span><i className="fa fa-lock"></i></span>
	// 						<input type="password"
  //               name="password"
  //               placeholder="New Password"
  //               id="password"
  //               required
  //               autoComplete="off"
  //               value={password}
  //               onChange={handleChange} />
	// 					</div>
  //                 <button
  //                   onClick={handleSubmit}
  //                   className="btn btn-secondary"
  //                   type="button" style={{marginBottom:"10px"}}>
  //                   Submit
  //                 </button>
  //                 <br />
  //                 <span className="text-white">
  //                   Already have an account --{" "}
  //                   <Link className="text-blue-600" to="/login">
  //                     Login
  //                   </Link>
  //                 </span>
	// 				</form>
	// 			</div>
	// 		</div>
	// 		<div className="col-lg-6 col-md-6 d-none d-md-block image-container"></div>
	// 	</div>
	// </div>

  <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto shadow-lg bg-white rounded-lg overflow-hidden">
    {/* Form Section */}
    <div className="w-full md:w-1/2 p-8">
      <div className="flex flex-col items-center mb-6">
        <img src="/images/sbt logo md.svg" alt="Logo" className="w-24 h-24" />
        <h4 className="text-xl font-semibold text-gray-700 mt-4">Enter the new details here</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1" htmlFor="email">
            Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3">
            <i className="fa fa-envelope text-gray-400"></i>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              readOnly
              required
              className="w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1" htmlFor="otp">
            OTP
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3">
            <i className="fa fa-key text-gray-400"></i>
            <input
              type="password"
              id="otp"
              name="otp"
              value={otp}
              required
              placeholder="OTP"
              onChange={handleChange}
              className="w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 mb-1" htmlFor="password">
            New Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3">
            <i className="fa fa-lock text-gray-400"></i>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              required
              placeholder="New Password"
              onChange={handleChange}
              className="w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          type="submit"
        >
          Submit
        </button>
        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
    <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg6.jpg')" }}></div>
  </div>
</div>
  );
}
