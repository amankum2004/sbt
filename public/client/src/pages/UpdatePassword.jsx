import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// import imageOne from "../images/forgotPassword.svg";
import { SERVERIP } from "../config";
import Swal from "sweetalert2";

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
      const res = await axios.post(`${SERVERIP}/api/auth/update`, formData);
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
  if (!localStorage.getItem("forgotpassEmail")) {
    navigate("/forget");
  }

  return (
    <div className="container-fluid">
		<div className="row">
			<div className="col-lg-6 col-md-6 form-container">
				<div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
					<div className="logo mt-5 mb-3">
						<img src="/images/sbt logo md.svg"/>
					</div>
					<div className="heading mb-3">
						<h4>Enter the new details here</h4>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="form-input">
							<span><i className="fa fa-envelope"></i></span>
							<input type="email"
                name="email"
                id="email"
                required
                autoComplete="off"
                value={email}
                onChange={handleChange}
                readOnly />
						</div>
            <div className="form-input">
            <span><i className="fa fa-key"></i></span>
                <input
                  type="password"
                  id="otp"
                  name="otp"
                  required
                  value={otp}
                  placeholder="OTP"
                  onChange={handleChange}/>
                
              </div>
						<div className="form-input" >
							<span><i className="fa fa-lock"></i></span>
							<input type="password"
                name="password"
                placeholder="New Password"
                id="password"
                required
                autoComplete="off"
                value={password}
                onChange={handleChange} />
						</div>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-secondary"
                    type="button" style={{marginBottom:"10px"}}>
                    Submit
                  </button>
                  <br />
                  <span className="text-white">
                    Already have an account --{" "}
                    <Link className="text-blue-600" to="/login">
                      Login
                    </Link>
                  </span>
					</form>
				</div>
			</div>
			<div className="col-lg-6 col-md-6 d-none d-md-block image-container"></div>
		</div>
	</div>
  );
}
