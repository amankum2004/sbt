import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { stateDistrictCityData } from "../utils/locationData";
import Swal from "sweetalert2";
import { api } from "../utils/api";

const GOOGLE_GEOCODE_API_KEY =
  import.meta.env.VITE_GOOGLE_GEOCODE_API_KEY;
const GOOGLE_GEOCODE_ENDPOINT =
  "https://maps.googleapis.com/maps/api/geocode/json";
const MAX_LOCATION_SAMPLES = 6;
const TARGET_ACCURACY_METERS = 15;

const GOOGLE_COORDINATE_PATTERNS = [
  /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
  /(?:[?&](?:q|query|destination|origin|ll|center)=)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/,
];

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

const extractCoordinatesFromInput = (inputText) => {
  if (!inputText?.trim()) return null;

  let normalizedInput = inputText.trim();
  try {
    normalizedInput = decodeURIComponent(normalizedInput);
  } catch {
    // Keep original input if decoding fails.
  }

  for (const pattern of GOOGLE_COORDINATE_PATTERNS) {
    const match = normalizedInput.match(pattern);
    if (!match) continue;

    const latitude = toCoordinateNumber(match[1]);
    const longitude = toCoordinateNumber(match[2]);

    if (isCoordinatePairValid(latitude, longitude)) {
      return { lat: latitude, lng: longitude };
    }
  }

  return null;
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
  const [coordinateInput, setCoordinateInput] = useState("");
  const [pinError, setPinError] = useState(""); // State for pin validation error

  const getShopAddressString = () =>
    [
      formData.shopname,
      formData.street,
      formData.city,
      formData.district,
      formData.state,
      formData.pin,
      "India",
    ]
      .map((part) => part?.toString().trim())
      .filter(Boolean)
      .join(", ");

  const clearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      lat: null,
      lng: null,
      coordinatesSource: "fallback",
    }));
    setCoordinateInput("");
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

  const resolveCoordinatesWithGoogle = async ({ showSuccessMessage = true } = {}) => {
    const missingAddressFields = [];
    if (!formData.street?.trim()) missingAddressFields.push("Street");
    if (!formData.city?.trim()) missingAddressFields.push("City");
    if (!formData.district?.trim()) missingAddressFields.push("District");
    if (!formData.state?.trim()) missingAddressFields.push("State");
    if (!formData.pin?.trim()) missingAddressFields.push("Pincode");

    if (missingAddressFields.length > 0) {
      Swal.fire({
        title: "Address Incomplete",
        text: `Fill ${missingAddressFields.join(", ")} before fetching coordinates.`,
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return null;
    }

    if (!GOOGLE_GEOCODE_API_KEY) {
      Swal.fire({
        title: "API Key Missing",
        text: "Google Geocoding API key is not configured.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
      return null;
    }

    setIsCapturingLocation(true);
    Swal.fire({
      title: "Fetching Exact Coordinates",
      text: "Matching your shop address with Google Maps...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
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
      const latitude = toCoordinateNumber(bestResult.geometry?.location?.lat);
      const longitude = toCoordinateNumber(bestResult.geometry?.location?.lng);
      const locationType = bestResult.geometry?.location_type || "UNKNOWN";

      if (!isCoordinatePairValid(latitude, longitude)) {
        throw new Error("Invalid coordinates returned by Google Geocoding API");
      }

      applyCoordinates({
        lat: latitude,
        lng: longitude,
        source: "google_geocode",
      });

      Swal.close();
      if (showSuccessMessage) {
        Swal.fire({
          title: "Coordinates Updated",
          html: `
            <div class="text-left">
              <p class="text-sm text-slate-600 mb-2">Address matched from Google Maps.</p>
              <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
                <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${formatCoordinateLabel(latitude)}</p>
                <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${formatCoordinateLabel(longitude)}</p>
                <p class="font-mono text-xs break-all"><strong>Geocode:</strong> ${locationType}</p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Continue",
          confirmButtonColor: "#10B981",
          width: "550px",
        });
      }

      return { lat: latitude, lng: longitude, source: "google_geocode" };
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Unable To Get Coordinates",
        text: error.message || "Please verify address details and try again.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
      return null;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const applyCoordinatesFromInput = () => {
    const extractedCoordinates = extractCoordinatesFromInput(coordinateInput);

    if (!extractedCoordinates) {
      Swal.fire({
        title: "Invalid Coordinates",
        text: "Paste a valid Google Maps URL or coordinates like 28.49813148390656, 77.30870661381914",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    applyCoordinates({
      lat: extractedCoordinates.lat,
      lng: extractedCoordinates.lng,
      source: "manual_update",
    });

    Swal.fire({
      title: "Coordinates Applied",
      html: `
        <div class="text-left">
          <p class="text-sm text-slate-600 mb-2">Using manually provided precise coordinates.</p>
          <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
            <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${formatCoordinateLabel(extractedCoordinates.lat)}</p>
            <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${formatCoordinateLabel(extractedCoordinates.lng)}</p>
          </div>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#10B981",
    });
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
    setCoordinateInput("");
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
    setCoordinateInput("");
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
    setCoordinateInput("");
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
        const fallbackChoice = await Swal.fire({
          title: "Use Address-Based Coordinates?",
          text: "Current location could not be captured. Use Google address geocoding instead?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Use Address Coordinates",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#2563EB",
        });

        if (!fallbackChoice.isConfirmed) return;

        const resolvedCoordinates = await resolveCoordinatesWithGoogle({
          showSuccessMessage: false,
        });
        if (!resolvedCoordinates) return;

        submissionLat = resolvedCoordinates.lat;
        submissionLng = resolvedCoordinates.lng;
        submissionCoordinateSource = resolvedCoordinates.source;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white shadow-xl rounded-2xl p-6 sm:p-10"
        >
          {/* Location Capture */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Shop Location</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <button
                type="button"
                onClick={() => captureCurrentLocation()}
                disabled={isCapturingLocation}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white ${
                  isCapturingLocation
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCapturingLocation
                  ? "Capturing Location..."
                  : isLocationCaptured
                  ? "Recapture Current Location"
                  : "Capture Current Location"}
              </button>
              <button
                type="button"
                onClick={() => resolveCoordinatesWithGoogle()}
                disabled={isCapturingLocation}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-blue-700 border border-blue-300 bg-white hover:bg-blue-50"
              >
                Use Address Coordinates
              </button>
            </div>
            <div className="mb-3 rounded-lg border border-blue-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Precise Coordinate Input
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={coordinateInput}
                  onChange={(event) => setCoordinateInput(event.target.value)}
                  placeholder="Paste Google Maps URL or lat,lng"
                  className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={applyCoordinatesFromInput}
                  disabled={isCapturingLocation || !coordinateInput.trim()}
                  className="w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Apply Coordinates
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Example: <span className="font-mono">28.49813148390656, 77.30870661381914</span>
              </p>
            </div>
            {isLocationCaptured && (
              <div className="bg-white border border-blue-100 rounded-lg p-4 text-sm text-gray-700 space-y-3">
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
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
                  !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
                  !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone *"
                value={formData.phone}
                onChange={handleInput}
                readOnly={!isAdmin}
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
                  !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              <input
                type="text"
                name="shopname"
                placeholder="Salon Name *"
                value={formData.shopname}
                onChange={handleInput}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
              />
              <select
                value={formData.state}
                onChange={handleStateChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
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
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
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
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
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
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
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
                  className={`w-full border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
                    pinError ? "border-red-500" : "border-gray-200"
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
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">* Required fields</p>
          </div>

          {/* Services */}
          <div className="bg-green-50 rounded-xl p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Services & Pricing *</h3>
            {formData.services.map((service, i) => (
              <div
                key={i}
                className="bg-white border-2 border-green-100 rounded-lg p-4 mb-3 flex flex-col sm:flex-row gap-4"
              >
                <input
                  type="text"
                  name="service"
                  placeholder="Service Name *"
                  required
                  value={service.service}
                  onChange={(e) => handleServiceChange(e, i)}
                  className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200"
                />
                <input
                  type="tel"
                  name="price"
                  placeholder="Price ₹ *"
                  required
                  value={service.price}
                  onChange={(e) => handleServiceChange(e, i)}
                  className="w-32 border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200"
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
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              + Add Service
            </button>
            <p className="text-xs text-gray-500 mt-3">* At least one service with name and price is required</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isLocationCaptured || pinError}
            className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold ${
              !isLocationCaptured || pinError 
                ? "opacity-60 cursor-not-allowed" 
                : "hover:from-purple-700 hover:to-purple-800"
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
    </div>
  );
};




// import React, { useState, useEffect } from "react";
// import { useLogin } from "../components/LoginContext";
// import { useNavigate } from "react-router-dom";
// import { stateDistrictCityData } from "../utils/locationData";
// import Swal from "sweetalert2";
// import { api } from "../utils/api";

// const defaultFormData = {
//   name: "",
//   email: "",
//   phone: "",
//   password: "",
//   shopname: "",
//   state: "",
//   district: "",
//   city: "",
//   street: "",
//   pin: "",
//   services: [{ service: "", price: "" }],
//   lat: null,
//   lng: null,
//   latString: "", // New field for string storage
//   lngString: "", // New field for string storage
// };

// export const RegisterShop = () => {
//   const { user } = useLogin();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState(defaultFormData);
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [token, setToken] = useState(null);
//   const [location, setLocation] = useState({ lat: null, lng: null });
//   const [isLocationCaptured, setIsLocationCaptured] = useState(false);
//   const [isCapturingLocation, setIsCapturingLocation] = useState(false);
//   const [locationAccuracy, setLocationAccuracy] = useState(null);

//   // Function to store coordinates as strings with full precision
//   const storeHighPrecisionCoordinates = (latitude, longitude) => {
//     // Store as strings to preserve full precision
//     const latString = latitude.toString();
//     const lngString = longitude.toString();
    
//     // Also store as numbers for backward compatibility
//     const lat = Number(latitude);
//     const lng = Number(longitude);
    
//     // console.log("Full Precision Coordinates:");
//     // console.log("As String - Lat:", latString, "Lng:", lngString);
//     // console.log("As Number - Lat:", lat, "Lng:", lng);
//     // console.log("String length - Lat:", latString.length, "Lng:", lngString.length);
    
//     return { lat, lng, latString, lngString };
//   };

//   const captureLocation = () => {
//     if (!navigator.geolocation) {
//       Swal.fire({
//         title: "Geolocation Not Supported",
//         text: "Your browser doesn't support geolocation. Please use a modern browser.",
//         icon: "error",
//       });
//       return;
//     }

//     setIsCapturingLocation(true);
//     Swal.fire({
//       title: "Capturing Full Precision Location",
//       text: "Please allow location access for exact shop positioning...",
//       icon: "info",
//       showConfirmButton: false,
//       allowOutsideClick: false,
//       didOpen: () => Swal.showLoading(),
//     });

//     const geoOptions = {
//       enableHighAccuracy: true,
//       timeout: 30000,
//       maximumAge: 0
//     };

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude, accuracy } = position.coords;
        
//         // Store coordinates with full precision as strings
//         const preciseCoords = storeHighPrecisionCoordinates(latitude, longitude);
        
//         setLocation({ lat: preciseCoords.lat, lng: preciseCoords.lng });
//         setFormData((prev) => ({ 
//           ...prev, 
//           lat: preciseCoords.lat, 
//           lng: preciseCoords.lng,
//           latString: preciseCoords.latString,
//           lngString: preciseCoords.lngString
//         }));
//         setLocationAccuracy(accuracy);
//         setIsLocationCaptured(true);
//         setIsCapturingLocation(false);

//         Swal.fire({
//           title: "Full Precision Location Captured!",
//           html: `
//             <div class="text-left">
//               <div class="bg-gray-100 p-2 rounded mt-2 space-y-1">
//                 <p class="font-mono text-xs break-all"><strong>Lat:</strong> ${preciseCoords.latString}</p>
//                 <p class="font-mono text-xs break-all"><strong>Lng:</strong> ${preciseCoords.lngString}</p>
//               </div>
//             </div>
//           `,
//           icon: "success",
//           confirmButtonText: "Continue",
//           confirmButtonColor: "#10B981",
//           width: "550px"
//         });
//       },
//       (error) => {
//         setIsCapturingLocation(false);
//         let errorMessage = "Failed to capture location. Please try again.";
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage =
//               "Location access denied. Please allow location access in your browser settings.";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             errorMessage =
//               "Location information is unavailable. Please check your GPS and internet connection.";
//             break;
//           case error.TIMEOUT:
//             errorMessage =
//               "Location request timed out. Please try again in an open area with better network connectivity.";
//             break;
//         }
//         Swal.fire({
//           title: "Location Capture Failed",
//           text: errorMessage,
//           icon: "error",
//           showCancelButton: true,
//           confirmButtonText: "Try Again",
//           cancelButtonText: "Continue Without Location",
//           confirmButtonColor: "#3B82F6",
//         }).then((result) => {
//           if (result.isConfirmed) captureLocation();
//         });
//       },
//       geoOptions
//     );
//   };

//   useEffect(() => {
//     captureLocation();
//   }, []);

//   useEffect(() => {
//     const tokenString = localStorage.getItem("jwt_token");
//     if (tokenString) setToken(tokenString);
//     // if (tokenString) setToken(JSON.parse(tokenString));
//   }, []);

//   const isAdmin = user?.usertype === "admin";

//   useEffect(() => {
//     if (!isAdmin && user) {
//       setFormData((prev) => ({
//         ...prev,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       }));
//     }
//   }, [user, isAdmin]);

//   const handleInput = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleServiceChange = (e, index) => {
//     const updated = formData.services.map((s, i) =>
//       i === index ? { ...s, [e.target.name]: e.target.value } : s
//     );
//     setFormData({ ...formData, services: updated });
//   };

//   const handleAddService = () =>
//     setFormData({
//       ...formData,
//       services: [...formData.services, { service: "", price: "" }],
//     });

//   const handleRemoveService = (index) =>
//     setFormData({
//       ...formData,
//       services: formData.services.filter((_, i) => i !== index),
//     });

//   const handleStateChange = (e) => {
//     const state = e.target.value;
//     setFormData({ ...formData, state, district: "", city: "" });
//     setDistricts(Object.keys(stateDistrictCityData[state] || {}));
//     setCities([]);
//   };

//   const handleDistrictChange = (e) => {
//     const district = e.target.value;
//     setFormData({ ...formData, district, city: "" });
//     setCities(stateDistrictCityData[formData.state][district] || []);
//   };

//   const handleCityChange = (e) =>
//     setFormData({ ...formData, city: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!token) {
//       Swal.fire({ title: "Error", text: "Please login again.", icon: "error" });
//       return;
//     }
//     if (!formData.latString || !formData.lngString) {
//       const result = await Swal.fire({
//         title: "Location Not Captured",
//         text: "Location is required for accurate positioning. Capture location again?",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, Capture Location",
//         cancelButtonText: "Continue Anyway",
//         confirmButtonColor: "#3B82F6",
//       });
//       if (result.isConfirmed) {
//         captureLocation();
//         return;
//       }
//     }

//     // Log the coordinates being sent
//     // console.log("Submitting coordinates:", {
//     //   lat: formData.lat,
//     //   lng: formData.lng,
//     //   latString: formData.latString,
//     //   lngString: formData.lngString,
//     //   stringLength: {
//     //     lat: formData.latString?.length,
//     //     lng: formData.lngString?.length
//     //   }
//     // });

//     try {
//       const response = await api.post(`/shop/registershop`, formData, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//       });
//       if (response.status === 201) {
//         Swal.fire({ 
//           title: "Success!", 
//           html: `
//             <div class="text-left">
//               <p>Shop registered successfully!</p>
//             </div>
//           `,
//           icon: "success" 
//         });
//         navigate(isAdmin ? "/admin/shops" : "/");
//       }
//     } catch (err) {
//       console.error("Registration error:", err);
//       Swal.fire({
//         title: "Error",
//         text: err.response?.data?.message || "Registration failed",
//         icon: "error",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-5xl mx-auto mt-10">
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-8 bg-white shadow-xl rounded-2xl p-6 sm:p-10"
//         >
            
//           {/* Location Capture */}
//           <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-blue-800 mb-3">Shop Location</h3>
//             {/* <p className="text-sm text-blue-600 mb-4">
//               Coordinates will be stored as strings to preserve maximum precision (up to 15+ decimal places).
//             </p> */}
//             <button
//               type="button"
//               onClick={captureLocation}
//               disabled={isCapturingLocation}
//               className={`w-full sm:w-auto px-6 py-3 mb-3 rounded-lg font-medium text-white ${
//                 isCapturingLocation
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {isCapturingLocation
//                 ? "Capturing Location..."
//                 : isLocationCaptured
//                 ? "Recapture Location"
//                 : "Capture Location"}
//             </button>
//             {isLocationCaptured && (
//               <div className="bg-white border border-blue-100 rounded-lg p-4 text-sm text-gray-700 space-y-3">
//                 <div>
//                   {/* <strong className="text-green-600">Full Precision (Stored as String):</strong> */}
//                   <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all space-y-1">
//                     <div><strong>Lat:</strong> {formData.latString}</div>
//                     <div><strong>Lng:</strong> {formData.lngString}</div>
//                   </div>
//                 </div>
//                 {/* <div>
//                   <strong>Approximate (Number):</strong>
//                   <div className="text-xs text-gray-500 mt-1">
//                     Lat: {formData.lat}, Lng: {formData.lng}
//                   </div>
//                 </div> */}
//                 {/* <div>
//                   <strong>Accuracy:</strong> {Math.round(locationAccuracy)} meters{" "}
//                   {locationAccuracy > 10 && (
//                     <span className="text-yellow-600 text-xs">(Better precision recommended)</span>
//                   )}
//                 </div> */}
//               </div>
//             )}
//           </div>

//           {/* Rest of the form remains the same */}
//           {/* ... (Basic Details, Services sections remain unchanged) ... */}
//           {/* Basic Details */}
//           <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Full Name"
//                 value={formData.name}
//                 onChange={handleInput}
//                 readOnly={!isAdmin}
//                 className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
//                   !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
//                 }`}
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleInput}
//                 readOnly={!isAdmin}
//                 className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
//                   !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
//                 }`}
//               />
//               <input
//                 type="tel"
//                 name="phone"
//                 placeholder="Phone"
//                 value={formData.phone}
//                 onChange={handleInput}
//                 readOnly={!isAdmin}
//                 className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200 ${
//                   !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
//                 }`}
//               />
//               <input
//                 type="text"
//                 name="shopname"
//                 placeholder="Salon Name"
//                 value={formData.shopname}
//                 onChange={handleInput}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               />
//               <select
//                 value={formData.state}
//                 onChange={handleStateChange}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               >
//                 <option value="">Select State</option>
//                 {Object.keys(stateDistrictCityData).map((state, i) => (
//                   <option key={i} value={state}>
//                     {state}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={formData.district}
//                 onChange={handleDistrictChange}
//                 disabled={!formData.state}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               >
//                 <option value="">Select District</option>
//                 {districts.map((d, i) => (
//                   <option key={i} value={d}>
//                     {d}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={formData.city}
//                 onChange={handleCityChange}
//                 disabled={!formData.district}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               >
//                 <option value="">Select City</option>
//                 {cities.map((c, i) => (
//                   <option key={i} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="text"
//                 name="street"
//                 placeholder="Street Address"
//                 value={formData.street}
//                 onChange={handleInput}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               />
//               <input
//                 type="tel"
//                 name="pin"
//                 placeholder="Pin Code"
//                 maxLength={6}
//                 value={formData.pin}
//                 onChange={handleInput}
//                 className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//               />
//               {!isAdmin && (
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Login Password"
//                   required
//                   value={formData.password}
//                   onChange={handleInput}
//                   className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-200"
//                 />
//               )}
//             </div>
//           </div>

//           {/* Services */}
//           <div className="bg-green-50 rounded-xl p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-green-800 mb-4">Services & Pricing</h3>
//             {formData.services.map((service, i) => (
//               <div
//                 key={i}
//                 className="bg-white border-2 border-green-100 rounded-lg p-4 mb-3 flex flex-col sm:flex-row gap-4"
//               >
//                 <input
//                   type="text"
//                   name="service"
//                   placeholder="Service Name"
//                   required
//                   value={service.service}
//                   onChange={(e) => handleServiceChange(e, i)}
//                   className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200"
//                 />
//                 <input
//                   type="tel"
//                   name="price"
//                   placeholder="Price ₹"
//                   required
//                   value={service.price}
//                   onChange={(e) => handleServiceChange(e, i)}
//                   className="w-32 border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200"
//                 />
//                 {formData.services.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveService(i)}
//                     className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={handleAddService}
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//             >
//               + Add Service
//             </button>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={!isLocationCaptured}
//             className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold ${
//               !isLocationCaptured ? "opacity-60 cursor-not-allowed" : "hover:from-purple-700 hover:to-purple-800"
//             }`}
//           >
//             {isLocationCaptured
//               ? isAdmin
//                 ? "Register Shop"
//                 : "Complete Registration"
//               : "Capture Full Precision Location First"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };



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
//     const [isLocationCaptured, setIsLocationCaptured] = useState(false);
//     const [isCapturingLocation, setIsCapturingLocation] = useState(false);
//     const [locationAccuracy, setLocationAccuracy] = useState(null);

//     // High-precision location capture function
//     const captureLocation = () => {
//         if (!navigator.geolocation) {
//             Swal.fire({
//                 title: "Geolocation Not Supported",
//                 text: "Your browser doesn't support geolocation. Please use a modern browser.",
//                 icon: "error"
//             });
//             return;
//         }

//         setIsCapturingLocation(true);
        
//         Swal.fire({
//             title: 'Capturing High-Precision Location',
//             text: 'Please allow location access for exact shop positioning...',
//             icon: 'info',
//             showConfirmButton: false,
//             allowOutsideClick: false,
//             didOpen: () => {
//                 Swal.showLoading();
//             }
//         });

//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const { latitude, longitude, accuracy } = position.coords;
                
//                 // Store coordinates with maximum precision (up to 15 decimal places)
//                 const preciseLat = latitude; // Full precision
//                 const preciseLng = longitude; // Full precision
                
//                 setLocation({ 
//                     lat: preciseLat, 
//                     lng: preciseLng 
//                 });
                
//                 setFormData((prevFormData) => ({
//                     ...prevFormData,
//                     lat: preciseLat,
//                     lng: preciseLng
//                 }));
                
//                 setLocationAccuracy(accuracy);
//                 setIsLocationCaptured(true);
//                 setIsCapturingLocation(false);
                
//                 Swal.fire({
//                     title: "High-Precision Location Captured!",
//                     html: `
//                         <div class="text-left">
//                             <p><strong>Exact Coordinates:</strong></p>
//                             <p class="text-sm font-mono">Latitude: ${preciseLat}</p>
//                             <p class="text-sm font-mono">Longitude: ${preciseLng}</p>
//                             <p class="mt-2"><strong>Accuracy:</strong> ${Math.round(accuracy)} meters</p>
//                             ${accuracy > 10 ? 
//                                 '<p class="text-yellow-600 mt-2">⚠️ For best results, move to an open area and recapture location.</p>' : 
//                                 '<p class="text-green-600 mt-2">✓ Excellent location precision</p>'
//                             }
//                         </div>
//                     `,
//                     icon: "success",
//                     confirmButtonText: "Perfect!",
//                     confirmButtonColor: "#10B981",
//                     width: 500
//                 });
                
//                 console.log("High-precision coordinates captured:", {
//                     lat: preciseLat,
//                     lng: preciseLng,
//                     accuracy: accuracy
//                 });
//             },
//             (error) => {
//                 console.error("Geolocation error:", error);
//                 setIsCapturingLocation(false);
                
//                 let errorMessage = "Failed to capture location. Please try again.";
//                 switch(error.code) {
//                     case error.PERMISSION_DENIED:
//                         errorMessage = "Location access denied. Please allow location access in your browser settings and try again.";
//                         break;
//                     case error.POSITION_UNAVAILABLE:
//                         errorMessage = "Location information is unavailable. Please check your internet connection and GPS.";
//                         break;
//                     case error.TIMEOUT:
//                         errorMessage = "Location request timed out. Please try again in a better network area.";
//                         break;
//                 }
                
//                 Swal.fire({
//                     title: "Location Capture Failed",
//                     text: errorMessage,
//                     icon: "error",
//                     confirmButtonText: "Try Again",
//                     confirmButtonColor: "#EF4444",
//                     showCancelButton: true,
//                     cancelButtonText: "Continue Without Location"
//                 }).then((result) => {
//                     if (result.isConfirmed) {
//                         captureLocation();
//                     }
//                 });
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 20000, // Longer timeout for better accuracy
//                 maximumAge: 0
//             }
//         );
//     };

//     // Auto-capture location on component mount
//     useEffect(() => {
//         captureLocation();
//     }, []);

//     // Manual location capture function
//     const handleManualLocationCapture = () => {
//         if (isCapturingLocation) return;
//         captureLocation();
//     };

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
        
//         if (!token) {
//             Swal.fire({
//                 title: "Error",
//                 text: "Authentication token missing. Please login again.",
//                 icon: "error"
//             });
//             return;
//         }

//         if (!formData.lat || !formData.lng) {
//             const result = await Swal.fire({
//                 title: "Location Not Captured",
//                 text: "Your shop location is required for customers to find you. Do you want to try capturing location again?",
//                 icon: "warning",
//                 showCancelButton: true,
//                 confirmButtonText: "Yes, Capture Location",
//                 cancelButtonText: "Continue Anyway",
//                 confirmButtonColor: "#10B981",
//                 cancelButtonColor: "#6B7280"
//             });
            
//             if (result.isConfirmed) {
//                 captureLocation();
//                 return;
//             }
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

//         // Validate services
//         const invalidServices = formData.services.filter(service => 
//             !service.service.trim() || !service.price.trim()
//         );
        
//         if (invalidServices.length > 0) {
//             Swal.fire({ 
//                 title: "Error", 
//                 text: "Please fill all service names and prices", 
//                 icon: "error" 
//             });
//             return;
//         }

//         console.log("FormData with high-precision coordinates:", {
//             ...formData,
//             coordinates: `Lat: ${formData.lat}, Lng: ${formData.lng}`
//         });

//         try {
//             const response = await api.post(`/shop/registershop`, formData, {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.status === 201) {
//                 Swal.fire({ 
//                     title: "Success!", 
//                     text: "Shop registration successful", 
//                     icon: "success",
//                     confirmButtonText: "Great!",
//                     confirmButtonColor: "#10B981"
//                 });
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
//             <div className="max-w-6xl mx-auto mt-10">
//                 {/* Header Section */}
//                 {/* <div className="text-center mb-6">
//                     <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 mt-10">
//                         {isAdmin ? "Register New Shop" : "Shop Registration"}
//                     </h1>
//                     <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-12">
//                         {isAdmin ? "Add a new shop to the system with complete details" : "Complete your salon registration to start accepting bookings"}
//                     </p>
//                 </div> */}

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
//                         {/* High-Precision Location Capture Section */}
//                         <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border-2 border-blue-200">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="flex items-center">
//                                     <div className="bg-blue-100 rounded-full p-3 mr-4">
//                                         <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         </svg>
//                                     </div>
//                                     <div>
//                                         <h3 className="text-xl font-semibold text-gray-800">Exact Shop Location</h3>
//                                         <p className="text-sm text-gray-600">High-precision coordinates for accurate customer navigation</p>
//                                     </div>
//                                 </div>
//                                 <button 
//                                     type="button"
//                                     onClick={handleManualLocationCapture}
//                                     disabled={isCapturingLocation}
//                                     className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md ${
//                                         isCapturingLocation 
//                                             ? 'bg-gray-400 cursor-not-allowed text-white' 
//                                             : 'bg-blue-500 hover:bg-blue-600 text-white'
//                                     }`}
//                                 >
//                                     {isCapturingLocation ? (
//                                         <>
//                                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             <span>Capturing...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                             </svg>
//                                             <span>{isLocationCaptured ? 'Recapture' : 'Capture Location'}</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
                            
//                             <div className="bg-white rounded-lg p-4 border border-blue-100">
//                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                                     <div className="flex-1">
//                                         <div className="text-sm font-medium text-gray-700 mb-2">Current Location Status:</div>
//                                         {isLocationCaptured ? (
//                                             <div className="space-y-2">
//                                                 <div className="flex items-center text-green-600">
//                                                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                                                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                                     </svg>
//                                                     <span className="font-medium">Location Captured</span>
//                                                 </div>
//                                                 <div className="text-xs font-mono text-gray-600 ml-6 bg-gray-50 p-2 rounded">
//                                                     <div>Latitude: {location.lat}</div>
//                                                     <div>Longitude: {location.lng}</div>
//                                                 </div>
//                                                 {locationAccuracy && (
//                                                     <div className="text-xs text-gray-500 ml-6">
//                                                         Accuracy: {Math.round(locationAccuracy)} meters
//                                                         {locationAccuracy > 10 && (
//                                                             <span className="text-yellow-600 ml-2">(Consider recapturing for better precision)</span>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center text-yellow-600">
//                                                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                                                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                                                 </svg>
//                                                 <span>Location not captured yet</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                     {isLocationCaptured && (
//                                         <div className="mt-2 sm:mt-0">
//                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                                 ✓ Exact Location Ready
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 {!isLocationCaptured && (
//                                     <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
//                                         <p className="text-sm text-yellow-700">
//                                             <strong>Important:</strong> For exact customer navigation, capture your shop location with high precision. 
//                                             Ensure you're at the exact shop location when capturing.
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Rest of your form remains the same */}
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
//                                 className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
//                                     !isLocationCaptured ? 'opacity-70 cursor-not-allowed' : ''
//                                 }`}
//                                 disabled={!isLocationCaptured}
//                             >
//                                 {isLocationCaptured ? 
//                                     (isAdmin ? "Register Shop" : "Complete Registration") : 
//                                     "Capture Location First"
//                                 }
//                             </button>
//                             {!isLocationCaptured && (
//                                 <p className="text-center text-red-600 text-sm mt-2">
//                                     Please capture your exact shop location before submitting
//                                 </p>
//                             )}
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     )
// };









