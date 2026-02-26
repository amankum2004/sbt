import React from "react";
import { useEffect, useState } from "react";
import { api } from '../utils/api';
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2";
import { FaMapMarkerAlt, FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone, FaStore, FaMapPin, FaRupeeSign } from 'react-icons/fa';
import { LoadingSpinner } from "../components/Loading";

export const BarberProfileUpdate = () => {
  const navigate = useNavigate();
  const { user } = useLogin();
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isLocationCaptured, setIsLocationCaptured] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    shopname: "",
    state: "",
    district: "",
    city: "",
    street: "",
    pin: "",
    services: [{ service: '', price: '' }],
    lat: null,
    lng: null,
    coordinatesSource: "device_gps",
  });

  const persistCoordinatesToServer = async ({ lat, lng, coordinatesSource }) => {
    const email = data.email || user?.email;

    if (!email) {
      Swal.fire({
        title: "Missing Email",
        text: "Unable to save coordinates without a valid email.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return false;
    }

    setIsSavingLocation(true);
    Swal.fire({
      title: "Saving Location",
      text: "Updating your shop location in the database...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      await api.patch(`/shop/update`, {
        email,
        lat,
        lng,
        coordinatesSource
      });
      Swal.close();
      return true;
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Unable To Save Location",
        text: error?.response?.data?.message || error?.message || "Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return false;
    } finally {
      setIsSavingLocation(false);
    }
  };

  const captureCurrentLocation = async ({ showSuccessMessage = true } = {}) => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return false;
    }

    setIsCapturingLocation(true);
    Swal.fire({
      title: "Capturing Current Location",
      text: "Allow location access to capture your exact shop location.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 0,
        });
      });

      const latitude = Number(position.coords.latitude);
      const longitude = Number(position.coords.longitude);
      const accuracy = Number(position.coords.accuracy);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Unable to capture valid coordinates from device GPS.");
      }

      setData((prevData) => ({
        ...prevData,
        lat: latitude,
        lng: longitude,
        coordinatesSource: "device_gps",
      }));
      setLocationAccuracy(Number.isFinite(accuracy) ? accuracy : null);
      setIsLocationCaptured(true);

      Swal.close();
      if (showSuccessMessage) {
        Swal.fire({
          title: "Location Captured",
          html: `
            <div class="text-left">
              <p class="text-sm text-slate-600 mb-2">Coordinates captured from current device location.</p>
              <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
                <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${latitude}</p>
                <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${longitude}</p>
                ${
                  Number.isFinite(accuracy)
                    ? `<p class="font-mono text-xs break-all"><strong>Accuracy:</strong> ${Math.round(accuracy)}m</p>`
                    : ""
                }
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#10B981"
        });
      }

      return {
        lat: latitude,
        lng: longitude,
        accuracy,
        source: "device_gps",
      };
    } catch (error) {
      Swal.close();
      let errorMessage = "Unable to capture device location.";
      if (error?.code === 1) {
        errorMessage = "Location permission denied. Enable location access and try again.";
      } else if (error?.code === 2) {
        errorMessage = "Location unavailable. Please move to an open area and retry.";
      } else if (error?.code === 3) {
        errorMessage = "Location request timed out. Please retry.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Location Capture Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return null;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleManualLocationCapture = async () => {
    if (isCapturingLocation || isSavingLocation) return;

    const captured = await captureCurrentLocation({ showSuccessMessage: false });
    if (!captured) return;

    const saved = await persistCoordinatesToServer({
      lat: captured.lat,
      lng: captured.lng,
      coordinatesSource: "device_gps",
    });

    if (saved) {
      Swal.fire({
        title: "Location Updated",
        html: `
          <div class="text-left">
            <p class="text-sm text-slate-600 mb-2">Current device location saved to your profile.</p>
            <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
              <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${captured.lat}</p>
              <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${captured.lng}</p>
              ${
                Number.isFinite(captured.accuracy)
                  ? `<p class="font-mono text-xs break-all"><strong>Accuracy:</strong> ${Math.round(captured.accuracy)}m</p>`
                  : ""
              }
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Ok",
        confirmButtonColor: "#10B981"
      });
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;

    if (selectedState in stateDistrictCityData) {
      setData((prev) => ({
        ...prev,
        state: selectedState,
        district: "",
        city: "",
        lat: null,
        lng: null,
        coordinatesSource: "fallback",
      }));
      const districts = Object.keys(stateDistrictCityData[selectedState]);
      setDistricts(districts);
      setCities([]);
      setLocationAccuracy(null);
      setIsLocationCaptured(false);
    } else {
      console.error("Selected state not found in data");
      setDistricts([]);
      setCities([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setData((prev) => ({
      ...prev,
      district: selectedDistrict,
      city: "",
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    const cities = stateDistrictCityData[data.state][selectedDistrict];
    setCities(cities);
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const handleCityChange = (e) => {
    setData((prev) => ({
      ...prev,
      city: e.target.value,
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const handleServiceChange = (e, index) => {
    const updatedServices = data.services.map((service, i) =>
      i === index ? { ...service, [e.target.name]: e.target.value } : service
    );
    setData({ ...data, services: updatedServices });
  };

  const handleAddService = () => {
    setData({ ...data, services: [...data.services, { service: '', price: '' }] });
  };

  const handleRemoveService = (index) => {
    const updatedServices = data.services.filter((service, i) => i !== index);
    setData({ ...data, services: updatedServices });
  };

  const getSingleUserData = async () => {
    if (!user?.email) return;

    try {
      const response = await api.get(`/shop/by-email/${user.email}`)
      const shopData = await response.data;
      setData(shopData);

      // Check if location exists
      if (Number.isFinite(Number(shopData.lat)) && Number.isFinite(Number(shopData.lng))) {
        setIsLocationCaptured(true);
      }

      // Set districts and cities based on the fetched data
      if (shopData.state in stateDistrictCityData) {
        const districts = Object.keys(stateDistrictCityData[shopData.state]);
        setDistricts(districts);

        if (shopData.district in stateDistrictCityData[shopData.state]) {
          const cities = stateDistrictCityData[shopData.state][shopData.district];
          setCities(cities);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSingleUserData();
  }, [user?.email]);

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    const shouldInvalidateCoords = ["shopname", "street", "pin"].includes(name);

    setData((prev) => ({
      ...prev,
      [name]: value,
      ...(shouldInvalidateCoords
        ? { lat: null, lng: null, coordinatesSource: "fallback" }
        : {}),
    }));

    if (shouldInvalidateCoords) {
      setLocationAccuracy(null);
      setIsLocationCaptured(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate services
    const invalidServices = data.services.filter(service => 
      !service.service.trim() || !service.price.trim()
    );
    
    if (invalidServices.length > 0) {
      Swal.fire({ 
        title: "Error", 
        text: "Please fill all service names and prices", 
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      setIsSubmitting(false);
      return;
    }

    const hasCoordinates =
      Number.isFinite(Number(data.lat)) && Number.isFinite(Number(data.lng));

    if (!hasCoordinates) {
      const capturedLocation = await captureCurrentLocation({
        showSuccessMessage: false,
      });

      if (!capturedLocation) {
        Swal.fire({
          title: "Location Required",
          text: "Please capture your current location before submitting.",
          icon: "warning",
          confirmButtonColor: "#F59E0B"
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        email: data.email,
        name: data.name,
        phone: data.phone,
        shopname: data.shopname,
        state: data.state,
        district: data.district,
        city: data.city,
        street: data.street,
        pin: data.pin,
        services: data.services,
        lat: data.lat,
        lng: data.lng,
        coordinatesSource: data.coordinatesSource || "manual_update",
      };
      const response = await api.patch(`/shop/update`, payload)
      if (response) {
        Swal.fire({
          title: "Success",
          text: "Profile updated successfully",
          icon: "success",
          timer: 1500,
          confirmButtonColor: "#10B981"
        }).then(() => {
          navigate("/barberprofile");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error in updating profile",
          icon: "error",
          confirmButtonColor: "#EF4444"
        });
      }

    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Failed to update profile. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 mx-auto max-w-2xl shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-cyan-600 to-amber-500 bg-clip-text text-transparent">
              Update Shop Details
            </h1>
            <p className="text-gray-600 text-lg">
              Keep your shop information up to date for better customer experience
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Capture Section */}
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-cyan-100 p-3 rounded-xl mr-4">
                  <FaMapMarkerAlt className="text-cyan-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Shop Location</h3>
                  <p className="text-gray-600 text-sm">Update your shop location for better customer reach</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  type="button"
                  onClick={handleManualLocationCapture}
                  disabled={isCapturingLocation || isSavingLocation}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md min-w-[180px] ${
                    isCapturingLocation || isSavingLocation
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 font-black transform hover:-translate-y-0.5'
                  }`}
                >
                  {isCapturingLocation ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span>Capturing...</span>
                    </>
                  ) : isSavingLocation ? (
                    <>
                      <LoadingSpinner size="xs" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaMapMarkerAlt className="text-base" />
                      <span>{isLocationCaptured ? 'Recapture Current Location' : 'Capture Current Location'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-2">Current Location Status:</div>
                  {isLocationCaptured ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                        <span className="font-semibold">Location Captured Successfully</span>
                      </div>
                      <div className="text-xs text-gray-600 ml-5">
                        <div>Lat: {data.lat}</div>
                        <div>Lng: {data.lng}</div>
                        {locationAccuracy !== null && (
                          <div>Accuracy: {Math.round(locationAccuracy)}m</div>
                        )}
                        <div>Source: {data.coordinatesSource || "manual_update"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium">Location not captured yet</span>
                    </div>
                  )}
                </div>
                {isLocationCaptured && (
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-cyan-200">
                      ✓ Ready to Update
                    </span>
                  </div>
                )}
              </div>
              {!isLocationCaptured && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Capture current location from the shop for precise customer directions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Details Section */}
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <div className="flex items-center mb-6">
              <div className="bg-cyan-100 p-3 rounded-xl mr-4">
                <FaUser className="text-cyan-700 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                <p className="text-gray-600 text-sm">Your personal and shop details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaUser className="text-gray-400 mr-2 text-sm" />
                    Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    readOnly 
                    value={data.name} 
                    onChange={handleInput} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none" 
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaEnvelope className="text-gray-400 mr-2 text-sm" />
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    readOnly 
                    value={data.email} 
                    onChange={handleInput} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none" 
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaPhone className="text-gray-400 mr-2 text-sm" />
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="phone" 
                    readOnly 
                    value={data.phone} 
                    onChange={handleInput} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none" 
                  />
                </div>
              </div>

              {/* Shop Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label htmlFor="shopname" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaStore className="text-gray-400 mr-2 text-sm" />
                    Shop Name
                  </label>
                  <input 
                    type="text" 
                    name="shopname" 
                    id="shopname" 
                    value={data.shopname} 
                    onChange={handleInput} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                    placeholder="Enter your shop name"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FaMapPin className="text-gray-400 mr-2 text-sm" />
                    Address Details
                  </label>
                  <div className="space-y-3">
                    <select 
                      name="state" 
                      value={data.state} 
                      onChange={handleStateChange} 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="" disabled>Select State</option>
                      {Object.keys(stateDistrictCityData).map((state, index) => (
                        <option key={index} value={state}>{state}</option>
                      ))}
                    </select>

                    <select 
                      name="district" 
                      value={data.district} 
                      onChange={handleDistrictChange} 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
                      disabled={!data.state}
                    >
                      <option value="" disabled>Select District</option>
                      {districts.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                      ))}
                    </select>

                    <select 
                      name="city" 
                      value={data.city} 
                      onChange={handleCityChange} 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
                      disabled={!data.district}
                    >
                      <option value="" disabled>Select City</option>
                      {cities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                      ))}
                    </select>

                    <input 
                      type="text" 
                      name="street" 
                      placeholder="Street Address" 
                      value={data.street} 
                      onChange={handleInput} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                    />

                    <input 
                      type="number" 
                      name="pin" 
                      placeholder="PIN Code" 
                      value={data.pin} 
                      onChange={handleInput} 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <FaStore className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Services & Pricing</h3>
                  <p className="text-gray-600 text-sm">Manage your services and their prices</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleAddService} 
                className="bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 px-6 py-3 rounded-xl font-black transition-all duration-200 transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2 min-w-[140px]"
              >
                <FaPlus className="text-sm" />
                Add Service
              </button>
            </div>
            
            <div className="space-y-4">
              {data.services.map((service, index) => (
                <div key={index} className="bg-cyan-50 rounded-xl p-4 border-2 border-cyan-200">
                  <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Service Name</label>
                      <input 
                        type="text" 
                        name="service" 
                        placeholder="e.g., Haircut, Shaving, Facial" 
                        value={service.service}
                        onChange={(e) => handleServiceChange(e, index)} 
                        className="w-full h-12 border border-gray-300 rounded-lg px-4 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white" 
                      />
                    </div>
                    
                    <div className="lg:w-32 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <FaRupeeSign className="text-sm" />
                        </span>
                        <input 
                          type="number" 
                          name="price" 
                          placeholder="0" 
                          value={service.price}
                          onChange={(e) => handleServiceChange(e, index)} 
                          className="w-full h-12 border border-gray-300 rounded-lg pl-8 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white" 
                        />
                      </div>
                    </div>
                    
                    {data.services.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveService(index)} 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 h-12"
                      >
                        <FaTrash className="text-sm" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 font-black py-4 px-12 rounded-xl text-lg transition-all duration-300 shadow-lg transform hover:-translate-y-1 active:translate-y-0 min-w-[200px] ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BarberProfileUpdate;


