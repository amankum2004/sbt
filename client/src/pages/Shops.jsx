import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { FaMapMarkerAlt } from "react-icons/fa";
import { stateDistrictCityData } from "../utils/locationData";
import { useLoading } from "../components/Loading"; // Import the loading hook

export const Shops = () => {
  const [shop, setShop] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const { showLoading, hideLoading } = useLoading(); // Use the loading hook

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
      showLoading('Fetching shops...'); // Show loading spinner
      
      const params = {};
      if (selectedState) params.state = selectedState;
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedCity) params.city = selectedCity;

      const response = await api.get(`/shop/approvedshops`, { params });
      let shops = response.data;

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
      hideLoading(); // Hide loading spinner
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
    <div className="p-6 max-w-7xl mx-auto">
      <h3 className="text-3xl font-bold text-center text-gray-800 mt-12">Select Your Location</h3>
      <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">State:</label>
            <select value={selectedState} onChange={handleStateChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select State --</option>
              {Object.keys(stateDistrictCityData).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">District:</label>
            <select value={selectedDistrict} onChange={handleDistrictChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select District --</option>
              {districts.map((district, i) => (
                <option key={i} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">City:</label>
            <select value={selectedCity} onChange={handleCityChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">-- Select City --</option>
              {cities.map((city, i) => (
                <option key={i} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <section className="mt-10">
        <h2 className="text-3xl text-center text-gray-800 mb-6">List of Available Shops</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Shop Name</th>
                <th className="py-3 px-4 text-left">Owner Name</th>
                <th className="py-3 px-4 text-left">State</th>
                <th className="py-3 px-4 text-left">City</th>
                <th className="py-3 px-4 text-left">Street</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Book</th>
              </tr>
            </thead>
            <tbody>
              {shop.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-red-600 font-medium">No Shops Exist</td>
                </tr>
              ) : (
                shop.map((curShop, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{curShop.shopname}</td>
                    <td className="py-3 px-4">{curShop.name}</td>
                    <td className="py-3 px-4">{curShop.state}</td>
                    <td className="py-3 px-4">{curShop.city}</td>
                    <td className="py-3 px-4">{curShop.street}</td>
                    <td className="py-3 px-4">
                       {curShop.lat && curShop.lng ? (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${curShop.lat},${curShop.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <FaMapMarkerAlt className="text-xl" />
                            <span className="underline">Directions</span>
                          </a>
                        ) : (
                          "N/A"
                        )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/nearbyShops/${curShop._id}/shopinfo`}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
                      >
                        Select
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};






// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { api } from "../utils/api";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { stateDistrictCityData } from "../utils/locationData";

// export const Shops = () => {
//   const [shop, setShop] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [userLocation, setUserLocation] = useState(null);

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
//       setLoading(true);
//       const params = {};
//       if (selectedState) params.state = selectedState;
//       if (selectedDistrict) params.district = selectedDistrict;
//       if (selectedCity) params.city = selectedCity;

//       const response = await api.get(`/shop/approvedshops`, { params });
//       let shops = response.data;

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
//       setLoading(false);
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
//           console.warn("Location permission denied.",error);
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
//       <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Select Your Location</h3>
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
//                 <th className="py-3 px-4 text-left">Phone</th>
//                 <th className="py-3 px-4 text-left">State</th>
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
//                     <td className="py-3 px-4">{curShop.phone}</td>
//                     <td className="py-3 px-4">{curShop.state}</td>
//                     <td className="py-3 px-4">{curShop.city}</td>
//                     <td className="py-3 px-4">{curShop.street}</td>
//                     <td className="py-3 px-4">
//                        {curShop.lat && curShop.lng ? (
//                           <a
//                             href={`https://www.google.com/maps/dir/?api=1&destination=${curShop.lat},${curShop.lng}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
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




// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { api } from "../utils/api";
// import { stateDistrictCityData } from "../utils/locationData";

// export const Shops = () => {
//   const [shop, setShop] = useState([]);
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [districts, setDistricts] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(false);

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

//   const getAllShopsData = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (selectedState) params.state = selectedState;
//       if (selectedDistrict) params.district = selectedDistrict;
//       if (selectedCity) params.city = selectedCity;

//       const response = await api.get(`/shop/approvedshops`, { params });
//       setShop(response.data);
//     } catch (error) {
//       console.error("Failed to fetch shops:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllShopsData();
//   }, [selectedState, selectedDistrict, selectedCity]);

//   return (
//     <>
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg text-center">
//             <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
//             </svg>
//             <p className="text-lg font-semibold text-gray-700">Please wait while we load the shops...</p>
//           </div>
//         </div>
//       )}

//       <div className="p-6 max-w-7xl mx-auto">
//         <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Select Your Location</h3>

//         <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">State:</label>
//               <select
//                 value={selectedState}
//                 onChange={handleStateChange}
//                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">-- Select State --</option>
//                 {Object.keys(stateDistrictCityData).map((state) => (
//                   <option key={state} value={state}>{state}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">District:</label>
//               <select
//                 value={selectedDistrict}
//                 onChange={handleDistrictChange}
//                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">-- Select District --</option>
//                 {districts.map((district, i) => (
//                   <option key={i} value={district}>{district}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">City:</label>
//               <select
//                 value={selectedCity}
//                 onChange={handleCityChange}
//                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">-- Select City --</option>
//                 {cities.map((city, i) => (
//                   <option key={i} value={city}>{city}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </form>

//         <section className="mt-10">
//           <h2 className="text-3xl text-center text-gray-800 mb-6">List of Available Shops</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full bg-white rounded-lg shadow overflow-hidden">
//               <thead className="bg-blue-600 text-white">
//                 <tr>
//                   <th className="py-3 px-4 text-left">Shop Name</th>
//                   <th className="py-3 px-4 text-left">Phone</th>
//                   <th className="py-3 px-4 text-left">State</th>
//                   <th className="py-3 px-4 text-left">City</th>
//                   <th className="py-3 px-4 text-left">Street/locality</th>
//                   <th className="py-3 px-4 text-left">Book</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {shop.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="text-center py-6 text-red-600 font-medium">
//                       No Shops Exist
//                     </td>
//                   </tr>
//                 ) : (
//                   shop.map((curShop, index) => (
//                     <tr key={index} className="border-t hover:bg-gray-50 transition">
//                       <td className="py-3 px-4">{curShop.shopname}</td>
//                       <td className="py-3 px-4">{curShop.phone}</td>
//                       <td className="py-3 px-4">{curShop.state}</td>
//                       <td className="py-3 px-4">{curShop.city}</td>
//                       <td className="py-3 px-4">{curShop.street}</td>
//                       <td className="py-3 px-4">
//                         <Link
//                           to={`/nearbyShops/${curShop._id}/shopinfo`}
//                           className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300"
//                         >
//                           Select
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// };
