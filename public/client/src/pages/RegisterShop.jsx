import "./RegisterShop.css"
import { useAuth } from "../store/auth"
import { useState } from "react"
import {useNavigate} from "react-router-dom"
import {toast} from "react-toastify"
import Swal from "sweetalert2"
// import axios from "axios"

const defaultRegisterShopData = {
        username:"",
        email:localStorage.getItem("signupEmail") || "",
        phone:"",
        password:"",
        shopname:"",
        state:"",
        district:"",
        city:"",
        street:"",
        pin:"",
        bankname:"",
        bankbranch:"",
        ifsc:"",
        micr:"",
        account:"",
        services: [{ service: '', price: '' }]
    };

export const RegisterShop = () => {
    const [formData, setFormData] = useState(defaultRegisterShopData);
    
    const [userData,setUserData] = useState(true);
    const {storeTokenInLS,API,user} = useAuth();
    const navigate = useNavigate();

    if (userData && user) {
        setFormData({
            username:user.username,
            email:user.email,
            phone:user.phone,
            password:"",
            shopname:"",
            state:"",
            district:"",
            city:"",
            street:"",
            pin:"",
            bankname:"",
            bankbranch:"",
            ifsc:"",
            micr:"",
            account:"",
            services: [{ service: '', price: '' }]
        });
        setUserData(false);
    }

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleServiceChange = (e, index) => {
        const updatedServices = formData.services.map((service, i) =>
          i === index ? { ...service, [e.target.name]: e.target.value } : service
        );
        setFormData({ ...formData, services: updatedServices });
    };
    
    const handleAddService = () => {
        setFormData({ ...formData, services: [...formData.services, { service: '', price: '' }] });
    };
    
    const handleRemoveService = (index) => {
        const updatedServices = formData.services.filter((service, i) => i !== index);
        setFormData({ ...formData, services: updatedServices });
    };


    // handling the form submission
    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    // alert(user)
    try{
        // const response = await fetch(URL,{
        const response = await fetch(`${API}/api/shop/registershop`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(formData)
        })
        // console.log(response)
        const res_data = await response.json();
        console.log("response from server",res_data.extraDetails);

        if (response.ok) {
            setFormData(defaultRegisterShopData);
            // STORE THE TOKEN IN LOCALHOST
            storeTokenInLS(res_data.token);
            // localStorage.setItem("token",res_data.token);
            // toast.success("Shop registration successful")
            Swal.fire({
                title: "Success",
                text: "Shop registration successful",
                icon: "success",
            });
            // navigate("/login")
            navigate("/")
        }else{
            toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message)
        }
    }catch (error) {
        console.log("registershop",error)
    }
    }

    return (
    <>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
	<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></link>
    <div className="container">
        <h2>Shop Registration</h2>
        <div className="title">Basic Details</div>
        <div className="content">
            <form onSubmit={handleSubmit} >
                <div className="user-details">
                    <div className="input-box">
                        <span className="details">Full Name</span>
                        <input type="text"
                                    name="username"
                                    placeholder="Shop owner name"
                                    id="username"
                                    required
                                    autoComplete="off"
                                    value={formData.username}
                                    onChange={handleInput} 
                                    readOnly/>
                    </div>
                    <div className="input-box">
                        <span className="details">Email</span>
                        <input type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    id="email"
                                    required
                                    autoComplete="off"
                                    readOnly
                                    value={formData.email}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Phone Number</span>
                        <input type="number"
                                    name="phone"
                                    placeholder="Enter your number"
                                    id="phone"
                                    required
                                    autoComplete="off"
                                    value={formData.phone}
                                    onChange={handleInput}
                                    readOnly />
                    </div>

                    <div className="input-box">
                        <span className="details">Saloon Name</span>
                        <input type="text"
                                    name="shopname"
                                    placeholder="Saloon Name"
                                    id="shopname"
                                    required
                                    autoComplete="off"
                                    value={formData.shopname}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">State</span>
                        <input type="text"
                                    name="state"
                                    placeholder="State"
                                    id="state"
                                    required
                                    autoComplete="off"
                                    value={formData.state}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">District</span>
                        <input type="text"
                                    name="district"
                                    placeholder="District"
                                    id="district"
                                    required
                                    autoComplete="off"
                                    value={formData.district}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">City</span>
                        <input type="text"
                                    name="city"
                                    placeholder="City"
                                    id="city"
                                    required
                                    autoComplete="off"
                                    value={formData.city}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Street</span>
                        <input type="text"
                                    name="street"
                                    placeholder="Street"
                                    id="street"
                                    required
                                    autoComplete="off"
                                    value={formData.street}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Pin Code</span>
                        <input type="number"
                                    name="pin"
                                    placeholder="Pin Code"
                                    id="pin"
                                    required
                                    autoComplete="off"
                                    value={formData.pin}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Password(created during registration)</span>
                        <input type="text"
                                    name="password"
                                    placeholder="password"
                                    id="password"
                                    required
                                    autoComplete="off"
                                    value={formData.password}
                                    onChange={handleInput} />
                    </div>
                </div>
            </form>
        </div>

        <div className="title">Bank Details</div>
        <div className="content">
            <form onSubmit={handleSubmit}>
                <div className="user-details">
                    <div className="input-box">
                        <span className="details">Bank Name</span>
                        <input type="text"
                                    name="bankname"
                                    placeholder="Bank Name"
                                    id="bankname"
                                    required
                                    autoComplete="off"
                                    value={formData.bankname}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Bank Branch</span>
                        <input type="text"
                                    name="bankbranch"
                                    placeholder="Bank Branch"
                                    id="bankbranch"
                                    required
                                    autoComplete="off"
                                    value={formData.bankbranch}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">IFSC Code</span>
                        <input type="text"
                                    name="ifsc"
                                    placeholder="IFSC Code"
                                    id="ifsc"
                                    required
                                    autoComplete="off"
                                    value={formData.ifsc}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">MICR Code</span>
                        <input type="text"
                                    name="micr"
                                    placeholder="MICR Code"
                                    id="micr"
                                    required
                                    autoComplete="off"
                                    value={formData.micr}
                                    onChange={handleInput} />
                    </div>
                    <div className="input-box">
                        <span className="details">Bank Account Number</span>
                        <input type="number"
                                    name="account"
                                    placeholder="Account Number"
                                    id="account"
                                    required
                                    autoComplete="off"
                                    value={formData.account}
                                    onChange={handleInput} />
                    </div>
                    
                </div>
            </form>
        </div>


        <div className="title">Services Details</div>
            <form onSubmit={handleSubmit} >
                <div className="container">
                    <h5>Services Provided by You</h5>
                {formData.services.map((service, index) => (
                <div key={index} className="service-input">
                    <input
                    type="text"
                    name="service"
                    placeholder="Service"
                    value={service.service}
                    onChange={(e) => handleServiceChange(e, index)}
                    required
                    />
                    <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={service.price}
                    onChange={(e) => handleServiceChange(e, index)}
                    required
                    />
                    <button type="button" onClick={() => handleRemoveService(index)}>Remove</button>
                </div>
                ))}
                <button type="button" onClick={handleAddService}>Add Service</button>

                {/* <button type="submit">Submit</button> */}

                <div className="button">
                    <input type="submit" value="Register"/>
                </div>
            </div>
        </form>
    </div>
    </>
    )

}