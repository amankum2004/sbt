import "../CSS/RegisterShop.css"
// import { useAuth } from "../store/auth"
import { useLogin } from "../components/LoginContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
// import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { api } from "../utils/api"
// import axios from "axios"
const token = JSON.parse(localStorage.getItem('token'))

const defaultRegisterShopData = {
    name: "",
    email: localStorage.getItem("signupEmail") || "",
    phone: "",
    password: "",
    shopname: "",
    state: "",
    district: "",
    city: "",
    street: "",
    pin: "",
    bankname: "",
    bankbranch: "",
    ifsc: "",
    micr: "",
    account: "",
    services: [{ service: '', price: '' }]
};

const stateDistrictCityData = {
    "Andaman and Nicobar Islands": {
        "Nicobars": ["CityA", "CityB"],
        "North And Middle Andaman": ["CityC", "CityD"],
        "South Andamans": ["CityE", "CityF"]
    },
    "Arunachal Pradesh": {
        "DistrictA": ["CityA", "CityB"],
        "DistrictB": ["CityC", "CityD"],
        "DistrictC": ["CityE", "CityF"]
    },
    "Bihar": {
        "DistrictA": ["CityA", "CityB"],
        "DistrictB": ["CityC", "CityD"],
        "DistrictC": ["CityE", "CityF"]
    },
    "Chhattisgarh": {
        "DistrictA": ["CityA", "CityB"],
        "DistrictB": ["CityC", "CityD"],
        "DistrictC": ["CityE", "CityF"]
    },
    "Delhi": {
        "Central": ["Connaught Place", "Karol Bagh"],
        "East": ["Preet Vihar", "Laxmi Nagar"],
        "New Delhi": ["Chanakyapuri", "Sarojini Nagar"],
        "North": ["Civil Lines", "Model Town"],
        "North East": ["Seelampur", "Shahdara"],
        "North West": ["Pitampura", "Rohini"],
        "Shahdara": ["Dilshad Garden", "Karkardooma"],
        "South": ["Greater Kailash", "Lajpat Nagar"],
        "South East": ["Kalkaji", "Nehru Place"],
        "South West": ["Dwarka", "Vasant Kunj"],
        "West": ["Janakpuri", "Rajouri Garden"]
    },
    "Gujarat": {
        "DistrictA": ["CityA", "CityB"],
        "DistrictB": ["CityC", "CityD"],
        "DistrictC": ["CityE", "CityF"]
    },
    "Himachal Pradesh": {
        "Bilaspur": ["CityA", "CityB"],
        "Chamba": ["CityC", "CityD"],
        "Hamirpur": ["CityE", "CityF"],
        "Kangra": ["CityG", "CityH"],
        "Kinnaur": ["CityI", "CityJ"],
        "Kullu": ["CityK", "CityL"],
        "Lahaul And Spiti": ["CityM", "CityN"],
        "Mandi": ["CityO", "CityP"],
        "Shimla": ["CityQ", "CityR"],
        "Sirmaur": ["CityS", "CityT"],
        "Solan": ["CityU", "CityV"],
        "Una": ["CityW", "CityX"]
    },
};


export const RegisterShop = () => {
    const [formData, setFormData] = useState(defaultRegisterShopData);
    const [userData, setUserData] = useState(true);
    const { user } = useLogin();
    const navigate = useNavigate();

    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        if (userData && user) {
            setFormData({
                ...defaultRegisterShopData,
                name: user.name,
                email: user.email,
                phone: user.phone,
            });
            setUserData(false);
        }
    }, [userData, user])

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

    const handleStateChange = (e) => {
        const selectedState = e.target.value;

        // Check if the selected state exists in the stateDistrictCityData object
        if (selectedState in stateDistrictCityData) {
            setFormData({ ...formData, state: selectedState, district: '', city: '' });

            // Update districts based on the selected state
            const districts = Object.keys(stateDistrictCityData[selectedState]);
            setDistricts(districts);
            setCities([]);  // Clear cities when state changes
        } else {
            // Handle the case where the selected state is not found
            console.error("Selected state not found in data");
            setDistricts([]);
            setCities([]);
        }
    };

    const handleDistrictChange = (e) => {
        const selectedDistrict = e.target.value;
        setFormData({ ...formData, district: selectedDistrict, city: '' });

        // Update cities based on the selected state and district
        const cities = stateDistrictCityData[formData.state][selectedDistrict];
        setCities(cities);
    };

    const handleCityChange = (e) => {
        setFormData({ ...formData, city: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        const requiredFields = [
            'shopname', 'state', 'district', 'city', 'street', 'pin', 
            'password', 'bankname', 'bankbranch', 'ifsc', 'micr', 'account'
        ];
    
        for (let field of requiredFields) {
            if (!formData[field]) {
                Swal.fire({ 
                    title: "Error", 
                    text: "Please fill all the required fields", 
                    icon: "error" 
                });
                return;
            }
        }
        try {
            const response = await api.post(`/shop/registershop`, formData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            // const response = await fetch(`http://localhost:8000/api/shop/registershop`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(formData)
            // })
            console.log(response)
            if (response.status === 201) {
                Swal.fire({ title: "Success", text: "Shop registration successful", icon: "success" });
                return navigate('/')
            }else{
                const res_data = await response.json();
                Swal.fire({ title: "Error", text: `${res_data.extraDetails ? res_data.extraDetails : res_data.message}`, icon: "error" });
            }
            // const res_data = await response.json();
            // console.log("response from server", res_data);

            // if (response) {
            //     setFormData(defaultRegisterShopData);
            //     Swal.fire({
            //         title: "Success",
            //         text: "Shop registration successful",
            //         icon: "success",
            //     });
            //     navigate("/")
            // } else {
            //     toast.error(res_data.extraDetails ? res_data.extraDetails : res_data.message)
            // }
        } catch (error) {
            console.log("registershop", error)
            Swal.fire({ 
                title: "Error", 
                text: "Registration failed. Please try again.", 
                icon: "error" 
            });
        }
    }

    return (
        <>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
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
                                    value={formData.name}
                                    onChange={handleInput}
                                    readOnly />
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
                                <select name="state" value={formData.state} onChange={handleStateChange} required>
                                    <option value="" disabled>Select State</option>
                                    {Object.keys(stateDistrictCityData).map((state, index) => (
                                        <option key={index} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-box">
                                <span className="details">District</span>
                                <select name="district" value={formData.district} onChange={handleDistrictChange} required>
                                    <option value="" disabled>Select District</option>
                                    {districts.map((district, index) => (
                                        <option key={index} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-box">
                                <span className="details">City</span>
                                <select name="city" value={formData.city} onChange={handleCityChange} required>
                                    <option value="" disabled>Select City</option>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </select>
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
                        <button className="add-service-button" type="button" onClick={handleAddService}>Add Service</button>
                    </div>
                        <div className="button">
                            <input type="submit" value="Register" />
                        </div>
                </form>
            </div>
        </>
    )

}