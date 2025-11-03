import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { FaMapMarkerAlt, FaStore, FaUser, FaPhone, FaRoad, FaCity, FaMapPin } from "react-icons/fa";
import { stateDistrictCityData } from "../utils/locationData";
import { useLoading } from "../components/Loading";

export const Shops = () => {
  const [shop, setShop] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  // High-precision directions function
  const getHighPrecisionDirectionsUrl = (shop) => {
    if (!shop.lat || !shop.lng) return "#";
    
    // Use exact coordinates for precise navigation
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}&destination_place_id=&travelmode=driving&dir_action=navigate`;
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
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getAllShopsData = async () => {
    try {
      showLoading('Fetching shops...');
      
      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedCity) params.city = selectedCity;

      const response = await api.get(`/shop/approvedshops`, { params });
      let shops = response.data;

      // Log coordinates for debugging
      console.log("Shops with high-precision coordinates:", shops.map(s => ({
        name: s.shopname,
        lat: s.lat,
        lng: s.lng,
        directionsUrl: getHighPrecisionDirectionsUrl(s)
      })));

      if (userLocation) {
        shops = shops.map((shop) => {
          const distance = shop.lat && shop.lng
            ? getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
            : Infinity;
          return { ...shop, distance };
        }).sort((a, b) => a.distance - b.distance);
      }

      setShop(shops);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location permission denied.", error);
          setUserLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    getAllShopsData();
  }, [selectedState, selectedDistrict, selectedCity, userLocation]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mt-10">Find Nearby Shops</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Best salons and barber shops in your area.
          </p>
        </div>

        {/* Location Filter */}
<div className="bg-white rounded-lg shadow-md p-6 mb-6">
  <div className="space-y-3">
    {[
      { label: "State", value: selectedState, onChange: handleStateChange, options: Object.keys(stateDistrictCityData), disabled: false },
      { label: "District", value: selectedDistrict, onChange: handleDistrictChange, options: districts, disabled: !selectedState },
      { label: "City", value: selectedCity, onChange: handleCityChange, options: cities, disabled: !selectedDistrict },
    ].map((dropdown, i) => (
      <div key={i} className="flex items-center gap-3 w-full">
        <label className="text-gray-700 font-medium w-24">{dropdown.label}</label>
        <select
          value={dropdown.value}
          onChange={dropdown.onChange}
          disabled={dropdown.disabled}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          <option value="">{`-- Select ${dropdown.label} --`}</option>
          {dropdown.options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    ))}
  </div>
</div>


        {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <label className="block text-gray-700 font-medium min-w-[80px]">State</label>
              <select 
                value={selectedState} 
                onChange={handleStateChange} 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select State --</option>
                {Object.keys(stateDistrictCityData).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="block text-gray-700 font-medium min-w-[80px]">District</label>
              <select 
                value={selectedDistrict} 
                onChange={handleDistrictChange} 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedState}
              >
                <option value="">-- Select District --</option>
                {districts.map((district, i) => (
                  <option key={i} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="block text-gray-700 font-medium min-w-[80px]">City</label>
              <select 
                value={selectedCity} 
                onChange={handleCityChange} 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedDistrict}
              >
                <option value="">-- Select City --</option>
                {cities.map((city, i) => (
                  <option key={i} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div> */}

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Shops {shop.length > 0 && `(${shop.length})`}
          </h2>
          {userLocation && (
            <p className="text-gray-600 mt-1">
              Sorted by distance from your location
            </p>
          )}
        </div>

        {/* Shops Grid */}
        {shop.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shops Found</h3>
            <p className="text-gray-500">
              {selectedState || selectedDistrict || selectedCity 
                ? "No shops found for your selected location. Try different filters."
                : "No shops available in the system yet."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shop.map((curShop, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                {/* Shop Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaStore className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">
                          {curShop.shopname}
                        </h3>
                        {/* {userLocation && curShop.distance && curShop.distance !== Infinity && (
                          <p className="text-sm text-green-600 font-medium">
                            {curShop.distance < 1 
                              ? `${(curShop.distance * 1000).toFixed(0)}m away` 
                              : `${curShop.distance.toFixed(1)}km away`
                            }
                          </p>
                        )} */}
                      </div>
                    </div>
                    {curShop.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        curShop.status === 'open' 
                          ? 'bg-green-100 text-green-800'
                          : curShop.status === 'break'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {curShop.status === 'open' ? '✅ Open' : 
                         curShop.status === 'break' ? '⏸️ Break' : '❌ Closed'}
                      </span>
                    )}
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center text-gray-600">
                    <div className="flex items-center space-x-2 mr-10">
                      <FaUser className="text-gray-400" />
                      <span className="font-medium">{curShop.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-gray-400" />
                      <span className="font-medium">{curShop.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shop Details */}
                <div className="p-6 space-y-1">
                  {/* Location Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FaRoad className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Street:</span> {curShop.street},{curShop.pin}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMapPin className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">State:</span> {`${curShop.state}, ${curShop.district}, ${curShop.city}`}
                      </span>
                    </div>
                    {/* <div className="flex items-center space-x-2">
                      <FaCity className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">City:</span> {curShop.city}
                      </span>
                    </div> */}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {/* Directions Button */}
                        {curShop.lat && curShop.lng && (
                          <a
                            href={getHighPrecisionDirectionsUrl(curShop)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                            title="Get directions"
                          >
                            <FaMapMarkerAlt className="text-sm" />
                            <span>Directions</span>
                          </a>
                        )}
                        
                        {/* Book Button */}
                        <Link
                          to={`/nearbyShops/${curShop._id}/shopinfo`}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
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
    </div>
  );
};







// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { api } from "../utils/api";
// import { FaMapMarkerAlt, FaStore, FaUser, FaPhone, FaRoad, FaCity, FaMapPin, FaExternalLinkAlt } from "react-icons/fa";
// import { stateDistrictCityData } from "../utils/locationData";
// import { useLoading } from "../components/Loading";
// import { getMapMyIndiaDirectionsUrl, getMapMyIndiaStaticMapUrl, getOpenStreetMapEmbedUrl, getOpenStreetMapViewUrl } from "../utils/mapMyIndia";

// export const Shops = () => {
//   const [shop, setShop] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const { showLoading, hideLoading } = useLoading();

//   // Map modal state
//   const [showMapModal, setShowMapModal] = useState(false);
//   const [selectedShopForMap, setSelectedShopForMap] = useState(null);
//   const [useOpenStreetMap, setUseOpenStreetMap] = useState(true);

//   // Get directions URL
//   const getDirectionsUrl = (shop) => {
//     return getMapMyIndiaDirectionsUrl(shop, userLocation);
//   };

//   // Handle showing map
//   const handleShowMap = (shop) => {
//     setSelectedShopForMap(shop);
//     setShowMapModal(true);
//   };

//   // Get map embed URL based on preference
//   const getMapEmbedUrl = (shop) => {
//     return useOpenStreetMap 
//       ? getOpenStreetMapEmbedUrl(shop)
//       : getMapMyIndiaStaticMapUrl(shop, 600, 400);
//   };

//   // Get external map view URL
//   const getExternalMapUrl = (shop) => {
//     return useOpenStreetMap
//       ? getOpenStreetMapViewUrl(shop)
//       : `https://maps.mapmyindia.com/@${shop.lat},${shop.lng},15z`;
//   };

//   const handleStateChange = (event) => {
//     const state = event.target.value;
//     setSelectedState(state);
//     setDistricts(Object.keys(stateDistrictCityData[state] || {}));
//     setSelectedDistrict("");
//     setSelectedCity("");
//   };

//   const handleDistrictChange = (event) => {
//     const district = event.target.value;
//     setSelectedDistrict(district);
//     setCities(stateDistrictCityData[selectedState][district] || []);
//     setSelectedCity("");
//   };

//   const handleCityChange = (event) => {
//     setSelectedCity(event.target.value);
//   };

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     const toRad = (value) => (value * Math.PI) / 180;
//     const R = 6371; // km
//     const dLat = toRad(lat2 - lat1);
//     const dLon = toRad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(lat1)) *
//         Math.cos(toRad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const getAllShopsData = async () => {
//     try {
//       showLoading('Fetching shops...');
      
//       const params = {};
//       if (selectedState) params.state = selectedState;
//       if (selectedDistrict) params.district = selectedDistrict;
//       if (selectedCity) params.city = selectedCity;

//       const response = await api.get(`/shop/approvedshops`, { params });
//       let shops = response.data;

//       // Log coordinates for debugging
//       console.log("Shops with coordinates:", shops.map(s => ({
//         name: s.shopname,
//         lat: s.lat,
//         lng: s.lng,
//         latString: s.latString,
//         lngString: s.lngString,
//         directionsUrl: getDirectionsUrl(s)
//       })));

//       if (userLocation) {
//         shops = shops.map((shop) => {
//           const distance = shop.lat && shop.lng
//             ? getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
//             : Infinity;
//           return { ...shop, distance };
//         }).sort((a, b) => a.distance - b.distance);
//       }

//       setShop(shops);
//     } catch (error) {
//       console.error("Failed to fetch shops:", error);
//     } finally {
//       hideLoading();
//     }
//   };

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.warn("Location permission denied.", error);
//           setUserLocation(null);
//         }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     getAllShopsData();
//   }, [selectedState, selectedDistrict, selectedCity, userLocation]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-2">
//           <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-2">Find Nearby Shops</h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Discover the best salons and barber shops in your area. Filter by location to find shops near you.
//           </p>
//         </div>

//         {/* Location Filter */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Location</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">State</label>
//               <select 
//                 value={selectedState} 
//                 onChange={handleStateChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">-- Select State --</option>
//                 {Object.keys(stateDistrictCityData).map((state) => (
//                   <option key={state} value={state}>{state}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">District</label>
//               <select 
//                 value={selectedDistrict} 
//                 onChange={handleDistrictChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={!selectedState}
//               >
//                 <option value="">-- Select District --</option>
//                 {districts.map((district, i) => (
//                   <option key={i} value={district}>{district}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">City</label>
//               <select 
//                 value={selectedCity} 
//                 onChange={handleCityChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={!selectedDistrict}
//               >
//                 <option value="">-- Select City --</option>
//                 {cities.map((city, i) => (
//                   <option key={i} value={city}>{city}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Available Shops {shop.length > 0 && `(${shop.length})`}
//           </h2>
//           {userLocation && (
//             <p className="text-gray-600 mt-1">
//               Sorted by distance from your location
//             </p>
//           )}
//         </div>

//         {/* Shops Grid */}
//         {shop.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <div className="text-gray-400 text-6xl mb-4">🏪</div>
//             <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shops Found</h3>
//             <p className="text-gray-500">
//               {selectedState || selectedDistrict || selectedCity 
//                 ? "No shops found for your selected location. Try different filters."
//                 : "No shops available in the system yet."
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {shop.map((curShop, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
//                 {/* Shop Header */}
//                 <div className="p-6 border-b border-gray-100">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <FaStore className="text-blue-600 text-xl" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">
//                           {curShop.shopname}
//                         </h3>
//                         {userLocation && curShop.distance && curShop.distance !== Infinity && (
//                           <p className="text-sm text-green-600 font-medium">
//                             {curShop.distance < 1 
//                               ? `${(curShop.distance * 1000).toFixed(0)}m away` 
//                               : `${curShop.distance.toFixed(1)}km away`
//                             }
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     {curShop.status && (
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         curShop.status === 'open' 
//                           ? 'bg-green-100 text-green-800'
//                           : curShop.status === 'break'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {curShop.status === 'open' ? '✅ Open' : 
//                          curShop.status === 'break' ? '⏸️ Break' : '❌ Closed'}
//                       </span>
//                     )}
//                   </div>

//                   {/* Owner Info */}
//                   <div className="flex items-center text-gray-600">
//                     <div className="flex items-center space-x-2 mr-10">
//                       <FaUser className="text-gray-400" />
//                       <span className="font-medium">{curShop.name}</span>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <FaPhone className="text-gray-400" />
//                       <span className="font-medium">{curShop.phone}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Shop Details */}
//                 <div className="p-6 space-y-1">
//                   {/* Location Details */}
//                   <div className="space-y-1">
//                     <div className="flex items-center space-x-2">
//                       <FaMapPin className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">District:</span> {curShop.district}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <FaCity className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">City:</span> {curShop.city}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <FaRoad className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">Street:</span> {curShop.street}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="pt-4 border-t border-gray-100">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//                       {/* Action Buttons */}
//                       <div className="flex flex-wrap gap-2">
//                         {/* Directions Button */}
//                         {curShop.lat && curShop.lng && (
//                           <>
//                             <a
//                               href={getDirectionsUrl(curShop)}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
//                               title="Get directions with MapMyIndia"
//                             >
//                               <FaMapMarkerAlt className="text-sm" />
//                               <span>Directions</span>
//                             </a>
                            
//                             {/* View Map Button */}
//                             <button
//                               onClick={() => handleShowMap(curShop)}
//                               className="flex items-center space-x-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
//                               title="View on Map"
//                             >
//                               <FaMapMarkerAlt className="text-sm" />
//                               <span>View Map</span>
//                             </button>
//                           </>
//                         )}
                        
//                         {/* Book Button */}
//                         <Link
//                           to={`/nearbyShops/${curShop._id}/shopinfo`}
//                           className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
//                         >
//                           Book Now
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Map Modal */}
//         {showMapModal && selectedShopForMap && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg w-full max-w-4xl h-96">
//               <div className="flex justify-between items-center p-4 border-b">
//                 <h3 className="text-lg font-semibold">
//                   {selectedShopForMap.shopname} - Location
//                 </h3>
//                 <div className="flex items-center space-x-4">
//                   {/* Map Provider Toggle */}
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-gray-600">Map:</span>
//                     <button
//                       onClick={() => setUseOpenStreetMap(!useOpenStreetMap)}
//                       className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                     >
//                       {useOpenStreetMap ? 'OpenStreetMap' : 'MapMyIndia'}
//                     </button>
//                   </div>
                  
//                   {/* External Map Link */}
//                   <a
//                     href={getExternalMapUrl(selectedShopForMap)}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
//                   >
//                     <span>Open in New Tab</span>
//                     <FaExternalLinkAlt className="text-xs" />
//                   </a>
                  
//                   <button
//                     onClick={() => setShowMapModal(false)}
//                     className="text-gray-500 hover:text-gray-700 text-xl"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               </div>
//               <div className="h-80">
//                 {useOpenStreetMap ? (
//                   <iframe
//                     src={getOpenStreetMapEmbedUrl(selectedShopForMap)}
//                     width="100%"
//                     height="100%"
//                     style={{ border: 0 }}
//                     allowFullScreen=""
//                     loading="lazy"
//                     title="Shop Location Map"
//                   ></iframe>
//                 ) : (
//                   <img
//                     src={getMapMyIndiaStaticMapUrl(selectedShopForMap, 800, 400)}
//                     alt="Shop Location"
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       console.error("MapMyIndia static map failed to load, falling back to OpenStreetMap");
//                       setUseOpenStreetMap(true);
//                     }}
//                   />
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };







// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { api } from "../utils/api";
// import { FaMapMarkerAlt, FaStore, FaUser, FaPhone, FaRoad, FaCity, FaMapPin } from "react-icons/fa";
// import { stateDistrictCityData } from "../utils/locationData";
// import { useLoading } from "../components/Loading";
// import { getMapMyIndiaDirectionsUrl, getMapMyIndiaEmbedUrl } from "../utils/mapMyIndia";

// export const Shops = () => {
//   const [shop, setShop] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const { showLoading, hideLoading } = useLoading();

//   // MapMyIndia directions function
//   const getDirectionsUrl = (shop) => {
//     return getMapMyIndiaDirectionsUrl(shop, userLocation);
//   };

//   // Optional: Show embedded map
//   const [showMapModal, setShowMapModal] = useState(false);
//   const [selectedShopForMap, setSelectedShopForMap] = useState(null);

//   const handleShowMap = (shop) => {
//     setSelectedShopForMap(shop);
//     setShowMapModal(true);
//   };

//   const handleStateChange = (event) => {
//     const state = event.target.value;
//     setSelectedState(state);
//     setDistricts(Object.keys(stateDistrictCityData[state] || {}));
//     setSelectedDistrict("");
//     setSelectedCity("");
//   };

//   const handleDistrictChange = (event) => {
//     const district = event.target.value;
//     setSelectedDistrict(district);
//     setCities(stateDistrictCityData[selectedState][district] || []);
//     setSelectedCity("");
//   };

//   const handleCityChange = (event) => {
//     setSelectedCity(event.target.value);
//   };

//   const getDistance = (lat1, lon1, lat2, lon2) => {
//     const toRad = (value) => (value * Math.PI) / 180;
//     const R = 6371; // km
//     const dLat = toRad(lat2 - lat1);
//     const dLon = toRad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRad(lat1)) *
//         Math.cos(toRad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const getAllShopsData = async () => {
//     try {
//       showLoading('Fetching shops...');
      
//       const params = {};
//       if (selectedState) params.state = selectedState;
//       if (selectedDistrict) params.district = selectedDistrict;
//       if (selectedCity) params.city = selectedCity;

//       const response = await api.get(`/shop/approvedshops`, { params });
//       let shops = response.data;

//       // Log coordinates for debugging
//       console.log("Shops with coordinates:", shops.map(s => ({
//         name: s.shopname,
//         lat: s.lat,
//         lng: s.lng,
//         latString: s.latString,
//         lngString: s.lngString,
//         directionsUrl: getDirectionsUrl(s)
//       })));

//       if (userLocation) {
//         shops = shops.map((shop) => {
//           const distance = shop.lat && shop.lng
//             ? getDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
//             : Infinity;
//           return { ...shop, distance };
//         }).sort((a, b) => a.distance - b.distance);
//       }

//       setShop(shops);
//     } catch (error) {
//       console.error("Failed to fetch shops:", error);
//     } finally {
//       hideLoading();
//     }
//   };

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.warn("Location permission denied.", error);
//           setUserLocation(null);
//         }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     getAllShopsData();
//   }, [selectedState, selectedDistrict, selectedCity, userLocation]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-2">
//           <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-2">Find Nearby Shops</h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Discover the best salons and barber shops in your area. Filter by location to find shops near you.
//           </p>
//         </div>

//         {/* Location Filter */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Location</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">State</label>
//               <select 
//                 value={selectedState} 
//                 onChange={handleStateChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">-- Select State --</option>
//                 {Object.keys(stateDistrictCityData).map((state) => (
//                   <option key={state} value={state}>{state}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">District</label>
//               <select 
//                 value={selectedDistrict} 
//                 onChange={handleDistrictChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={!selectedState}
//               >
//                 <option value="">-- Select District --</option>
//                 {districts.map((district, i) => (
//                   <option key={i} value={district}>{district}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">City</label>
//               <select 
//                 value={selectedCity} 
//                 onChange={handleCityChange} 
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 disabled={!selectedDistrict}
//               >
//                 <option value="">-- Select City --</option>
//                 {cities.map((city, i) => (
//                   <option key={i} value={city}>{city}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Available Shops {shop.length > 0 && `(${shop.length})`}
//           </h2>
//           {userLocation && (
//             <p className="text-gray-600 mt-1">
//               Sorted by distance from your location
//             </p>
//           )}
//         </div>

//         {/* Shops Grid */}
//         {shop.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <div className="text-gray-400 text-6xl mb-4">🏪</div>
//             <h3 className="text-xl font-semibold text-gray-600 mb-2">No Shops Found</h3>
//             <p className="text-gray-500">
//               {selectedState || selectedDistrict || selectedCity 
//                 ? "No shops found for your selected location. Try different filters."
//                 : "No shops available in the system yet."
//               }
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {shop.map((curShop, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
//                 {/* Shop Header */}
//                 <div className="p-6 border-b border-gray-100">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                       <div className="p-2 bg-blue-100 rounded-lg">
//                         <FaStore className="text-blue-600 text-xl" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">
//                           {curShop.shopname}
//                         </h3>
//                         {userLocation && curShop.distance && curShop.distance !== Infinity && (
//                           <p className="text-sm text-green-600 font-medium">
//                             {curShop.distance < 1 
//                               ? `${(curShop.distance * 1000).toFixed(0)}m away` 
//                               : `${curShop.distance.toFixed(1)}km away`
//                             }
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     {curShop.status && (
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         curShop.status === 'open' 
//                           ? 'bg-green-100 text-green-800'
//                           : curShop.status === 'break'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {curShop.status === 'open' ? '✅ Open' : 
//                          curShop.status === 'break' ? '⏸️ Break' : '❌ Closed'}
//                       </span>
//                     )}
//                   </div>

//                   {/* Owner Info */}
//                   <div className="flex items-center text-gray-600">
//                     <div className="flex items-center space-x-2 mr-10">
//                       <FaUser className="text-gray-400" />
//                       <span className="font-medium">{curShop.name}</span>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <FaPhone className="text-gray-400" />
//                       <span className="font-medium">{curShop.phone}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Shop Details */}
//                 <div className="p-6 space-y-1">
//                   {/* Location Details */}
//                   <div className="space-y-1">
//                     <div className="flex items-center space-x-2">
//                       <FaMapPin className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">District:</span> {curShop.district}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <FaCity className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">City:</span> {curShop.city}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <FaRoad className="text-gray-400 flex-shrink-0" />
//                       <span className="text-sm text-gray-600">
//                         <span className="font-medium">Street:</span> {curShop.street}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="pt-4 border-t border-gray-100">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//                       {/* Action Buttons */}
//                       <div className="flex space-x-2">
//                         {/* Directions Button */}
//                         {curShop.lat && curShop.lng && (
//                           <>
//                             <a
//                               href={getDirectionsUrl(curShop)}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
//                               title="Get directions with MapMyIndia"
//                             >
//                               <FaMapMarkerAlt className="text-sm" />
//                               <span>Directions</span>
//                             </a>
                            
//                             {/* Optional: View Map Button */}
//                             <button
//                               onClick={() => handleShowMap(curShop)}
//                               className="flex items-center space-x-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
//                               title="View on Map"
//                             >
//                               <FaMapMarkerAlt className="text-sm" />
//                               <span>View Map</span>
//                             </button>
//                           </>
//                         )}
                        
//                         {/* Book Button */}
//                         <Link
//                           to={`/nearbyShops/${curShop._id}/shopinfo`}
//                           className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
//                         >
//                           Book Now
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Map Modal */}
//         {showMapModal && selectedShopForMap && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg w-full max-w-4xl h-96">
//               <div className="flex justify-between items-center p-4 border-b">
//                 <h3 className="text-lg font-semibold">
//                   {selectedShopForMap.shopname} - Location
//                 </h3>
//                 <button
//                   onClick={() => setShowMapModal(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
//               <div className="h-80">
//                 <iframe
//                   src={getMapMyIndiaEmbedUrl(selectedShopForMap, userLocation)}
//                   width="100%"
//                   height="100%"
//                   style={{ border: 0 }}
//                   allowFullScreen=""
//                   loading="lazy"
//                   title="Shop Location Map"
//                 ></iframe>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };















