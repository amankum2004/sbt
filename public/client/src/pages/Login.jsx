import "./style.css"
import { useState , useEffect} from "react"
import {useNavigate} from "react-router-dom"
// import axios from "axios"
import { useAuth } from "../store/auth"
import {toast} from "react-toastify";
// import {SERVERIP} from "../config"
import Swal from "sweetalert2";

// const URL = "http://localhost:27017/api/auth/login"

const Login = () => {
    const {isLoggedIn} = useAuth();
    // eslint-disable-next-line no-unused-vars
    const [clicked, setClicked] = useState("");
    const [formData, setFormData] = useState({
        email: localStorage.getItem("signupEmail") || "",
        password: "",
    });
    const {storeTokenInLS, API} = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

  useEffect(() => {
    // Check if token exists in local storage on component mount
    const token = localStorage.getItem("token");
    if (token) {
      isLoggedIn; // Update login status in context if token exists
      navigate("/"); // Redirect to form if already logged in
    }
  }, [isLoggedIn, navigate]);

  const handleInput = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // e.preventDefault();
    try {
      const response = await fetch(`${API}/api/auth/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(formData)
    });
    console.log("from login form",response)
    console.log(response)
    const res_data = await response.json();

    if (response.ok) {
        console.log("response from server",res_data);
        storeTokenInLS(res_data.token);
        // localStorage.setItem("token",res_data.token);
        // setFormData({email:"",password:""})
        localStorage.setItem("loggedInUserEmail", formData.email);
        toast.success("Login successful")
        navigate("/")
    }else{
        toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message ? res_data.message : "Invalid credentials")
        console.log("Invalid credentials")
    }
    } catch (err) {
      // if (err.response.status === 404) {
      //   Swal.fire({ title: "Error", text: "User not found", icon: "error" });
      // } else if (err.response.status === 401) {
      //   Swal.fire({ title: "Error", text: "Email or password is wrong", icon: "error" });
      // }
      Swal.fire({ title: "Error", text: "Internal server error", icon: "error" });
      console.log(err)
    }
  };

  useEffect(() => {
    onkeydown = async (e) => {
      if (e.key === "Enter") {
        setClicked(() => true);
        await handleSubmit({ formData });
        navigate("/");
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, navigate]);

    return (
        <>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
	<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
  <div className="container-fluid">
		<div className="row">
			<div className="col-lg-6 col-md-6 form-container">
				<div className="col-lg-8 col-md-12 col-sm-9 col-xs-12 form-box text-center">
					<div className="logo mt-5 mb-3">
						<img src="/images/sbt logo md.svg"/>
					</div>
					<div className="heading mb-3">
						<h4>Login into your account</h4>
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
                value={formData.email}
                onChange={handleInput} />
						</div>
						<div className="form-input" onClick={togglePasswordVisibility}>
							<span><i className="fa fa-lock"></i></span>
							<input type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="password"
                  id="password"
                  required
                  autoComplete="off"
                  value={formData.password}
                  onChange={handleInput} />
						</div>
						<div className="row mb-3">
							<div className="col-6 d-flex">
								<div className="custom-control custom-checkbox">
									<input type="checkbox" className="custom-control-input" id="cb1"/>
									<label className="custom-control-label text-white" htmlFor="cb1">Remember me</label>
								</div>
							</div>
							<div className="col-6 text-right">
								<a href="/forget" className="forget-link">Forget password?</a>
							</div>
						</div>
            <button
                onClick={async () => {
                    setClicked(() => true);
                    await handleSubmit({ formData });
                }}                          
                className="btn btn-secondary"
                type="button">
                  Submit
            </button>
						{/* <div className="text-left mb-3">
							<button type="submit" className="btn">Login</button>
						</div> */}
						<div className="text-white mb-3">or login with</div>
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
						<div className="text-white">Do not have an account ? 
							<a href="/getOTP" className="register-link"> Register here</a>
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

export default Login;