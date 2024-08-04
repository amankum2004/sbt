// import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { SERVERIP } from "../config";
import Swal from "sweetalert2";

export default function Forget() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { email } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${SERVERIP}/otp/user-otp1`, {
        email,
      });
      if (res.status === 200) {
        setIsSubmitting(true);
        const res1 = await axios.post(`${SERVERIP}/otp/send-otp-forgot`,formData);
        if (res1.data.success) {
          localStorage.setItem("forgotpassEmail", formData.email); // Store email in local storage
          navigate("/update");
        } 
        // else{}
      }
    } catch (err) {
      if (err.response.status === 401) {
        Swal.fire({ title: "Error", text: "User does not exist please sign up", icon: "error" });
      } else if (err.response.status === 500) {
        Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
    <div className="container-fluid">
		<div className="row">
			<div className="col-lg-6 col-md-6 form-container">
				<div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
					<div className="logo mt-5 mb-3">
						<img src="/images/sbt logo md.svg"/>
					</div>
					<div className="heading mb-3">
						<h4>Reset your password</h4>
						<h6>Enter email to recieve OTP</h6>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="form-input">
							<span><i className="fa fa-envelope"></i></span>
							<input
                type="email"
                id="email"
                name="email"
                className="border w-full rounded-2xl text-center max-sm:text-sm"
                placeholder="Enter your email"
                required
                value={email}
                onChange={handleChange}
                disabled={isSubmitting}
                />
						</div>

                <Link
                  className="col-6 text-right"
                  to="/forget">
                  resend otp
                </Link>
                <br />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-secondary "
                  type="button"
                >
                  {isSubmitting ? "Submitting ..." : "Submit"}
                </button>
                <br />
                <span className="text-left mb-3">
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
    </>
    
  );
}
