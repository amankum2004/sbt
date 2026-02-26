import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2";
import { api } from "../utils/api";

const MAX_LOCATION_SAMPLES = 6;
const TARGET_ACCURACY_METERS = 15;

const toCoordinateNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isCoordinatePairValid = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

const formatCoordinateLabel = (value) => {
  const parsed = toCoordinateNumber(value);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toFixed(14).replace(/\.?0+$/, "");
};

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
  services: [{ service: "", price: "" }],
  lat: null,
  lng: null,
  coordinatesSource: "device_gps",
};

export const RegisterShop = () => {
  const { user, refreshShopData } = useLogin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormData);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [token, setToken] = useState(null);
  const [isLocationCaptured, setIsLocationCaptured] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [pinError, setPinError] = useState(""); // State for pin validation error

  const clearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const applyCoordinates = ({ lat, lng, source, accuracy = null }) => {
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
      coordinatesSource: source,
    }));
    setLocationAccuracy(Number.isFinite(accuracy) ? accuracy : null);
    setIsLocationCaptured(true);
  };

  const getBestDeviceLocation = () =>
    new Promise((resolve, reject) => {
      let watchId = null;
      let timeoutId = null;
      const samples = [];

      const cleanup = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const finalizeWithBestSample = () => {
        if (!samples.length) {
          cleanup();
          reject(new Error("Unable to capture valid coordinates from device GPS."));
          return;
        }

        const bestSample = samples.reduce((best, current) => {
          if (!best) return current;

          const bestAccuracy = Number.isFinite(best.accuracy) ? best.accuracy : Infinity;
          const currentAccuracy = Number.isFinite(current.accuracy) ? current.accuracy : Infinity;

          if (currentAccuracy < bestAccuracy) return current;
          if (currentAccuracy === bestAccuracy && current.timestamp > best.timestamp) return current;
          return best;
        }, null);

        cleanup();
        resolve(bestSample);
      };

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = toCoordinateNumber(position.coords?.latitude);
          const longitude = toCoordinateNumber(position.coords?.longitude);
          const accuracy = toCoordinateNumber(position.coords?.accuracy);

          if (!isCoordinatePairValid(latitude, longitude)) return;

          samples.push({
            latitude,
            longitude,
            accuracy,
            timestamp: Number(position.timestamp) || Date.now(),
          });

          const bestAccuracy = samples.reduce((best, sample) => {
            const sampleAccuracy = Number.isFinite(sample.accuracy) ? sample.accuracy : Infinity;
            return Math.min(best, sampleAccuracy);
          }, Infinity);

          if (samples.length >= MAX_LOCATION_SAMPLES || bestAccuracy <= TARGET_ACCURACY_METERS) {
            finalizeWithBestSample();
          }
        },
        (error) => {
          if (samples.length > 0) {
            finalizeWithBestSample();
            return;
          }
          cleanup();
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );

      timeoutId = setTimeout(() => {
        if (samples.length > 0) {
          finalizeWithBestSample();
          return;
        }

        cleanup();
        reject({
          code: 3,
          message: "Location capture timed out. Try again in an open area.",
        });
      }, 22000);
    });

  const captureCurrentLocation = async ({ showSuccessMessage = true } = {}) => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
      return null;
    }

    setIsCapturingLocation(true);
    Swal.fire({
      title: "Capturing Current Location",
      text: "Allow location access to capture your exact shop location.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const bestLocation = await getBestDeviceLocation();
      const latitude = toCoordinateNumber(bestLocation.latitude);
      const longitude = toCoordinateNumber(bestLocation.longitude);
      const accuracy = toCoordinateNumber(bestLocation.accuracy);

      if (!isCoordinatePairValid(latitude, longitude)) {
        throw new Error("Unable to capture valid coordinates from device GPS.");
      }

      applyCoordinates({
        lat: latitude,
        lng: longitude,
        source: "device_gps",
        accuracy,
      });

      Swal.close();
      if (showSuccessMessage) {
        Swal.fire({
          title: "Location Captured",
          html: `
            <div class="text-left">
              <p class="text-sm text-slate-600 mb-2">Coordinates captured from current device location.</p>
              <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
                <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${formatCoordinateLabel(latitude)}</p>
                <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${formatCoordinateLabel(longitude)}</p>
                ${
                  Number.isFinite(accuracy)
                    ? `<p class="font-mono text-xs break-all"><strong>Accuracy:</strong> ${Math.round(accuracy)}m</p>`
                    : ""
                }
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      }

      return { lat: latitude, lng: longitude, source: "device_gps", accuracy };
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
        confirmButtonColor: "#EF4444",
      });
      return null;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  useEffect(() => {
    const tokenString = localStorage.getItem("jwt_token");
    if (tokenString) setToken(tokenString);
  }, []);

  const isAdmin = user?.usertype === "admin";

  useEffect(() => {
    if (!user || isAdmin) return;
    captureCurrentLocation({ showSuccessMessage: false });
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isAdmin && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone,
      }));
    }
  }, [user, isAdmin]);

  // Pincode validation function
  const validatePincode = (pin) => {
    // Remove any non-digit characters
    const cleanPin = pin.replace(/\D/g, '');
    
    if (cleanPin.length === 0) {
      return { isValid: false, message: "Pincode is required" };
    }
    
    if (cleanPin.length < 6) {
      return { isValid: false, message: "Pincode must be 6 digits" };
    }
    
    if (cleanPin.length > 6) {
      return { isValid: false, message: "Pincode cannot exceed 6 digits" };
    }
    
    if (!/^\d{6}$/.test(cleanPin)) {
      return { isValid: false, message: "Pincode must contain only numbers" };
    }
    
    // Optional: Validate first digit is not 0
    if (cleanPin.charAt(0) === '0') {
      return { isValid: false, message: "Pincode cannot start with 0" };
    }
    
    return { isValid: true, message: "" };
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    const shouldInvalidateCoords = ["shopname", "street", "pin"].includes(name);
    
    // Special handling for pincode input
    if (name === "pin") {
      // Remove any non-digit characters
      const cleanValue = value.replace(/\D/g, '');
      
      // Limit to 6 digits
      const limitedValue = cleanValue.slice(0, 6);
      
      // Validate the pincode
      const validation = validatePincode(limitedValue);
      setPinError(validation.message);
      
      setFormData((prev) => ({ ...prev, [name]: limitedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (shouldInvalidateCoords) {
      clearCoordinates();
    }
  };

  const handleServiceChange = (e, index) => {
    const updated = formData.services.map((s, i) =>
      i === index ? { ...s, [e.target.name]: e.target.value } : s
    );
    setFormData({ ...formData, services: updated });
  };

  const handleAddService = () =>
    setFormData({
      ...formData,
      services: [...formData.services, { service: "", price: "" }],
    });

  const handleRemoveService = (index) =>
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state,
      district: "",
      city: "",
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setDistricts(Object.keys(stateDistrictCityData[state] || {}));
    setCities([]);
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district,
      city: "",
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setCities(stateDistrictCityData[formData.state][district] || []);
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const handleCityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      city: e.target.value,
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setLocationAccuracy(null);
    setIsLocationCaptured(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    const requiredFields = {
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      shopname: "Shop Name",
      state: "State",
      district: "District",
      city: "City",
      street: "Street Address",
      pin: "Pincode",
    };

    // Check for empty required fields
    const emptyFields = Object.keys(requiredFields).filter(
      field => !formData[field]?.toString().trim()
    );

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(field => requiredFields[field]).join(", ");
      Swal.fire({
        title: "Missing Information",
        html: `Please fill in the following required fields:<br><strong>${fieldNames}</strong>`,
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate pincode
    const pinValidation = validatePincode(formData.pin);
    if (!pinValidation.isValid) {
      Swal.fire({
        title: "Invalid Pincode",
        text: pinValidation.message,
        icon: "error",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate services
    if (formData.services.length === 0) {
      Swal.fire({
        title: "No Services Added",
        text: "Please add at least one service for your shop",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate each service
    const invalidServices = formData.services.filter(
      service => !service.service.trim() || !service.price.trim()
    );
    
    if (invalidServices.length > 0) {
      Swal.fire({
        title: "Incomplete Services",
        text: "Please fill in both service name and price for all services",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Validate password for non-admin users
    if (!isAdmin && !formData.password) {
      Swal.fire({
        title: "Password Required",
        text: "Please enter a password for your account",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (!token) {
      Swal.fire({ 
        title: "Session Expired", 
        text: "Please login again to continue.", 
        icon: "error" 
      });
      navigate("/login");
      return;
    }

    let submissionLat = toCoordinateNumber(formData.lat);
    let submissionLng = toCoordinateNumber(formData.lng);
    let submissionCoordinateSource = formData.coordinatesSource || "device_gps";
    const hasCoordinates = isCoordinatePairValid(submissionLat, submissionLng);

    if (!hasCoordinates) {
      const gpsCaptured = await captureCurrentLocation({ showSuccessMessage: false });

      if (gpsCaptured) {
        submissionLat = gpsCaptured.lat;
        submissionLng = gpsCaptured.lng;
        submissionCoordinateSource = gpsCaptured.source;
      } else {
        Swal.fire({
          title: "Location Required",
          text: "Please capture your current location before submitting.",
          icon: "warning",
          confirmButtonColor: "#F59E0B",
        });
        return;
      }
    }

    // Show loading state (do not await this modal; it has no confirm button)
    Swal.fire({
      title: "Registering Shop",
      text: "Please wait while we register your shop...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        ...formData,
        lat: submissionLat,
        lng: submissionLng,
        coordinatesSource: submissionCoordinateSource,
      };

      const response = await api.post(`/shop/registershop`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      Swal.close();
      
      if (response.status === 201) {
        // Sync freshly created shop into LoginContext so profile reflects pending/approved state immediately.
        await refreshShopData();

        Swal.fire({ 
          title: "Success!", 
          html: `
            <div class="text-center">
              <p class="text-lg font-semibold text-green-600">Shop registered successfully!</p>
              <p class="text-gray-600 mt-2">You will be redirected shortly...</p>
            </div>
          `,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          navigate(isAdmin ? "/admin/shops" : "/");
        }, 2000);
      }
    } catch (err) {
      Swal.close();
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: "Registration Failed",
        html: `
          <div class="text-center">
            <p class="text-red-600 font-medium">${errorMessage}</p>
            ${err.response?.data?.details ? 
              `<p class="text-gray-600 text-sm mt-2">Details: ${err.response.data.details}</p>` : 
              ''
            }
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
            <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Shop Registration
            </p>
            <h1 className="text-3xl font-black text-slate-900 sm:text-3xl">Register Your Shop</h1>
            <p className="mt-2 text-base text-slate-600">
              Set up to start accepting bookings.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)]"
        >
          {/* Location Capture */}
          <div className="rounded-3xl border border-cyan-200/70 bg-white/90 p-5 sm:p-6 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.35)]">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Shop Location</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <button
                type="button"
                onClick={() => captureCurrentLocation()}
                disabled={isCapturingLocation}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-slate-950 transition ${
                  isCapturingLocation
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110"
                }`}
              >
                {isCapturingLocation
                  ? "Capturing Location..."
                  : isLocationCaptured
                  ? "Recapture Current Location"
                  : "Capture Current Location"}
              </button>
            </div>
            {isLocationCaptured && (
              <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 text-sm text-gray-700 space-y-3">
                <div>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all space-y-1">
                    <div><strong>Lat:</strong> {formatCoordinateLabel(formData.lat)}</div>
                    <div><strong>Lng:</strong> {formatCoordinateLabel(formData.lng)}</div>
                    {locationAccuracy !== null && (
                      <div><strong>Accuracy:</strong> {Math.round(locationAccuracy)}m</div>
                    )}
                    <div><strong>Source:</strong> {formData.coordinatesSource}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Details */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.35)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                  !isAdmin ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                }`}
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                  !isAdmin ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                }`}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone *"
                value={formData.phone}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                  !isAdmin ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                }`}
              />
              <input
                type="text"
                name="shopname"
                placeholder="Salon Name *"
                value={formData.shopname}
                onChange={handleInput}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
              />
              <select
                value={formData.state}
                onChange={handleStateChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
              >
                <option value="">Select State *</option>
                {Object.keys(stateDistrictCityData).map((state, i) => (
                  <option key={i} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <select
                value={formData.district}
                onChange={handleDistrictChange}
                disabled={!formData.state}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
              >
                <option value="">Select District *</option>
                {districts.map((d, i) => (
                  <option key={i} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={formData.city}
                onChange={handleCityChange}
                disabled={!formData.district}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
              >
                <option value="">Select City *</option>
                {cities.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="street"
                placeholder="Street Address *"
                value={formData.street}
                onChange={handleInput}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
              />
              
              {/* Pincode Input with Validation */}
              <div className="relative">
                <input
                  type="tel"
                  name="pin"
                  placeholder="Pincode * (6 digits)"
                  maxLength={6}
                  value={formData.pin}
                  onChange={handleInput}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    pinError ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {/* Character counter */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {formData.pin.length}/6
                </div>
                {/* Error message */}
                {pinError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{pinError}</p>
                )}
              </div>
              
                {!isAdmin && (
                  <input
                    type="password"
                    name="password"
                    placeholder="Login Password *"
                    required
                    value={formData.password}
                    onChange={handleInput}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
                  />
                )}
            </div>
            <p className="text-xs text-gray-500 mt-3">* Required fields</p>
          </div>

          {/* Services */}
          <div className="rounded-3xl border border-amber-200/70 bg-amber-50/70 p-5 sm:p-6 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.35)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Services & Pricing *</h3>
            {formData.services.map((service, i) => (
              <div
                key={i}
                className="bg-white/95 border border-amber-200 rounded-2xl p-4 mb-3 flex flex-col sm:flex-row gap-4"
              >
                <input
                  type="text"
                  name="service"
                  placeholder="Service Name *"
                  required
                  value={service.service}
                  onChange={(e) => handleServiceChange(e, i)}
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
                />
                <input
                  type="tel"
                  name="price"
                  placeholder="Price ₹ *"
                  required
                  value={service.price}
                  onChange={(e) => handleServiceChange(e, i)}
                  className="w-32 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 bg-white"
                />
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(i)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddService}
              className="bg-gradient-to-r from-cyan-500 to-amber-400 text-slate-950 px-4 py-2 rounded-lg font-black hover:brightness-110"
            >
              + Add Service
            </button>
            <p className="text-xs text-gray-500 mt-3">* At least one service with name and price is required</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isLocationCaptured || pinError}
            className={`w-full bg-gradient-to-r from-cyan-500 to-amber-400 text-slate-950 py-3 rounded-xl font-black ${
              !isLocationCaptured || pinError 
                ? "opacity-60 cursor-not-allowed" 
                : "hover:brightness-110"
            }`}
          >
            {isLocationCaptured
              ? isAdmin
                ? "Register Shop"
                : "Complete Registration"
              : "Capture Location First"}
          </button>
        </form>
      </div>
    </main>
  );
};



