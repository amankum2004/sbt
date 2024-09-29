import "./style.css"
import { useState , useEffect} from "react"
import {useNavigate} from "react-router-dom"
// import { useAuth } from "../store/auth";
import Swal from "sweetalert2";
import {toast} from "react-toastify";
import axios from "axios"


// const URL = "http://localhost:27017/api/auth/register"

export const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        phone: "",
        password: "",
        otp: "",
      });
    
      const [email, setEmail] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [showOTP, setShowOTP] = useState(false);
      const navigate = useNavigate();
    
      useEffect(() => {
        const storedEmail = localStorage.getItem("getotpEmail");
        if (storedEmail) {
          setEmail(storedEmail);
        }
      }, []);
    
      const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData({ 
          ...formData, 
          [name]: value 
        });
        
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post(`http://localhost:27017/api/auth/register`, {
            ...formData,
            email,
          });
          console.log(response);
          localStorage.setItem("signupEmail", email);
          localStorage.removeItem("getotpEmail");
          toast.success("Registration successful")
          navigate("/login");
        } catch (err) {
          Swal.fire({ title: "Error", text: "Email already registered", icon: "error" });
          console.error("Error occurred:", err);
        }
      };
    
      const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };
      const toggleOTPVisibility = () => {
        setShowOTP(!showOTP);
      };
    
      if (!localStorage.getItem("getotpEmail")) {
        navigate("/getOTP");
      }
    
      const { username, phone, password, otp } = formData;

    return (
        <>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
	<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
        <div className="container-fluid">
		<div className="row">
			<div className="col-lg-6 col-md-6 form-container">
				<div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
					{/* <div className="logo mt-5 mb-3">
						<img src="image/logo.png" width="150px"/>
					</div> */}
					<div className="heading mb-3">
						<h4>Create an account</h4>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="form-input">
							<span><i className="fa fa-user"></i></span>
							<input type="text"
                                    name="username"
                                    placeholder="Enter your name"
                                    id="username"
                                    required
                                    autoComplete="off"
                                    value={username}
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
                                    // readOnly
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
							<span><i className="fa fa-otp"></i></span>
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
									<input type="checkbox" className="custom-control-input" id="cb1"/>
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
	</div>
    </>
    )
}