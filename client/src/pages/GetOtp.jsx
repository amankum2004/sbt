import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
import { api } from "../utils/api";
// import { SERVERIP } from "../config";
import Swal from "sweetalert2";

export default function GetOTP() {
  // const [formData, setFormData] = useState({
  //   email: "",
  // });
  // const { email } = formData;

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const navigate = useNavigate();

  // const handleChange = (e) => {
  //   setFormData({ 
  //     ...formData, 
  //     [e.target.name]: e.target.value 
  //   });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !/^[a-zA-Z0-9._%+-]+@(gmail.com|.*\.gmail.com)$/.test(email)
    ) {
      setEmail('')
      Swal.fire({
        title: 'Error',
        text: 'Invalid email id. Use valid mail id.',
        icon: 'error'
      })
      return setIsSubmitting(false)
    }
    setIsSubmitting(true)
    try {
        // const res = await axios.post(`${SERVERIP}/otp/user-otp`, {
        const res = await api.post(`/otp/user-otp`, {
          email
        });
        if (res.status === 200) {
          setIsSubmitting(false)
          navigate('/register', { state: { email } })
        }
        // if (res.status === 200) {
        //   setIsSubmitting(false);
        //   const sendOtpRes = await axios.post(`${SERVERIP}/otp/send-otp`, {
        //     email,
        //   });
        //   if (sendOtpRes.data.success){
        //     localStorage.setItem("getotpEmail", email); // Store email in local storage
        //     // localStorage.setItem("token", email); // Store email in local storage
        //     navigate("/register");
        //   } else {
        //     console.error("Failed to send");
        //   }
        // }
    } catch (err) {
        if (err.response.status === 401) {
          Swal.fire({
            title: "Error",
            text: "User already exists please login",
            icon: "error",
          })
          return setIsSubmitting(false)
        } else{
          Swal.fire({
            title: "Error",
            text: "Internal server error",
            icon: "error",
          });
        }
    }
    setIsSubmitting(false);
     
    
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
						<h1>Enter your Email</h1>
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
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting} 
                />
						</div>
					<Link
            className="col-6 text-right"
            to="/forget" style={{marginLeft:"320px",fontSize:"16px",color:"orange"}}>
            resend otp
          </Link>
          <br />
          <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-secondary"
              type="submit">
              {isSubmitting ? "Submitting ..." : "Submit"}
          </button>
          <div style={{marginTop:"40px",fontSize:"16px",fontWeight:"bold"}}>
                <span className="text-left mb-3">
                  Already have an account --{" "}
                  <Link className="text-blue-600" to="/login" style={{color:"white"}}>
                    Login
                  </Link>
                </span>
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
