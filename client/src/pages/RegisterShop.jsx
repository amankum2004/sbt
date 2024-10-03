import { useLogin } from "../components/LoginContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
// import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { api } from "../utils/api"
import React from "react"; 
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

            <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-6">Shop Registration</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input type="text" name="username" placeholder="Shop owner name" required
                                value={formData.name} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" name="email" placeholder="Enter your email" required
                                value={formData.email} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input type="number" name="phone" placeholder="Enter your number" required
                                value={formData.phone} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Saloon Name</label>
                            <input type="text" name="shopname" placeholder="Saloon Name" required
                                value={formData.shopname} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <select name="state" value={formData.state} onChange={handleStateChange} required
                                className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500">
                                <option value="" disabled>Select State</option>
                                {Object.keys(stateDistrictCityData).map((state, index) => (
                                    <option key={index} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            <select name="district" value={formData.district} onChange={handleDistrictChange} required
                                className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500">
                                <option value="" disabled>Select District</option>
                                {districts.map((district, index) => (
                                    <option key={index} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <select name="city" value={formData.city} onChange={handleCityChange} required
                                className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500">
                                <option value="" disabled>Select City</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Street</label>
                            <input type="text" name="street" placeholder="Street" required
                                value={formData.street} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pin Code</label>
                            <input type="number" name="pin" placeholder="Pin Code" required
                                value={formData.pin} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password (created during registration)</label>
                            <input type="text" name="password" placeholder="password" required
                                value={formData.password} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Bank Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Name</label>
                            <input type="text" name="bankname" placeholder="Bank Name" required
                                value={formData.bankname} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Branch</label>
                            <input type="text" name="bankbranch" placeholder="Bank Branch" required
                                value={formData.bankbranch} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">IFSC Code</label>
                            <input type="text" name="ifsc" placeholder="IFSC Code" required
                                value={formData.ifsc} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">MICR Code</label>
                            <input type="text" name="micr" placeholder="MICR Code" required
                                value={formData.micr} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <input type="number" name="account" placeholder="Account Number" required
                                value={formData.account} onChange={handleInput} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Services</h3>
                    {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center space-x-4 mb-4">
                            <input type="text" name="service" placeholder="Service Name" value={service.service}
                                onChange={(e) => handleServiceChange(e, index)} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                            <input type="number" name="price" placeholder="Price" value={service.price}
                                onChange={(e) => handleServiceChange(e, index)} className="w-24 h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                            <button type="button" onClick={() => handleRemoveService(index)} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition duration-300 transform hover:-translate-y-1">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddService} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-300 transform hover:-translate-y-1">Add Service</button>
                </div>

                <div className="mb-6">
                    <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">Register Shop</button>
                </div>
            </form>
        </div>
        </>
    )

}