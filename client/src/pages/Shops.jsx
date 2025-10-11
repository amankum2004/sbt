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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Find Nearby Shops</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the best salons and barber shops in your area. Filter by location to find shops near you.
          </p>
        </div>

        {/* Location Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">State</label>
              <select 
                value={selectedState} 
                onChange={handleStateChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select State --</option>
                {Object.keys(stateDistrictCityData).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">District</label>
              <select 
                value={selectedDistrict} 
                onChange={handleDistrictChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedState}
              >
                <option value="">-- Select District --</option>
                {districts.map((district, i) => (
                  <option key={i} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">City</label>
              <select 
                value={selectedCity} 
                onChange={handleCityChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedDistrict}
              >
                <option value="">-- Select City --</option>
                {cities.map((city, i) => (
                  <option key={i} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
                        {userLocation && curShop.distance && curShop.distance !== Infinity && (
                          <p className="text-sm text-green-600 font-medium">
                            {curShop.distance < 1 
                              ? `${(curShop.distance * 1000).toFixed(0)}m away` 
                              : `${curShop.distance.toFixed(1)}km away`
                            }
                          </p>
                        )}
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
                      <FaMapPin className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">District:</span> {curShop.district}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCity className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">City:</span> {curShop.city}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaRoad className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Street:</span> {curShop.street}
                      </span>
                    </div>
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
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { stateDistrictCityData } from "../utils/locationData";
// import { useLoading } from "../components/Loading";

// export const Shops = () => {
//   const [shop, setShop] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const { showLoading, hideLoading } = useLoading();

//   // High-precision directions function
//   const getHighPrecisionDirectionsUrl = (shop) => {
//     if (!shop.lat || !shop.lng) return "#";
    
//     // Use exact coordinates for precise navigation
//     return `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}&destination_place_id=&travelmode=driving&dir_action=navigate`;
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
//       console.log("Shops with high-precision coordinates:", shops.map(s => ({
//         name: s.shopname,
//         lat: s.lat,
//         lng: s.lng,
//         directionsUrl: getHighPrecisionDirectionsUrl(s)
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
//     <div className="p-6 max-w-7xl mx-auto">
//       <h3 className="text-3xl font-bold text-center text-gray-800 mt-12">Select Your Location</h3>
//       <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">State:</label>
//             <select value={selectedState} onChange={handleStateChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
//               <option value="">-- Select State --</option>
//               {Object.keys(stateDistrictCityData).map((state) => (
//                 <option key={state} value={state}>{state}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">District:</label>
//             <select value={selectedDistrict} onChange={handleDistrictChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
//               <option value="">-- Select District --</option>
//               {districts.map((district, i) => (
//                 <option key={i} value={district}>{district}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">City:</label>
//             <select value={selectedCity} onChange={handleCityChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
//               <option value="">-- Select City --</option>
//               {cities.map((city, i) => (
//                 <option key={i} value={city}>{city}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </form>

//       <section className="mt-10">
//         <h2 className="text-3xl text-center text-gray-800 mb-6">List of Available Shops</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full bg-white rounded-lg shadow overflow-hidden">
//             <thead className="bg-blue-600 text-white">
//               <tr>
//                 <th className="py-3 px-4 text-left">Shop Name</th>
//                 <th className="py-3 px-4 text-left">Owner Name</th>
//                 <th className="py-3 px-4 text-left">District</th>
//                 <th className="py-3 px-4 text-left">City</th>
//                 <th className="py-3 px-4 text-left">Street</th>
//                 <th className="py-3 px-4 text-left">Location</th>
//                 <th className="py-3 px-4 text-left">Book</th>
//               </tr>
//             </thead>
//             <tbody>
//               {shop.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="text-center py-6 text-red-600 font-medium">No Shops Exist</td>
//                 </tr>
//               ) : (
//                 shop.map((curShop, index) => (
//                   <tr key={index} className="border-t hover:bg-gray-50 transition">
//                     <td className="py-3 px-4">{curShop.shopname}</td>
//                     <td className="py-3 px-4">{curShop.name}</td>
//                     <td className="py-3 px-4">{curShop.district}</td>
//                     <td className="py-3 px-4">{curShop.city}</td>
//                     <td className="py-3 px-4">{curShop.street}</td>
//                     <td className="py-3 px-4">
//                        {curShop.lat && curShop.lng ? (
//                           <a
//                             href={getHighPrecisionDirectionsUrl(curShop)}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
//                             title={`Exact location: ${curShop.lat}, ${curShop.lng}`}
//                           >
//                             <FaMapMarkerAlt className="text-xl" />
//                             <span className="underline">Directions</span>
//                           </a>
//                         ) : (
//                           "N/A"
//                         )}
//                     </td>
//                     <td className="py-3 px-4">
//                       <Link
//                         to={`/nearbyShops/${curShop._id}/shopinfo`}
//                         className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
//                       >
//                         Select
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </section>
//     </div>
//   );
// };







