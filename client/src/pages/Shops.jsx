import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { FaMapMarkerAlt, FaStore, FaUser, FaPhone, FaRoad, FaCity, FaMapPin } from "react-icons/fa";
import { stateDistrictCityData } from "../utils/locationData";
import { useLoading } from "../components/Loading";
import StarRating from "../components/StarRating";
import {
  buildDirectionsLinksFromShop,
  hasValidCoordinates,
  toCoordinateNumber,
} from "../utils/googleMaps";

const USER_LOCATION_STORAGE_KEY = "salonhub_user_location";
const LOCATION_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export const Shops = () => {
  const [shop, setShop] = useState([]);
  const [rawShops, setRawShops] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const cached = localStorage.getItem(USER_LOCATION_STORAGE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      const cachedLat = toCoordinateNumber(parsed?.lat);
      const cachedLng = toCoordinateNumber(parsed?.lng);
      const cachedTimestamp = Number(parsed?.timestamp);

      if (!Number.isFinite(cachedLat) || !Number.isFinite(cachedLng)) return null;
      if (Number.isFinite(cachedTimestamp) && Date.now() - cachedTimestamp > LOCATION_CACHE_TTL_MS) {
        return null;
      }

      return { lat: cachedLat, lng: cachedLng };
    } catch {
      return null;
    }
  });
  const [directionsModal, setDirectionsModal] = useState({
    isOpen: false,
    embedUrl: "",
    webUrl: "#",
    shopName: "",
  });
  const { showLoading, hideLoading } = useLoading();

  const openDirections = (shopData) => {
    const { embedUrl, webUrl } = buildDirectionsLinksFromShop({
      shop: shopData,
      userLocation,
    });

    // If we have an embed URL, open the modal with both embed and web URL
    if (embedUrl) {
      setDirectionsModal({
        isOpen: true,
        embedUrl,
        webUrl: webUrl || "#", // Ensure webUrl is set (fallback to "#" if invalid)
        shopName: shopData?.shopname || "Shop",
      });
      return;
    }

    // If no embed URL but we have a valid web URL, open it directly
    if (webUrl && webUrl !== "#") {
      window.open(webUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // No valid directions available
    alert("Unable to get directions. Please try again.");
  };

  const closeDirectionsModal = () => {
    setDirectionsModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setDistricts(Object.keys(stateDistrictCityData[state] || {}));
    setSelectedDistrict("");
    setSelectedCity("");
  };

  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setCities(stateDistrictCityData[selectedState][district] || []);
    setSelectedCity("");
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    // Normalize all coordinates to ensure they are finite numbers
    const normalizedLat1 = toCoordinateNumber(lat1);
    const normalizedLon1 = toCoordinateNumber(lon1);
    const normalizedLat2 = toCoordinateNumber(lat2);
    const normalizedLon2 = toCoordinateNumber(lon2);

    // Return Infinity if any coordinate is invalid
    if (!Number.isFinite(normalizedLat1) || !Number.isFinite(normalizedLon1) || 
        !Number.isFinite(normalizedLat2) || !Number.isFinite(normalizedLon2)) {
      return Infinity;
    }

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(normalizedLat2 - normalizedLat1);
    const dLon = toRad(normalizedLon2 - normalizedLon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(normalizedLat1)) *
        Math.cos(toRad(normalizedLat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const applyDistanceToShops = (shopsList, location) => {
    if (!Array.isArray(shopsList)) return [];

    const locationLat = toCoordinateNumber(location?.lat);
    const locationLng = toCoordinateNumber(location?.lng);
    const hasLocation = Number.isFinite(locationLat) && Number.isFinite(locationLng);

    if (!hasLocation) {
      return shopsList;
    }

    return shopsList
      .map((entry) => {
        const hasCoordinates =
          Number.isFinite(toCoordinateNumber(entry.lat)) && Number.isFinite(toCoordinateNumber(entry.lng));
        const distance = hasCoordinates
          ? getDistance(locationLat, locationLng, entry.lat, entry.lng)
          : Infinity;
        return { ...entry, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  const getAllShopsData = async () => {
    try {
      showLoading('Fetching shops...');
      
      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedCity) params.city = selectedCity;

      const response = await api.get(`/shop/approvedshops`, { params });
      const payload = response.data;
      let shops = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.shops)
        ? payload.shops
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      // Normalize coordinates so distance sorting and directions work
      // even when backend returns Decimal-like coordinate objects.
      shops = shops.map((entry) => {
        const normalizedLat = toCoordinateNumber(entry?.lat);
        const normalizedLng = toCoordinateNumber(entry?.lng);

        return {
          ...entry,
          lat: normalizedLat,
          lng: normalizedLng,
        };
      });

      // Debug: Log shops with their coordinates
      console.log("🏪 Shops Loaded:", shops.map(s => ({
        name: s.shopname,
        lat: s.lat,
        lng: s.lng,
      })));

      setRawShops(shops);
      setShop(applyDistanceToShops(shops, userLocation));
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      setShop([]);
      setRawShops([]);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = toCoordinateNumber(position.coords.latitude);
          const longitude = toCoordinateNumber(position.coords.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            setUserLocation(null);
            return;
          }

          const nextLocation = { lat: latitude, lng: longitude };
          setUserLocation(nextLocation);
          localStorage.setItem(
            USER_LOCATION_STORAGE_KEY,
            JSON.stringify({ ...nextLocation, timestamp: Date.now() })
          );

          // Debug: Log your device's current location
          console.log("🟢 Your Device Location:", {
            lat: latitude,
            lng: longitude,
            accuracy: position.coords.accuracy + " meters",
            timestamp: new Date(position.timestamp).toLocaleString(),
          });
        },
        (error) => {
          console.warn("❌ Location permission denied.", error);
          setUserLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!rawShops.length) return;
    setShop(applyDistanceToShops(rawShops, userLocation));
  }, [rawShops, userLocation]);

  useEffect(() => {
    getAllShopsData();
  }, [selectedState, selectedDistrict, selectedCity]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 py-4 px-4 sm:px-6 lg:px-8">
  <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
  <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
  <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="text-center mb-2">
      <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
        Nearby Salons
      </p>
      <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Best Salons In Your Area</h1>
      <p className="mt-1 text-sm text-slate-600">Filter by location and book your preferred salon.</p>
    </div>

    {/* Location Filter */}
    <div className="rounded-2xl border border-white/80 bg-white/90 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-4 mb-4">
      <div className="space-y-2">
        {[
          { label: "State", value: selectedState, onChange: handleStateChange, options: Object.keys(stateDistrictCityData), disabled: false },
          { label: "District", value: selectedDistrict, onChange: handleDistrictChange, options: districts, disabled: !selectedState },
          { label: "City", value: selectedCity, onChange: handleCityChange, options: cities, disabled: !selectedDistrict },
        ].map((dropdown, i) => (
          <div key={i} className="flex items-center gap-4 w-full">
            <label className="text-gray-700 font-medium text-sm whitespace-nowrap min-w-[80px]">
              {dropdown.label}:
            </label>
            <select
              value={dropdown.value}
              onChange={dropdown.onChange}
              disabled={dropdown.disabled}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700 bg-white"
            >
              <option value="">Select {dropdown.label}</option>
              {dropdown.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>

    {/* Results Count */}
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-800">
        Available Shops {shop.length > 0 && <span className="text-cyan-700">({shop.length})</span>}
      </h2>
      {userLocation && (
        <p className="text-gray-600 text-sm mt-0.5">
          Nearest shops from your location
        </p>
      )}
    </div>

    {/* Shops Grid */}
    {shop.length === 0 ? (
      <div className="rounded-2xl border border-white/80 bg-white/90 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] p-8 text-center">
        <div className="text-gray-300 text-5xl mb-3">🏪</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Shops Found</h3>
        <p className="text-gray-500 text-sm">
          {selectedState || selectedDistrict || selectedCity 
            ? "Try different location filters"
            : "No shops available yet"
          }
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shop.map((curShop, index) => (
          <div key={index} className="rounded-2xl border border-white/80 bg-white/90 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.45)] hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Shop Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-50 rounded-lg">
                    <FaStore className="text-cyan-700 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 truncate">
                      {curShop.shopname}
                    </h3>
                    {userLocation && Number.isFinite(curShop.distance) && curShop.distance !== Infinity && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        {curShop.distance < 1 
                          ? `${(curShop.distance * 1000).toFixed(0)}m away` 
                          : `${curShop.distance.toFixed(1)}km away`
                        }
                      </p>
                    )}
                  </div>
                </div>
                {curShop.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    curShop.status === 'open' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : curShop.status === 'break'
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {curShop.status === 'open' ? 'Open' : 
                     curShop.status === 'break' ? 'Break' : 'Closed'}
                  </span>
                )}
              </div>

              {/* Ratings Section - Compact */}
              <div className="mt-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-500">
                          {star <= (curShop.averageRating || 0) 
                            ? '★' 
                            : star <= (curShop.averageRating || 0) + 0.5 
                            ? '★' 
                            : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      {curShop.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({curShop.totalReviews || 0})
                    </span>
                  </div>
                  
                  {/* Rating badge - only show for high ratings */}
                  {curShop.averageRating >= 4.5 && (
                    <span className="bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200">
                      ⭐ Top
                    </span>
                  )}
                </div>
                
                {/* Rating breakdown preview - only on desktop */}
                <div className="hidden sm:block text-xs text-gray-500 mt-1">
                  {curShop.ratingBreakdown?.[5] || 0} five-star reviews
                </div>
              </div>

              {/* Owner Info */}
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <div className="flex items-center space-x-2 mr-6">
                  <FaUser className="text-gray-400 text-sm" />
                  <span className="font-medium truncate max-w-[80px]">{curShop.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-400 text-sm" />
                  <span className="font-medium">{curShop.phone}</span>
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-2 text-sm">
                {/* Location Details */}
                <div className="space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <FaRoad className="text-gray-400 text-sm mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">Street:</span> {curShop.street}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FaMapPin className="text-gray-400 text-sm mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">Area:</span> {`${curShop.city}, ${curShop.district}`}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-gray-400 text-sm mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">State:</span> {curShop.state} • {curShop.pin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex gap-2">
                    {/* Directions Button */}
                    {hasValidCoordinates(curShop.lat, curShop.lng) && (
                      <button
                        type="button"
                        onClick={() => openDirections(curShop)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg transition-colors text-sm font-medium border border-cyan-200"
                        title="Get directions"
                      >
                        <FaMapMarkerAlt className="text-sm" />
                        <span>Directions</span>
                      </button>
                    )}
                    
                    {/* Book Button */}
                    <Link
                      to={`/nearbyShops/${curShop._id}/shopinfo`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-400 hover:brightness-110 text-slate-950 rounded-lg transition-all duration-200 text-sm font-black shadow-sm hover:shadow"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  {directionsModal.isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/30 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">
            Directions to {directionsModal.shopName}
          </h3>
          <button
            type="button"
            onClick={closeDirectionsModal}
            className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="aspect-[16/10] w-full bg-slate-100">
          <iframe
            title={`Directions to ${directionsModal.shopName}`}
            src={directionsModal.embedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          {directionsModal.webUrl && directionsModal.webUrl !== "#" ? (
            <a
              href={directionsModal.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
            >
              Get Directions
            </a>
          ) : (
            <span className="text-sm text-gray-500">
              Directions not available for this location
            </span>
          )}
        </div>
      </div>
    </div>
  )}
</div>
  );
};






