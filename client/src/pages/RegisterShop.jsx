import React from "react"; 
import { useLogin } from "../components/LoginContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2"
import { api } from "../utils/api"

const token = JSON.parse(localStorage.getItem('token'))

// Single default data object
const defaultFormData = {
    name: "",
    email: "",
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

export const RegisterShop = () => {
    const { user } = useLogin();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(defaultFormData);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);

    // Check if admin
    const isAdmin = user?.usertype === 'admin';

    useEffect(() => {
        if (!isAdmin && user) {
            // Pre-fill only for shop owners
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                phone: user.phone
            }));
        }
    }, [user, isAdmin])

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
        
        const requiredFields = [
            'name', 'email', 'phone', 'shopname', 'state', 'district', 
            'city', 'street', 'pin', 'bankname', 'bankbranch', 
            'ifsc', 'micr', 'account'
        ];
        
        // Add password only for shop owners
        if (!isAdmin) {
            requiredFields.push('password');
        }

        // Validation check
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
            
            if (response.status === 201) {
                Swal.fire({ title: "Success", text: "Shop registration successful", icon: "success" });
                navigate(isAdmin ? '/admin/shops' : '/');
            } else {
                const res_data = await response.json();
                Swal.fire({ 
                    title: "Error", 
                    text: `${res_data.extraDetails ? res_data.extraDetails : res_data.message}`, 
                    icon: "error" 
                });
            }
        } catch (error) {
            console.log("registershop", error);
            Swal.fire({ 
                title: "Error", 
                text: "Registration failed. Please try again.", 
                icon: "error" 
            });
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-6 sm:px-6">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">
                        {isAdmin ? "Register New Shop" : "Shop Registration"}
                    </h2>
                    <p className="text-purple-100 text-center mt-2 text-sm sm:text-base">
                        {isAdmin ? "Add a new shop to the system" : "Fill in your details to register your salon"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                    {/* Basic Details Section */}
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center mb-4 sm:mb-6">
                            <div className="bg-purple-100 rounded-full p-2 mr-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Basic Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Name field - always visible */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Shop owner name" 
                                    required
                                    value={formData.name} 
                                    onChange={handleInput} 
                                    className={`w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                    readOnly={!isAdmin} 
                                />
                            </div>
                            
                            {/* Email field - always visible */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter email" 
                                    required
                                    value={formData.email} 
                                    onChange={handleInput} 
                                    className={`w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                    readOnly={!isAdmin} 
                                />
                            </div>
                            
                            {/* Phone field - always visible */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    placeholder="Enter phone number" 
                                    required
                                    value={formData.phone} 
                                    onChange={handleInput} 
                                    className={`w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                    readOnly={!isAdmin} 
                                />
                            </div>
                            
                            {/* Shop name field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Salon Name *</label>
                                <input 
                                    type="text" 
                                    name="shopname" 
                                    placeholder="Enter salon name" 
                                    required
                                    value={formData.shopname} 
                                    onChange={handleInput} 
                                    className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                                                                            <label className="block text-sm font-medium text-gray-700">State *</label>
                                                                                            <select 
                                                                                                name="state" 
                                                                                                value={formData.state} 
                                                                                                onChange={handleStateChange} 
                                                                                                required
                                                                                                className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                                                                            >
                                                                                                <option value="" disabled>Select State</option>
                                                                                                {Object.keys(stateDistrictCityData).map((state, index) => (
                                                                                                    <option key={index} value={state}>{state}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                        
                                                                                        <div className="space-y-2">
                                                                                            <label className="block text-sm font-medium text-gray-700">District *</label>
                                                                                            <select 
                                                                                                name="district" 
                                                                                                value={formData.district} 
                                                                                                onChange={handleDistrictChange} 
                                                                                                required
                                                                                                className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                                                                                disabled={!formData.state}
                                                                                            >
                                                                                                <option value="" disabled>Select District</option>
                                                                                                {districts.map((district, index) => (
                                                                                                    <option key={index} value={district}>{district}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                        
                                                                                        <div className="space-y-2">
                                                                                            <label className="block text-sm font-medium text-gray-700">City *</label>
                                                                                            <select 
                                                                                                name="city" 
                                                                                                value={formData.city} 
                                                                                                onChange={handleCityChange} 
                                                                                                required
                                                                                                className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                                                                                disabled={!formData.district}
                                                                                            >
                                                                                                <option value="" disabled>Select City</option>
                                                                                                {cities.map((city, index) => (
                                                                                                    <option key={index} value={city}>{city}</option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                        
                                                                                        <div className="space-y-2">
                                                                                            <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                                                                                            <input 
                                                                                                type="text" 
                                                                                                name="street" 
                                                                                                placeholder="Enter street address" 
                                                                                                required
                                                                                                value={formData.street} 
                                                                                                onChange={handleInput} 
                                                                                                className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                                                                            />
                                                                                        </div>
                                                                                        
                                                                                        <div className="space-y-2">
                                                                                            <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
                                                                                            <input 
                                                                                                type="tel" 
                                                                                                name="pin" 
                                                                                                placeholder="Enter pin code" 
                                                                                                required
                                                                                                maxLength="6"
                                                                                                value={formData.pin} 
                                                                                                onChange={handleInput} 
                                                                                                className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                                                                            />
                                                                                        </div>
                            
                            {/* Password field only for shop owners */}
                            {!isAdmin && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Password(created during registration)*</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        placeholder="Enter password" 
                                        required
                                        value={formData.password} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bank Details Section */}
                        <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                            <div className="flex items-center mb-4 sm:mb-6">
                                <div className="bg-blue-100 rounded-full p-2 mr-3">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Bank Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
                                    <input 
                                        type="text" 
                                        name="bankname" 
                                        placeholder="Enter bank name" 
                                        required
                                        value={formData.bankname} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Bank Branch *</label>
                                    <input 
                                        type="text" 
                                        name="bankbranch" 
                                        placeholder="Enter branch name" 
                                        required
                                        value={formData.bankbranch} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">IFSC Code *</label>
                                    <input 
                                        type="text" 
                                        name="ifsc" 
                                        placeholder="Enter IFSC code" 
                                        required
                                        maxLength="11"
                                        style={{ textTransform: 'uppercase' }}
                                        value={formData.ifsc} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">MICR Code *</label>
                                    <input 
                                        type="tel" 
                                        name="micr" 
                                        placeholder="Enter MICR code" 
                                        required
                                        maxLength="9"
                                        value={formData.micr} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-2 lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                                    <input 
                                        type="tel" 
                                        name="account" 
                                        placeholder="Enter account number" 
                                        required
                                        value={formData.account} 
                                        onChange={handleInput} 
                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Services & Pricing</h3>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleAddService} 
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                                >
                                    + Add Service
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {formData.services.map((service, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 sm:hidden">Service Name</label>
                                                <input 
                                                    type="text" 
                                                    name="service" 
                                                    placeholder="Service name (e.g., Haircut, Shaving, Facial)" 
                                                    value={service.service}
                                                    onChange={(e) => handleServiceChange(e, index)} 
                                                    className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                                                />
                                            </div>
                                            
                                            <div className="sm:w-32 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 sm:hidden">Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
                                                    <input 
                                                        type="tel" 
                                                        name="price" 
                                                        placeholder="Price" 
                                                        value={service.price}
                                                        onChange={(e) => handleServiceChange(e, index)} 
                                                        className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            {formData.services.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveService(index)} 
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md self-start sm:self-center"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    
                    {/* Submit Button */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                        >
                            {isAdmin ? "Register Shop" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}



// import React from "react"; 
// import { useLogin } from "../components/LoginContext"
// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// // import { toast } from "react-toastify"
// import { stateDistrictCityData } from "../utils/locationData";
// import Swal from "sweetalert2"
// import { api } from "../utils/api"


// const token = JSON.parse(localStorage.getItem('token'))
// const defaultRegisterShopData = {
//     name: "",
//     email: localStorage.getItem("signupEmail") || "",
//     phone: "",
//     password: "",
//     shopname: "",
//     state: "",
//     district: "",
//     city: "",
//     street: "",
//     pin: "",
//     bankname: "",
//     bankbranch: "",
//     ifsc: "",
//     micr: "",
//     account: "",
//     services: [{ service: '', price: '' }]
// };


// export const RegisterShop = () => {
//     const [formData, setFormData] = useState(defaultRegisterShopData);
//     const [userData, setUserData] = useState(true);
//     const { user } = useLogin();
//     const navigate = useNavigate();

//     const [districts, setDistricts] = useState([]);
//     const [cities, setCities] = useState([]);

//     useEffect(() => {
//         if (userData && user) {
//             setFormData({
//                 ...defaultRegisterShopData,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//             });
//             setUserData(false);
//         }
//     }, [userData, user])

//     const handleInput = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleServiceChange = (e, index) => {
//         const updatedServices = formData.services.map((service, i) =>
//             i === index ? { ...service, [e.target.name]: e.target.value } : service
//         );
//         setFormData({ ...formData, services: updatedServices });
//     };

//     const handleAddService = () => {
//         setFormData({ ...formData, services: [...formData.services, { service: '', price: '' }] });
//     };

//     const handleRemoveService = (index) => {
//         const updatedServices = formData.services.filter((service, i) => i !== index);
//         setFormData({ ...formData, services: updatedServices });
//     };

//     const handleStateChange = (e) => {
//         const selectedState = e.target.value;

//         // Check if the selected state exists in the stateDistrictCityData object
//         if (selectedState in stateDistrictCityData) {
//             setFormData({ ...formData, state: selectedState, district: '', city: '' });

//             // Update districts based on the selected state
//             const districts = Object.keys(stateDistrictCityData[selectedState]);
//             setDistricts(districts);
//             setCities([]);  // Clear cities when state changes
//         } else {
//             // Handle the case where the selected state is not found
//             console.error("Selected state not found in data");
//             setDistricts([]);
//             setCities([]);
//         }
//     };

//     const handleDistrictChange = (e) => {
//         const selectedDistrict = e.target.value;
//         setFormData({ ...formData, district: selectedDistrict, city: '' });

//         // Update cities based on the selected state and district
//         const cities = stateDistrictCityData[formData.state][selectedDistrict];
//         setCities(cities);
//     };

//     const handleCityChange = (e) => {
//         setFormData({ ...formData, city: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         console.log(formData)
//         const requiredFields = [
//             'shopname', 'state', 'district', 'city', 'street', 'pin', 
//             'password', 'bankname', 'bankbranch', 'ifsc', 'micr', 'account'
//         ];
    
//         for (let field of requiredFields) {
//             if (!formData[field]) {
//                 Swal.fire({ 
//                     title: "Error", 
//                     text: "Please fill all the required fields", 
//                     icon: "error" 
//                 });
//                 return;
//             }
//         }
//         try {
//             const response = await api.post(`/shop/registershop`, formData, {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             console.log(response)
//             if (response.status === 201) {
//                 Swal.fire({ title: "Success", text: "Shop registration successful", icon: "success" });
//                 return navigate('/')
//             }else{
//                 const res_data = await response.json();
//                 Swal.fire({ title: "Error", text: `${res_data.extraDetails ? res_data.extraDetails : res_data.message}`, icon: "error" });
//             }
//         } catch (error) {
//             console.log("registershop", error)
//             Swal.fire({ 
//                 title: "Error", 
//                 text: "Registration failed. Please try again.", 
//                 icon: "error" 
//             });
//         }
//     }

//     return (
//         <>
//             {/* Mobile-first responsive container with better padding and margins */}
//             <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
//                     {/* Header with better mobile spacing */}
//                     <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-6 sm:px-6">
//                         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">
//                             Shop Registration
//                         </h2>
//                         <p className="text-purple-100 text-center mt-2 text-sm sm:text-base">
//                             Fill in your details to register your salon
//                         </p>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
//                         {/* Basic Details Section */}
//                         <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
//                             <div className="flex items-center mb-4 sm:mb-6">
//                                 <div className="bg-purple-100 rounded-full p-2 mr-3">
//                                     <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Basic Details</h3>
//                             </div>
                            
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Full Name *</label>
//                                     <input 
//                                         type="text" 
//                                         name="username" 
//                                         placeholder="Shop owner name" 
//                                         required
//                                         value={formData.name} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-gray-100 cursor-not-allowed" 
//                                         readOnly 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Email *</label>
//                                     <input 
//                                         type="email" 
//                                         name="email" 
//                                         placeholder="Enter your email" 
//                                         required
//                                         value={formData.email} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-gray-100 cursor-not-allowed" 
//                                         readOnly 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="phone" 
//                                         placeholder="Enter your number" 
//                                         required
//                                         value={formData.phone} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-gray-100 cursor-not-allowed" 
//                                         readOnly 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Salon Name *</label>
//                                     <input 
//                                         type="text" 
//                                         name="shopname" 
//                                         placeholder="Enter salon name" 
//                                         required
//                                         value={formData.shopname} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">State *</label>
//                                     <select 
//                                         name="state" 
//                                         value={formData.state} 
//                                         onChange={handleStateChange} 
//                                         required
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                     >
//                                         <option value="" disabled>Select State</option>
//                                         {Object.keys(stateDistrictCityData).map((state, index) => (
//                                             <option key={index} value={state}>{state}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">District *</label>
//                                     <select 
//                                         name="district" 
//                                         value={formData.district} 
//                                         onChange={handleDistrictChange} 
//                                         required
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                         disabled={!formData.state}
//                                     >
//                                         <option value="" disabled>Select District</option>
//                                         {districts.map((district, index) => (
//                                             <option key={index} value={district}>{district}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">City *</label>
//                                     <select 
//                                         name="city" 
//                                         value={formData.city} 
//                                         onChange={handleCityChange} 
//                                         required
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                         disabled={!formData.district}
//                                     >
//                                         <option value="" disabled>Select City</option>
//                                         {cities.map((city, index) => (
//                                             <option key={index} value={city}>{city}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Street Address *</label>
//                                     <input 
//                                         type="text" 
//                                         name="street" 
//                                         placeholder="Enter street address" 
//                                         required
//                                         value={formData.street} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="pin" 
//                                         placeholder="Enter pin code" 
//                                         required
//                                         maxLength="6"
//                                         value={formData.pin} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2 lg:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700">Password *</label>
//                                     <input 
//                                         type="password" 
//                                         name="password" 
//                                         placeholder="Enter password" 
//                                         required
//                                         value={formData.password} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Bank Details Section */}
//                         <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
//                             <div className="flex items-center mb-4 sm:mb-6">
//                                 <div className="bg-blue-100 rounded-full p-2 mr-3">
//                                     <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Bank Details</h3>
//                             </div>
                            
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
//                                     <input 
//                                         type="text" 
//                                         name="bankname" 
//                                         placeholder="Enter bank name" 
//                                         required
//                                         value={formData.bankname} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">Bank Branch *</label>
//                                     <input 
//                                         type="text" 
//                                         name="bankbranch" 
//                                         placeholder="Enter branch name" 
//                                         required
//                                         value={formData.bankbranch} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">IFSC Code *</label>
//                                     <input 
//                                         type="text" 
//                                         name="ifsc" 
//                                         placeholder="Enter IFSC code" 
//                                         required
//                                         maxLength="11"
//                                         style={{ textTransform: 'uppercase' }}
//                                         value={formData.ifsc} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-gray-700">MICR Code *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="micr" 
//                                         placeholder="Enter MICR code" 
//                                         required
//                                         maxLength="9"
//                                         value={formData.micr} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 <div className="space-y-2 lg:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700">Account Number *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="account" 
//                                         placeholder="Enter account number" 
//                                         required
//                                         value={formData.account} 
//                                         onChange={handleInput} 
//                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Services Section */}
//                         <div className="bg-green-50 rounded-lg p-4 sm:p-6">
//                             <div className="flex items-center justify-between mb-4 sm:mb-6">
//                                 <div className="flex items-center">
//                                     <div className="bg-green-100 rounded-full p-2 mr-3">
//                                         <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                         </svg>
//                                     </div>
//                                     <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Services & Pricing</h3>
//                                 </div>
//                                 <button 
//                                     type="button" 
//                                     onClick={handleAddService} 
//                                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
//                                 >
//                                     + Add Service
//                                 </button>
//                             </div>
                            
//                             <div className="space-y-4">
//                                 {formData.services.map((service, index) => (
//                                     <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-100">
//                                         <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                                             <div className="flex-1 space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700 sm:hidden">Service Name</label>
//                                                 <input 
//                                                     type="text" 
//                                                     name="service" 
//                                                     placeholder="Service name (e.g., Haircut, Facial)" 
//                                                     value={service.service}
//                                                     onChange={(e) => handleServiceChange(e, index)} 
//                                                     className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                                                 />
//                                             </div>
                                            
//                                             <div className="sm:w-32 space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700 sm:hidden">Price (₹)</label>
//                                                 <div className="relative">
//                                                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
//                                                     <input 
//                                                         type="tel" 
//                                                         name="price" 
//                                                         placeholder="Price" 
//                                                         value={service.price}
//                                                         onChange={(e) => handleServiceChange(e, index)} 
//                                                         className="w-full h-11 sm:h-12 border-2 border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                                                     />
//                                                 </div>
//                                             </div>
                                            
//                                             {formData.services.length > 1 && (
//                                                 <button 
//                                                     type="button" 
//                                                     onClick={() => handleRemoveService(index)} 
//                                                     className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md self-start sm:self-center"
//                                                 >
//                                                     Remove
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Submit Button */}
//                         <div className="pt-4">
//                             <button 
//                                 type="submit" 
//                                 className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
//                             >
//                                 Register Shop
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </>
//     )
// }


