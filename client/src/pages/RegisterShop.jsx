import React from "react"; 
import { useLogin } from "../components/LoginContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2"
import { api } from "../utils/api"

const defaultFormData = {
    name: "",email: "",phone: "",password: "",
    shopname: "",state: "",district: "",city: "",street: "",pin: "",
    services: [{ service: '', price: '' }],
    lat: null, lng: null
};

export const RegisterShop = () => {
    const { user } = useLogin();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(defaultFormData);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [token, setToken] = useState(null);
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [isLocationCaptured, setIsLocationCaptured] = useState(false);
    const [isCapturingLocation, setIsCapturingLocation] = useState(false);
    const [locationAccuracy, setLocationAccuracy] = useState(null);

    // High-precision location capture function
    const captureLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire({
                title: "Geolocation Not Supported",
                text: "Your browser doesn't support geolocation. Please use a modern browser.",
                icon: "error"
            });
            return;
        }

        setIsCapturingLocation(true);
        
        Swal.fire({
            title: 'Capturing High-Precision Location',
            text: 'Please allow location access for exact shop positioning...',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // Store coordinates with maximum precision (up to 15 decimal places)
                const preciseLat = latitude; // Full precision
                const preciseLng = longitude; // Full precision
                
                setLocation({ 
                    lat: preciseLat, 
                    lng: preciseLng 
                });
                
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    lat: preciseLat,
                    lng: preciseLng
                }));
                
                setLocationAccuracy(accuracy);
                setIsLocationCaptured(true);
                setIsCapturingLocation(false);
                
                Swal.fire({
                    title: "High-Precision Location Captured!",
                    html: `
                        <div class="text-left">
                            <p><strong>Exact Coordinates:</strong></p>
                            <p class="text-sm font-mono">Latitude: ${preciseLat}</p>
                            <p class="text-sm font-mono">Longitude: ${preciseLng}</p>
                            <p class="mt-2"><strong>Accuracy:</strong> ${Math.round(accuracy)} meters</p>
                            ${accuracy > 10 ? 
                                '<p class="text-yellow-600 mt-2">⚠️ For best results, move to an open area and recapture location.</p>' : 
                                '<p class="text-green-600 mt-2">✓ Excellent location precision</p>'
                            }
                        </div>
                    `,
                    icon: "success",
                    confirmButtonText: "Perfect!",
                    confirmButtonColor: "#10B981",
                    width: 500
                });
                
                console.log("High-precision coordinates captured:", {
                    lat: preciseLat,
                    lng: preciseLng,
                    accuracy: accuracy
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsCapturingLocation(false);
                
                let errorMessage = "Failed to capture location. Please try again.";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please allow location access in your browser settings and try again.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. Please check your internet connection and GPS.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again in a better network area.";
                        break;
                }
                
                Swal.fire({
                    title: "Location Capture Failed",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonText: "Try Again",
                    confirmButtonColor: "#EF4444",
                    showCancelButton: true,
                    cancelButtonText: "Continue Without Location"
                }).then((result) => {
                    if (result.isConfirmed) {
                        captureLocation();
                    }
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 20000, // Longer timeout for better accuracy
                maximumAge: 0
            }
        );
    };

    // Auto-capture location on component mount
    useEffect(() => {
        captureLocation();
    }, []);

    // Manual location capture function
    const handleManualLocationCapture = () => {
        if (isCapturingLocation) return;
        captureLocation();
    };

    useEffect(() => {
        const getToken = () => {
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) {
                    console.error("No token found in localStorage");
                    return null;
                }
                const parsedToken = JSON.parse(tokenString);
                setToken(parsedToken);
                return parsedToken;
            } catch (error) {
                console.error("Error parsing token:", error);
                Swal.fire({
                    title: "Error",
                    text: "Authentication error. Please login again.",
                    icon: "error"
                });
                navigate('/login');
                return null;
            }
        };
        getToken();
    }, [navigate]);

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
        
        if (!token) {
            Swal.fire({
                title: "Error",
                text: "Authentication token missing. Please login again.",
                icon: "error"
            });
            return;
        }

        if (!formData.lat || !formData.lng) {
            const result = await Swal.fire({
                title: "Location Not Captured",
                text: "Your shop location is required for customers to find you. Do you want to try capturing location again?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Capture Location",
                cancelButtonText: "Continue Anyway",
                confirmButtonColor: "#10B981",
                cancelButtonColor: "#6B7280"
            });
            
            if (result.isConfirmed) {
                captureLocation();
                return;
            }
        }
        
        const requiredFields = [
            'name', 'email', 'phone', 'shopname', 'state', 'district', 
            'city', 'street', 'pin', 'services'
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

        // Validate services
        const invalidServices = formData.services.filter(service => 
            !service.service.trim() || !service.price.trim()
        );
        
        if (invalidServices.length > 0) {
            Swal.fire({ 
                title: "Error", 
                text: "Please fill all service names and prices", 
                icon: "error" 
            });
            return;
        }

        console.log("FormData with high-precision coordinates:", {
            ...formData,
            coordinates: `Lat: ${formData.lat}, Lng: ${formData.lng}`
        });

        try {
            const response = await api.post(`/shop/registershop`, formData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                Swal.fire({ 
                    title: "Success!", 
                    text: "Shop registration successful", 
                    icon: "success",
                    confirmButtonText: "Great!",
                    confirmButtonColor: "#10B981"
                });
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
            console.log("registershop", error.response?.data || error);
            Swal.fire({ 
                title: "Error", 
                text: error.response?.data?.message || "Registration failed. Please try again.", 
                icon: "error" 
            });
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto mt-10">
                {/* Header Section */}
                {/* <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 mt-10">
                        {isAdmin ? "Register New Shop" : "Shop Registration"}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-12">
                        {isAdmin ? "Add a new shop to the system with complete details" : "Complete your salon registration to start accepting bookings"}
                    </p>
                </div> */}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 sm:px-8">
                        <div className="flex items-center justify-center">
                            <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">Shop Information</h2>
                                <p className="text-purple-100 mt-2">Fill in all the required details carefully</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 space-y-8">
                        {/* High-Precision Location Capture Section */}
                        <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">Exact Shop Location</h3>
                                        <p className="text-sm text-gray-600">High-precision coordinates for accurate customer navigation</p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleManualLocationCapture}
                                    disabled={isCapturingLocation}
                                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md ${
                                        isCapturingLocation 
                                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    {isCapturingLocation ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Capturing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>{isLocationCaptured ? 'Recapture' : 'Capture Location'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Current Location Status:</div>
                                        {isLocationCaptured ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center text-green-600">
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium">Location Captured</span>
                                                </div>
                                                <div className="text-xs font-mono text-gray-600 ml-6 bg-gray-50 p-2 rounded">
                                                    <div>Latitude: {location.lat}</div>
                                                    <div>Longitude: {location.lng}</div>
                                                </div>
                                                {locationAccuracy && (
                                                    <div className="text-xs text-gray-500 ml-6">
                                                        Accuracy: {Math.round(locationAccuracy)} meters
                                                        {locationAccuracy > 10 && (
                                                            <span className="text-yellow-600 ml-2">(Consider recapturing for better precision)</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-yellow-600">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span>Location not captured yet</span>
                                            </div>
                                        )}
                                    </div>
                                    {isLocationCaptured && (
                                        <div className="mt-2 sm:mt-0">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ✓ Exact Location Ready
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!isLocationCaptured && (
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Important:</strong> For exact customer navigation, capture your shop location with high precision. 
                                            Ensure you're at the exact shop location when capturing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rest of your form remains the same */}
                        {/* Basic Details Section */}
                        <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-100 rounded-full p-3 mr-4">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Basic Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="Shop owner name" 
                                        required
                                        value={formData.name} 
                                        onChange={handleInput} 
                                        className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                        readOnly={!isAdmin} 
                                    />
                                </div>
                                
                                {/* Email field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="Enter email" 
                                        required
                                        value={formData.email} 
                                        onChange={handleInput} 
                                        className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                        readOnly={!isAdmin} 
                                    />
                                </div>
                                
                                {/* Phone field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        placeholder="Enter phone number" 
                                        required
                                        value={formData.phone} 
                                        onChange={handleInput} 
                                        className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                                        readOnly={!isAdmin} 
                                    />
                                </div>
                                
                                {/* Shop name field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Salon Name *</label>
                                    <input 
                                        type="text" 
                                        name="shopname" 
                                        placeholder="Enter salon name" 
                                        required
                                        value={formData.shopname} 
                                        onChange={handleInput} 
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                    />
                                </div>
                                
                                {/* State field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">State *</label>
                                    <select 
                                        name="state" 
                                        value={formData.state} 
                                        onChange={handleStateChange} 
                                        required
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {Object.keys(stateDistrictCityData).map((state, index) => (
                                            <option key={index} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                                                                            
                                {/* District field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">District *</label>
                                    <select 
                                        name="district" 
                                        value={formData.district} 
                                        onChange={handleDistrictChange} 
                                        required
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                        disabled={!formData.state}
                                    >
                                        <option value="" disabled>Select District</option>
                                        {districts.map((district, index) => (
                                            <option key={index} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                                                                                            
                                {/* City field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">City *</label>
                                    <select 
                                        name="city" 
                                        value={formData.city} 
                                        onChange={handleCityChange} 
                                        required
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
                                        disabled={!formData.district}
                                    >
                                        <option value="" disabled>Select City</option>
                                        {cities.map((city, index) => (
                                            <option key={index} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                                                                            
                                {/* Street field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                                    <input 
                                        type="text" 
                                        name="street" 
                                        placeholder="Enter street address" 
                                        required
                                        value={formData.street} 
                                        onChange={handleInput} 
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                    />
                                </div>
                                        
                                {/* Pin code field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
                                    <input 
                                        type="tel" 
                                        name="pin" 
                                        placeholder="Enter pin code" 
                                        required
                                        maxLength="6"
                                        value={formData.pin} 
                                        onChange={handleInput} 
                                        className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                    />
                                </div>
                                
                                {/* Password field only for shop owners */}
                                {!isAdmin && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">Password *</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            placeholder="Enter password" 
                                            required
                                            value={formData.password} 
                                            onChange={handleInput} 
                                            className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="bg-green-50 rounded-xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 rounded-full p-3 mr-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Services & Pricing</h3>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleAddService} 
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
                                >
                                    + Add Service
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {formData.services.map((service, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-100">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                                                <input 
                                                    type="text" 
                                                    name="service" 
                                                    placeholder="Service name (e.g., Haircut, Shaving, Facial)" 
                                                    value={service.service}
                                                    onChange={(e) => handleServiceChange(e, index)} 
                                                    className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                                                />
                                            </div>
                                            
                                            <div className="lg:w-40 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                                    <input 
                                                        type="tel" 
                                                        name="price" 
                                                        placeholder="Price" 
                                                        value={service.price}
                                                        onChange={(e) => handleServiceChange(e, index)} 
                                                        className="w-full h-12 border-2 border-gray-200 rounded-lg pl-8 pr-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            {formData.services.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveService(index)} 
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md self-start lg:self-center mt-2 lg:mt-0"
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
                        <div className="pt-6">
                            <button 
                                type="submit" 
                                className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
                                    !isLocationCaptured ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                                disabled={!isLocationCaptured}
                            >
                                {isLocationCaptured ? 
                                    (isAdmin ? "Register Shop" : "Complete Registration") : 
                                    "Capture Location First"
                                }
                            </button>
                            {!isLocationCaptured && (
                                <p className="text-center text-red-600 text-sm mt-2">
                                    Please capture your exact shop location before submitting
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}











// import React from "react"; 
// import { useLogin } from "../components/LoginContext"
// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { stateDistrictCityData } from "../utils/locationData";
// import Swal from "sweetalert2"
// import { api } from "../utils/api"

// const defaultFormData = {
//     name: "",email: "",phone: "",password: "",
//     shopname: "",state: "",district: "",city: "",street: "",pin: "",
//     services: [{ service: '', price: '' }],
//     lat: null, lng: null
// };

// export const RegisterShop = () => {
//     const { user } = useLogin();
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState(defaultFormData);
//     const [districts, setDistricts] = useState([]);
//     const [cities, setCities] = useState([]);
//     const [token, setToken] = useState(null);
//     const [location, setLocation] = useState({ lat: null, lng: null });

//     useEffect(() => {
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//             const { latitude, longitude } = position.coords;

//             setLocation({ lat: latitude, lng: longitude });

//             // Update formData with lat/lng
//             setFormData((prevFormData) => ({
//                 ...prevFormData,
//                 lat: latitude,
//                 lng: longitude
//             }));
//             },
//             (error) => {
//             console.error("Geolocation error:", error);
//             Swal.fire({
//                 title: "Location Access Denied",
//                 text: "Please allow location access for accurate shop location.",
//                 icon: "warning"
//             });
//             }
//         );
//     }, []);


//     useEffect(() => {
//         const getToken = () => {
//             try {
//                 const tokenString = localStorage.getItem('token');
//                 if (!tokenString) {
//                     console.error("No token found in localStorage");
//                     return null;
//                 }
//                 const parsedToken = JSON.parse(tokenString);
//                 setToken(parsedToken);
//                 return parsedToken;
//             } catch (error) {
//                 console.error("Error parsing token:", error);
//                 Swal.fire({
//                     title: "Error",
//                     text: "Authentication error. Please login again.",
//                     icon: "error"
//                 });
//                 navigate('/login');
//                 return null;
//             }
//         };
//         getToken();
//     }, [navigate]);


//     // Check if admin
//     const isAdmin = user?.usertype === 'admin';

//     useEffect(() => {
//         if (!isAdmin && user) {
//             // Pre-fill only for shop owners
//             setFormData(prev => ({
//                 ...prev,
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone
//             }));
//         }
//     }, [user, isAdmin])

//     const handleInput = (e) => {
//             setFormData({ ...formData, [e.target.name]: e.target.value });
//         };
    
//         const handleServiceChange = (e, index) => {
//             const updatedServices = formData.services.map((service, i) =>
//                 i === index ? { ...service, [e.target.name]: e.target.value } : service
//             );
//             setFormData({ ...formData, services: updatedServices });
//         };
    
//         const handleAddService = () => {
//             setFormData({ ...formData, services: [...formData.services, { service: '', price: '' }] });
//         };
    
//         const handleRemoveService = (index) => {
//             const updatedServices = formData.services.filter((service, i) => i !== index);
//             setFormData({ ...formData, services: updatedServices });
//         };
    
//         const handleStateChange = (e) => {
//             const selectedState = e.target.value;
    
//             // Check if the selected state exists in the stateDistrictCityData object
//             if (selectedState in stateDistrictCityData) {
//                 setFormData({ ...formData, state: selectedState, district: '', city: '' });
    
//                 // Update districts based on the selected state
//                 const districts = Object.keys(stateDistrictCityData[selectedState]);
//                 setDistricts(districts);
//                 setCities([]);  // Clear cities when state changes
//             } else {
//                 // Handle the case where the selected state is not found
//                 console.error("Selected state not found in data");
//                 setDistricts([]);
//                 setCities([]);
//             }
//         };
    
//         const handleDistrictChange = (e) => {
//             const selectedDistrict = e.target.value;
//             setFormData({ ...formData, district: selectedDistrict, city: '' });
    
//             // Update cities based on the selected state and district
//             const cities = stateDistrictCityData[formData.state][selectedDistrict];
//             setCities(cities);
//         };
    
//         const handleCityChange = (e) => {
//             setFormData({ ...formData, city: e.target.value });
//         };
    

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!token) {
//             Swal.fire({
//                 title: "Error",
//                 text: "Authentication token missing. Please login again.",
//                 icon: "error"
//             });
//             return;
//         }

//         if (!formData.lat || !formData.lng) {
//             Swal.fire({
//                 title: "Location Missing",
//                 text: "Please allow location access and try again.",
//                 icon: "error"
//             });
//             return;
//         }
        
//         const requiredFields = [
//             'name', 'email', 'phone', 'shopname', 'state', 'district', 
//             'city', 'street', 'pin', 'services'
//         ];
        
//         // Add password only for shop owners
//         if (!isAdmin) {
//             requiredFields.push('password');
//         }

//         // Validation check
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

//         console.log("FormData being submitted:", formData);
//         try {
//             const response = await api.post(`/shop/registershop`,formData, {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.status === 201) {
//                 Swal.fire({ title: "Success", text: "Shop registration successful", icon: "success" });
//                 navigate(isAdmin ? '/admin/shops' : '/');
//             } else {
//                 const res_data = await response.json();
//                 Swal.fire({ 
//                     title: "Error", 
//                     text: `${res_data.extraDetails ? res_data.extraDetails : res_data.message}`, 
//                     icon: "error" 
//                 });
//             }
//         } catch (error) {
//             console.log("registershop", error.response?.data || error);
//             Swal.fire({ 
//                 title: "Error", 
//                 text: error.response?.data?.message || "Registration failed. Please try again.", 
//                 icon: "error" 
//             });
//         }
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-6xl mx-auto">
//                 {/* Header Section */}
//                 <div className="text-center mb-6">
//                     <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 mt-10">
//                         {isAdmin ? "Register New Shop" : "Shop Registration"}
//                     </h1>
//                     <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                         {isAdmin ? "Add a new shop to the system with complete details" : "Complete your salon registration to start accepting bookings"}
//                     </p>
//                 </div>

//                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                     {/* Form Header */}
//                     <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 sm:px-8">
//                         <div className="flex items-center justify-center">
//                             <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
//                                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h2 className="text-2xl sm:text-3xl font-bold text-white">Shop Information</h2>
//                                 <p className="text-purple-100 mt-2">Fill in all the required details carefully</p>
//                             </div>
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 space-y-8">
//                         {/* Basic Details Section */}
//                         <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
//                             <div className="flex items-center mb-6">
//                                 <div className="bg-purple-100 rounded-full p-3 mr-4">
//                                     <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                 </div>
//                                 <h3 className="text-xl font-semibold text-gray-800">Basic Details</h3>
//                             </div>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* Name field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Full Name *</label>
//                                     <input 
//                                         type="text" 
//                                         name="name" 
//                                         placeholder="Shop owner name" 
//                                         required
//                                         value={formData.name} 
//                                         onChange={handleInput} 
//                                         className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
//                                         readOnly={!isAdmin} 
//                                     />
//                                 </div>
                                
//                                 {/* Email field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Email *</label>
//                                     <input 
//                                         type="email" 
//                                         name="email" 
//                                         placeholder="Enter email" 
//                                         required
//                                         value={formData.email} 
//                                         onChange={handleInput} 
//                                         className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
//                                         readOnly={!isAdmin} 
//                                     />
//                                 </div>
                                
//                                 {/* Phone field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="phone" 
//                                         placeholder="Enter phone number" 
//                                         required
//                                         value={formData.phone} 
//                                         onChange={handleInput} 
//                                         className={`w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
//                                         readOnly={!isAdmin} 
//                                     />
//                                 </div>
                                
//                                 {/* Shop name field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Salon Name *</label>
//                                     <input 
//                                         type="text" 
//                                         name="shopname" 
//                                         placeholder="Enter salon name" 
//                                         required
//                                         value={formData.shopname} 
//                                         onChange={handleInput} 
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 {/* State field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">State *</label>
//                                     <select 
//                                         name="state" 
//                                         value={formData.state} 
//                                         onChange={handleStateChange} 
//                                         required
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                     >
//                                         <option value="" disabled>Select State</option>
//                                         {Object.keys(stateDistrictCityData).map((state, index) => (
//                                             <option key={index} value={state}>{state}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                                                                            
//                                 {/* District field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">District *</label>
//                                     <select 
//                                         name="district" 
//                                         value={formData.district} 
//                                         onChange={handleDistrictChange} 
//                                         required
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                         disabled={!formData.state}
//                                     >
//                                         <option value="" disabled>Select District</option>
//                                         {districts.map((district, index) => (
//                                             <option key={index} value={district}>{district}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                                                                            
//                                 {/* City field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">City *</label>
//                                     <select 
//                                         name="city" 
//                                         value={formData.city} 
//                                         onChange={handleCityChange} 
//                                         required
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none bg-white"
//                                         disabled={!formData.district}
//                                     >
//                                         <option value="" disabled>Select City</option>
//                                         {cities.map((city, index) => (
//                                             <option key={index} value={city}>{city}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                                                                            
//                                 {/* Street field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Street Address *</label>
//                                     <input 
//                                         type="text" 
//                                         name="street" 
//                                         placeholder="Enter street address" 
//                                         required
//                                         value={formData.street} 
//                                         onChange={handleInput} 
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                        
//                                 {/* Pin code field */}
//                                 <div className="space-y-3">
//                                     <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
//                                     <input 
//                                         type="tel" 
//                                         name="pin" 
//                                         placeholder="Enter pin code" 
//                                         required
//                                         maxLength="6"
//                                         value={formData.pin} 
//                                         onChange={handleInput} 
//                                         className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                     />
//                                 </div>
                                
//                                 {/* Password field only for shop owners */}
//                                 {!isAdmin && (
//                                     <div className="space-y-3">
//                                         <label className="block text-sm font-medium text-gray-700">Password *</label>
//                                         <input 
//                                             type="password" 
//                                             name="password" 
//                                             placeholder="Enter password" 
//                                             required
//                                             value={formData.password} 
//                                             onChange={handleInput} 
//                                             className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Services Section */}
//                         <div className="bg-green-50 rounded-xl p-6 sm:p-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="flex items-center">
//                                     <div className="bg-green-100 rounded-full p-3 mr-4">
//                                         <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                         </svg>
//                                     </div>
//                                     <h3 className="text-xl font-semibold text-gray-800">Services & Pricing</h3>
//                                 </div>
//                                 <button 
//                                     type="button" 
//                                     onClick={handleAddService} 
//                                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
//                                 >
//                                     + Add Service
//                                 </button>
//                             </div>
                            
//                             <div className="space-y-4">
//                                 {formData.services.map((service, index) => (
//                                     <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-100">
//                                         <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                                             <div className="flex-1 space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700">Service Name</label>
//                                                 <input 
//                                                     type="text" 
//                                                     name="service" 
//                                                     placeholder="Service name (e.g., Haircut, Shaving, Facial)" 
//                                                     value={service.service}
//                                                     onChange={(e) => handleServiceChange(e, index)} 
//                                                     className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                                                 />
//                                             </div>
                                            
//                                             <div className="lg:w-40 space-y-2">
//                                                 <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
//                                                 <div className="relative">
//                                                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
//                                                     <input 
//                                                         type="tel" 
//                                                         name="price" 
//                                                         placeholder="Price" 
//                                                         value={service.price}
//                                                         onChange={(e) => handleServiceChange(e, index)} 
//                                                         className="w-full h-12 border-2 border-gray-200 rounded-lg pl-8 pr-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                                                     />
//                                                 </div>
//                                             </div>
                                            
//                                             {formData.services.length > 1 && (
//                                                 <button 
//                                                     type="button" 
//                                                     onClick={() => handleRemoveService(index)} 
//                                                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md self-start lg:self-center mt-2 lg:mt-0"
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
//                         <div className="pt-6">
//                             <button 
//                                 type="submit" 
//                                 className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
//                             >
//                                 {isAdmin ? "Register Shop" : "Complete Registration"}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     )
// }


