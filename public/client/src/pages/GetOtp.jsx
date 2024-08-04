import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// import imgone from "/images/otpimg.svg";
import { SERVERIP } from "../config";
import Swal from "sweetalert2";

export default function GetOTP() {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const { email } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const res = await axios.post(`${SERVERIP}/otp/user-otp`, {
          email,
        });
        if (res.status === 200) {
          setIsSubmitting(true);
          const sendOtpRes = await axios.post(`${SERVERIP}/otp/send-otp`, {
            email,
          });
          if (sendOtpRes.data.success){
            localStorage.setItem("getotpEmail", email); // Store email in local storage
            // localStorage.setItem("token", email); // Store email in local storage
            navigate("/register");
          } else {
            console.error("Failed to send");
          }
        }
    } catch (err) {
        if (err.response.status === 401) {
          Swal.fire({
            title: "Error",
            text: "User already exists please login",
            icon: "error",
          });
        } else if (err.response.status === 500) {
          Swal.fire({
            title: "Error",
            text: "Internal server error",
            icon: "error",
          });
        }
    }finally {
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
						<img src="/images/sbt logo sm.jpg"/>
					</div>
					<div className="heading mb-3">
						<h2>Enter your Email</h2>
					</div>
					<div className="heading mb-3">
						<h4>Please verify email to continue</h4>
					</div>
				<form onSubmit={handleSubmit}>
						<div className="form-input">
							<span><i className="fa fa-envelope"></i></span>
							<input type="email"
                name="email"
                placeholder="Enter your email"
                id="email"
                required
                autoComplete="off"
                value={email}
                onChange={handleChange}
                disabled={isSubmitting} 
                />
						</div>
					<Link
            className=""
            to="/forget">
            resend otp
          </Link>
          <br />
          <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-secondary"
              type="button">
              {isSubmitting ? "Submitting ..." : "Submit"}
          </button>
          {/* <span className="form-text border-t-2 w-4/5 text-center mt-2 pt-2">
            Already have an account --{" "}
            <Link className="text-blue-600" to="/login">
                Login
            </Link>
          </span> */}
          <div className="text-white">Already have an account ?
							<a href="/login" className="text-blue-600"> Login here</a>
					</div>
        </form>
    </div>
    </div>
    <div className="col-lg-6 col-md-6 d-none d-md-block image-container"></div>
		</div>
	</div>
    </>

  );
}
