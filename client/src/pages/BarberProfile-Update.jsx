import React from "react";
import { useEffect, useState } from "react";
import { api } from '../utils/api';
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2";
import { FaMapMarkerAlt, FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone, FaStore, FaMapPin, FaRupeeSign, FaSpinner } from 'react-icons/fa';

const GOOGLE_GEOCODE_API_KEY =
  import.meta.env.VITE_GOOGLE_GEOCODE_API_KEY;
const GOOGLE_GEOCODE_ENDPOINT =
  "https://maps.googleapis.com/maps/api/geocode/json";

export const BarberProfileUpdate = () => {
  const navigate = useNavigate();
  const { user } = useLogin();
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
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

  const getShopAddressString = () =>
    [
      data.shopname,
      data.street,
      data.city,
      data.district,
      data.state,
      data.pin,
      "India",
    ]
      .map((part) => part?.toString().trim())
      .filter(Boolean)
      .join(", ");

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

      return true;
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
      return false;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const resolveCoordinatesWithGoogle = async ({ showSuccessMessage = true } = {}) => {
    const missingAddressFields = [];
    if (!data.street?.trim()) missingAddressFields.push("Street");
    if (!data.city?.trim()) missingAddressFields.push("City");
    if (!data.district?.trim()) missingAddressFields.push("District");
    if (!data.state?.trim()) missingAddressFields.push("State");
    if (!data.pin?.trim()) missingAddressFields.push("Pincode");

    if (missingAddressFields.length > 0) {
      Swal.fire({
        title: "Address Incomplete",
        text: `Fill ${missingAddressFields.join(", ")} before fetching coordinates.`,
        icon: "warning",
        confirmButtonColor: "#F59E0B"
      });
      return false;
    }

    if (!GOOGLE_GEOCODE_API_KEY) {
      Swal.fire({
        title: "API Key Missing",
        text: "Google Geocoding API key is not configured.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return false;
    }

    setIsCapturingLocation(true);

    Swal.fire({
      title: "Fetching Exact Coordinates",
      text: "Matching your shop address with Google Maps...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const address = encodeURIComponent(getShopAddressString());
      const response = await fetch(
        `${GOOGLE_GEOCODE_ENDPOINT}?address=${address}&key=${GOOGLE_GEOCODE_API_KEY}`
      );
      const geocodeData = await response.json();

      if (geocodeData.status !== "OK" || !geocodeData.results?.length) {
        throw new Error(
          geocodeData.error_message ||
            geocodeData.status ||
            "Unable to resolve coordinates for this address"
        );
      }

      const bestResult = geocodeData.results[0];
      const latitude = Number(bestResult.geometry?.location?.lat);
      const longitude = Number(bestResult.geometry?.location?.lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Invalid coordinates returned by Google Geocoding API");
      }

      setData((prevData) => ({
        ...prevData,
        lat: latitude,
        lng: longitude,
        coordinatesSource: "google_geocode",
      }));

      setIsLocationCaptured(true);
      setLocationAccuracy(null);
      Swal.close();

      if (showSuccessMessage) {
        Swal.fire({
          title: "Coordinates Updated",
          html: `
            <div class="text-left">
              <p class="text-sm text-slate-600 mb-2">Address matched from Google Maps.</p>
              <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
                <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${latitude}</p>
                <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${longitude}</p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#10B981"
        });
      }

      return true;
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Unable To Get Coordinates",
        text: error.message || "Please verify address details and try again.",
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
      return false;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleManualLocationCapture = () => {
    if (isCapturingLocation) return;
    captureCurrentLocation();
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
      const gpsCaptured = await captureCurrentLocation({
        showSuccessMessage: false,
      });

      if (!gpsCaptured) {
        const fallbackChoice = await Swal.fire({
          title: "Use Address-Based Coordinates?",
          text: "Current location could not be captured. Use Google address geocoding instead?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Use Address Coordinates",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#2563EB",
        });

        if (!fallbackChoice.isConfirmed) {
          setIsSubmitting(false);
          return;
        }

        const isResolved = await resolveCoordinatesWithGoogle({
          showSuccessMessage: false,
        });
        if (!isResolved) {
          setIsSubmitting(false);
          return;
        }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-6">
        {/* Header */}
        <div className="text-center mb-8">
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
                  disabled={isCapturingLocation}
                  className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-md min-w-[180px] ${
                    isCapturingLocation 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 font-black transform hover:-translate-y-0.5'
                  }`}
                >
                  {isCapturingLocation ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>Capturing...</span>
                    </>
                  ) : (
                    <>
                      <FaMapMarkerAlt className="text-base" />
                      <span>{isLocationCaptured ? 'Recapture Current Location' : 'Capture Current Location'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => resolveCoordinatesWithGoogle()}
                  disabled={isCapturingLocation}
                  className="flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-all duration-200 border border-cyan-300 text-cyan-700 bg-white hover:bg-cyan-50 min-w-[180px]"
                >
                  Use Address Coordinates
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
                  <FaSpinner className="animate-spin" />
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








// import React from "react";
// import { useEffect, useState } from "react";
// import { api } from '../utils/api';
// import { useLogin } from "../components/LoginContext";
// import { useNavigate } from "react-router-dom";
// import { stateDistrictCityData } from "../utils/locationData";
// import Swal from "sweetalert2";

// export const BarberProfileUpdate = () => {
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [isCapturingLocation, setIsCapturingLocation] = useState(false);
//   const [isLocationCaptured, setIsLocationCaptured] = useState(false);
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     shopname: "",
//     state: "",
//     district: "",
//     city: "",
//     street: "",
//     pin: "",
//     services: [{ service: '', price: '' }],
//     lat: null,
//     lng: null
//   });

//   const captureLocation = () => {
//     if (!navigator.geolocation) {
//       Swal.fire({
//         title: "Geolocation Not Supported",
//         text: "Your browser doesn't support geolocation. Please use a modern browser.",
//         icon: "error"
//       });
//       return;
//     }

//     setIsCapturingLocation(true);
    
//     Swal.fire({
//       title: 'Capturing Location',
//       text: 'Please allow location access for accurate shop positioning...',
//       icon: 'info',
//       showConfirmButton: false,
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       }
//     });

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         const accuracy = position.coords.accuracy;
        
//         // Set location with proper precision
//         const preciseLat = parseFloat(latitude.toFixed(14));
//         const preciseLng = parseFloat(longitude.toFixed(14));
        
//         setData(prevData => ({
//           ...prevData,
//           lat: preciseLat,
//           lng: preciseLng
//         }));
        
//         setIsLocationCaptured(true);
//         setIsCapturingLocation(false);
        
//         Swal.fire({
//           title: "Location Captured Successfully!",
//           html: `
//             <div class="text-left">
//               <p><strong>Coordinates:</strong></p>
//               <p>Latitude: ${preciseLat}</p>
//               <p>Longitude: ${preciseLng}</p>
//               <p class="mt-2"><strong>Accuracy:</strong> ${Math.round(accuracy)} meters</p>
//               ${accuracy > 50 ? 
//                 '<p class="text-yellow-600 mt-2">⚠️ Location accuracy is low. Consider moving to an open area.</p>' : 
//                 '<p class="text-green-600 mt-2">✓ Good location accuracy</p>'
//               }
//             </div>
//           `,
//           icon: "success",
//           confirmButtonText: "Great!",
//           confirmButtonColor: "#10B981"
//         });
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         setIsCapturingLocation(false);
        
//         let errorMessage = "Failed to capture location. Please try again.";
//         switch(error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage = "Location access denied. Please allow location access in your browser settings and try again.";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             errorMessage = "Location information is unavailable. Please check your internet connection and GPS.";
//             break;
//           case error.TIMEOUT:
//             errorMessage = "Location request timed out. Please try again in a better network area.";
//             break;
//         }
        
//         Swal.fire({
//           title: "Location Capture Failed",
//           text: errorMessage,
//           icon: "error",
//           confirmButtonText: "Try Again",
//           confirmButtonColor: "#EF4444",
//           showCancelButton: true,
//           cancelButtonText: "Skip Location Update"
//         }).then((result) => {
//           if (result.isConfirmed) {
//             captureLocation();
//           }
//         });
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0
//       }
//     );
//   };

//   const handleManualLocationCapture = () => {
//     if (isCapturingLocation) return;
//     captureLocation();
//   };

//   const handleStateChange = (e) => {
//     const selectedState = e.target.value;

//     if (selectedState in stateDistrictCityData) {
//       setData({ ...data, state: selectedState, district: '', city: '' });
//       const districts = Object.keys(stateDistrictCityData[selectedState]);
//       setDistricts(districts);
//       setCities([]);
//     } else {
//       console.error("Selected state not found in data");
//       setDistricts([]);
//       setCities([]);
//     }
//   };

//   const handleDistrictChange = (e) => {
//     const selectedDistrict = e.target.value;
//     setData({ ...data, district: selectedDistrict, city: '' });
//     const cities = stateDistrictCityData[data.state][selectedDistrict];
//     setCities(cities);
//   };

//   const handleCityChange = (e) => {
//     setData({ ...data, city: e.target.value });
//   };

//   const handleServiceChange = (e, index) => {
//     const updatedServices = data.services.map((service, i) =>
//       i === index ? { ...service, [e.target.name]: e.target.value } : service
//     );
//     setData({ ...data, services: updatedServices });
//   };

//   const handleAddService = () => {
//     setData({ ...data, services: [...data.services, { service: '', price: '' }] });
//   };

//   const handleRemoveService = (index) => {
//     const updatedServices = data.services.filter((service, i) => i !== index);
//     setData({ ...data, services: updatedServices });
//   };

//   const getSingleUserData = async () => {
//     try {
//       const response = await api.get(`/shop/by-email/${user.email}`)
//       const shopData = await response.data;
//       setData(shopData);

//       // Check if location exists
//       if (shopData.lat && shopData.lng) {
//         setIsLocationCaptured(true);
//       }

//       // Set districts and cities based on the fetched data
//       if (shopData.state in stateDistrictCityData) {
//         const districts = Object.keys(stateDistrictCityData[shopData.state]);
//         setDistricts(districts);

//         if (shopData.district in stateDistrictCityData[shopData.state]) {
//           const cities = stateDistrictCityData[shopData.state][shopData.district];
//           setCities(cities);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getSingleUserData();
//   }, [user.email]);

//   const handleInput = (e) => {
//     let name = e.target.name;
//     let value = e.target.value;

//     setData({
//       ...data,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate services
//     const invalidServices = data.services.filter(service => 
//       !service.service.trim() || !service.price.trim()
//     );
    
//     if (invalidServices.length > 0) {
//       Swal.fire({ 
//         title: "Error", 
//         text: "Please fill all service names and prices", 
//         icon: "error" 
//       });
//       return;
//     }

//     try {
//       const response = await api.patch(`/shop/update`, { email: data.email, ...data })
//       if (response) {
//         Swal.fire({
//           title: "Success",
//           text: "Profile updated successfully",
//           icon: "success",
//           timer: 1500
//         }).then(() => {
//           navigate("/barberprofile");
//         });
//       } else {
//         Swal.fire({
//           title: "Error",
//           text: "Error in updating profile",
//           icon: "error"
//         });
//       }

//     } catch (error) {
//       console.log(error);
//       Swal.fire({
//         title: "Error",
//         text: "Failed to update profile. Please try again.",
//         icon: "error"
//       });
//     }
//   }

//   return (
//     <section className="max-w-6xl mx-auto bg-white p-8 shadow-lg rounded-lg">
//       <h2 className="text-3xl text-center font-bold text-cyan-700 mb-8 mt-8">Update Shop Profile</h2>
      
//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Location Capture Section */}
//         <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="bg-cyan-100 rounded-full p-3 mr-4">
//                 <svg className="w-6 h-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">Shop Location</h3>
//                 <p className="text-sm text-gray-600">Update your shop location for better customer reach</p>
//               </div>
//             </div>
//             <button 
//               type="button"
//               onClick={handleManualLocationCapture}
//               disabled={isCapturingLocation}
//               className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md ${
//                 isCapturingLocation 
//                   ? 'bg-gray-400 cursor-not-allowed text-white' 
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               }`}
//             >
//               {isCapturingLocation ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   <span>Capturing...</span>
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                   <span>{isLocationCaptured ? 'Update Location' : 'Capture Location'}</span>
//                 </>
//               )}
//             </button>
//           </div>
          
//           <div className="bg-white rounded-lg p-4 border border-blue-100">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex-1">
//                 <div className="text-sm font-medium text-gray-700 mb-2">Current Location Status:</div>
//                 {isLocationCaptured ? (
//                   <div className="space-y-1">
//                     <div className="flex items-center text-green-600">
//                       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       <span className="font-medium">Location Successfully Captured</span>
//                     </div>
//                     <div className="text-xs text-gray-600 ml-6">
//                       Latitude: {data.lat}, Longitude: {data.lng}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center text-yellow-600">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>Location not captured yet</span>
//                   </div>
//                 )}
//               </div>
//               {isLocationCaptured && (
//                 <div className="mt-2 sm:mt-0">
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     ✓ Ready to Update
//                   </span>
//                 </div>
//               )}
//             </div>
//             {!isLocationCaptured && (
//               <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
//                 <p className="text-sm text-yellow-700">
//                   <strong>Note:</strong> Updating your location helps customers find your shop more accurately.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Basic Details Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
//             <input 
//               type="text" 
//               name="name" 
//               id="name" 
//               readOnly 
//               value={data.name} 
//               onChange={handleInput} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-gray-50" 
//             />
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//             <input 
//               type="email" 
//               name="email" 
//               id="email" 
//               readOnly 
//               value={data.email} 
//               onChange={handleInput} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-gray-50" 
//             />
//           </div>

//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//             <input 
//               type="tel" 
//               name="phone" 
//               id="phone" 
//               readOnly 
//               value={data.phone} 
//               onChange={handleInput} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-gray-50" 
//             />
//           </div>

//           <div>
//             <label htmlFor="shopname" className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
//             <input 
//               type="text" 
//               name="shopname" 
//               id="shopname" 
//               value={data.shopname} 
//               onChange={handleInput} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
//             <select 
//               name="state" 
//               value={data.state} 
//               onChange={handleStateChange} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none bg-white"
//             >
//               <option value="" disabled>Select State</option>
//               {Object.keys(stateDistrictCityData).map((state, index) => (
//                 <option key={index} value={state}>{state}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
//             <select 
//               name="district" 
//               value={data.district} 
//               onChange={handleDistrictChange} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none bg-white"
//               disabled={!data.state}
//             >
//               <option value="" disabled>Select District</option>
//               {districts.map((district, index) => (
//                 <option key={index} value={district}>{district}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
//             <select 
//               name="city" 
//               value={data.city} 
//               onChange={handleCityChange} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none bg-white"
//               disabled={!data.district}
//             >
//               <option value="" disabled>Select City</option>
//               {cities.map((city, index) => (
//                 <option key={index} value={city}>{city}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">Street</label>
//             <input 
//               type="text" 
//               name="street" 
//               id="street" 
//               value={data.street} 
//               onChange={handleInput} 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
//             />
//           </div>

//           <div>
//             <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">PIN</label>
//             <input 
//               type="number" 
//               name="pin" 
//               id="pin" 
//               value={data.pin} 
//               onChange={handleInput} 
//               required 
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" 
//             />
//           </div>
//         </div>

//         {/* Services Section */}
//         <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-200">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="bg-green-100 rounded-full p-3 mr-4">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold text-gray-800">Services & Pricing</h3>
//             </div>
//             <button 
//               type="button" 
//               onClick={handleAddService} 
//               className="bg-cyan-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
//             >
//               + Add Service
//             </button>
//           </div>
          
//           <div className="space-y-4">
//             {data.services.map((service, index) => (
//               <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-100">
//                 <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                   <div className="flex-1 space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Service Name</label>
//                     <input 
//                       type="text" 
//                       name="service" 
//                       placeholder="Service name (e.g., Haircut, Shaving, Facial)" 
//                       value={service.service}
//                       onChange={(e) => handleServiceChange(e, index)} 
//                       className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                     />
//                   </div>
                  
//                   <div className="lg:w-40 space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
//                       <input 
//                         type="number" 
//                         name="price" 
//                         placeholder="Price" 
//                         value={service.price}
//                         onChange={(e) => handleServiceChange(e, index)} 
//                         className="w-full h-12 border-2 border-gray-200 rounded-lg pl-8 pr-4 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
//                       />
//                     </div>
//                   </div>
                  
//                   {data.services.length > 1 && (
//                     <button 
//                       type="button" 
//                       onClick={() => handleRemoveService(index)} 
//                       className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md self-start lg:self-center mt-2 lg:mt-0"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="text-center pt-6">
//           <button 
//             type="submit" 
//             className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
//           >
//             Update Shop Profile
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// }

// export default BarberProfileUpdate;










// import React from "react";
// import { useEffect, useState } from "react";
// import { api } from '../utils/api';
// import { useLogin } from "../components/LoginContext";
// import { useNavigate } from "react-router-dom";
// import { stateDistrictCityData } from "../utils/locationData";
// import Swal from "sweetalert2";


// export const BarberProfileUpdate = () => {
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     shopname: "",
//     state: "",
//     district: "",
//     city: "",
//     street: "",
//     pin: "",
//     services: [{ service: '', price: '' }]
//   });


//   const handleStateChange = (e) => {
//     const selectedState = e.target.value;

//     if (selectedState in stateDistrictCityData) {
//       setData({ ...data, state: selectedState, district: '', city: '' });
//       const districts = Object.keys(stateDistrictCityData[selectedState]);
//       setDistricts(districts);
//       setCities([]);
//     } else {
//       console.error("Selected state not found in data");
//       setDistricts([]);
//       setCities([]);
//     }
//   };

//   const handleDistrictChange = (e) => {
//     const selectedDistrict = e.target.value;
//     setData({ ...data, district: selectedDistrict, city: '' });
//     const cities = stateDistrictCityData[data.state][selectedDistrict];
//     setCities(cities);
//   };

//   const handleCityChange = (e) => {
//     setData({ ...data, city: e.target.value });
//   };

//   const handleServiceChange = (e, index) => {
//     const updatedServices = data.services.map((service, i) =>
//       i === index ? { ...service, [e.target.name]: e.target.value } : service
//     );
//     setData({ ...data, services: updatedServices });
//   };
//   const handleAddService = () => {
//     setData({ ...data, services: [...data.services, { service: '', price: '' }] });
//   };
//   const handleRemoveService = (index) => {
//     const updatedServices = data.services.filter((service, i) => i !== index);
//     setData({ ...data, services: updatedServices });
//   };

//   const getSingleUserData = async () => {
//     try {
//       const response = await api.get(`/shop/by-email/${user.email}`)
//       const shopData = await response.data;
//       setData(shopData);

//       // Set districts and cities based on the fetched data
//       if (shopData.state in stateDistrictCityData) {
//         const districts = Object.keys(stateDistrictCityData[shopData.state]);
//         setDistricts(districts);

//         if (shopData.district in stateDistrictCityData[shopData.state]) {
//           const cities = stateDistrictCityData[shopData.state][shopData.district];
//           setCities(cities);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getSingleUserData();
//   }, [user.email]);

//   const handleInput = (e) => {
//     let name = e.target.name;
//     let value = e.target.value;

//     setData({
//       ...data,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.patch(`/shop/update`, { email: data.email, ...data })
//       if (response) {
//         Swal.fire({
//           title: "Success",
//           text: "Updated successfully",
//           icon: "success",
//           timer: 1500
//         }).then(() => {
//           navigate("/barberprofile");
//         });
//       } else {
//         toast.error("Error in Updation");
//       }

//     } catch (error) {
//       console.log(error);
//     }
//   }

//   return (
//     <section className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
//       <h2 className="text-2xl text-center font-semibold text-cyan-700 mb-4 mt-10">Update Shop Data</h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//             <input type="text" name="name" id="name" readOnly value={data.name} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//             <input type="email" name="email" id="email" readOnly value={data.email} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>

//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
//             <input type="phone" name="phone" id="phone" readOnly value={data.phone} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>

//           <div>
//             <label htmlFor="shopname" className="block text-sm font-medium text-gray-700">Shop Name</label>
//             <input type="text" name="shopname" id="shopname" value={data.shopname} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">State</label>
//             <select name="state" value={data.state} onChange={handleStateChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
//               <option value="" disabled>Select State</option>
//               {Object.keys(stateDistrictCityData).map((state, index) => (
//                 <option key={index} value={state}>{state}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">District</label>
//             <select name="district" value={data.district} onChange={handleDistrictChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
//               <option value="" disabled>Select District</option>
//               {districts.map((district, index) => (
//                 <option key={index} value={district}>{district}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">City</label>
//             <select name="city" value={data.city} onChange={handleCityChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
//               <option value="" disabled>Select City</option>
//               {cities.map((city, index) => (
//                 <option key={index} value={city}>{city}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
//             <input type="text" name="street" id="street" value={data.street} onChange={handleInput} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>

//           <div>
//             <label htmlFor="pin" className="block text-sm font-medium text-gray-700">PIN</label>
//             <input type="number" name="pin" id="pin" value={data.pin} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
//           </div>
//         </div>

//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-2">Services</h3>
//           {data.services.map((service, index) => (
//             <div key={index} className="flex items-center space-x-4 mb-4">
//               <input type="text" name="service" placeholder="Service Name" value={service.service}
//                 onChange={(e) => handleServiceChange(e, index)} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
//               <input type="number" name="price" placeholder="Price" value={service.price}
//                 onChange={(e) => handleServiceChange(e, index)} className="w-24 h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
//               <button type="button" onClick={() => handleRemoveService(index)} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition duration-300 transform hover:-translate-y-1">Remove</button>
//             </div>
//           ))}
//           <button type="button" onClick={handleAddService} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-300 transform hover:-translate-y-1">Add Service</button>
//         </div>

//         <div className="text-center">
//           <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md">Update Shop</button>
//         </div>
//       </form>
//     </section>

//   )
// }


// export default BarberProfileUpdate;
