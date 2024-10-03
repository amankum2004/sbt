import React from "react"; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
// import '../CSS/Shops.css'

export const Shops = () => {
  const stateDistrictCityData = {
    "Andaman and Nicobar Islands": {
      "Nicobars": ["CityA", "CityB"],
      "North And Middle Andaman": ["CityC", "CityD"],
      "South Andamans": ["CityE", "CityF"]
    },
    "Arunachal Pradesh": {
      "DistrictA": ["CityA", "CityB"],
      "DistrictB": ["CityC", "CityD"],
      "DistrictC": ["CityE", "CityF"]
    },
    "Bihar": {
      "DistrictA": ["CityA", "CityB"],
      "DistrictB": ["CityC", "CityD"],
      "DistrictC": ["CityE", "CityF"]
    },
    "Chhattisgarh": {
      "DistrictA": ["CityA", "CityB"],
      "DistrictB": ["CityC", "CityD"],
      "DistrictC": ["CityE", "CityF"]
    },
    "Delhi": {
      "Central": ["Connaught Place", "Karol Bagh"],
      "East": ["Preet Vihar", "Laxmi Nagar"],
      "New Delhi": ["Chanakyapuri", "Sarojini Nagar"],
      "North": ["Civil Lines", "Model Town"],
      "North East": ["Seelampur", "Shahdara"],
      "North West": ["Pitampura", "Rohini"],
      "Shahdara": ["Dilshad Garden", "Karkardooma"],
      "South": ["Greater Kailash", "Lajpat Nagar"],
      "South East": ["Kalkaji", "Nehru Place"],
      "South West": ["Dwarka", "Vasant Kunj"],
      "West": ["Janakpuri", "Rajouri Garden"]
    },
    "Gujarat": {
      "DistrictA": ["CityA", "CityB"],
      "DistrictB": ["CityC", "CityD"],
      "DistrictC": ["CityE", "CityF"]
    },
    "Himachal Pradesh": {
      "Bilaspur": ["CityA", "CityB"],
      "Chamba": ["CityC", "CityD"],
      "Hamirpur": ["CityE", "CityF"],
      "Kangra": ["CityG", "CityH"],
      "Kinnaur": ["CityI", "CityJ"],
      "Kullu": ["CityK", "CityL"],
      "Lahaul And Spiti": ["CityM", "CityN"],
      "Mandi": ["CityO", "CityP"],
      "Shimla": ["CityQ", "CityR"],
      "Sirmaur": ["CityS", "CityT"],
      "Solan": ["CityU", "CityV"],
      "Una": ["CityW", "CityX"]
    },
  };

  const [shop, setShop] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setDistricts(Object.keys(stateDistrictCityData[state] || {}));
    setSelectedDistrict(""); // Reset district when state changes
    setSelectedCity(""); // Reset city when state changes
  };

  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setCities(stateDistrictCityData[selectedState][district] || []);
    setSelectedCity(""); // Reset city when district changes
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const getAllShopsData = async () => {
    try {
      const params = {};
      if (selectedState) {
        params.state = selectedState;
      }
      if (selectedDistrict) {
        params.district = selectedDistrict;
      }
      if (selectedCity) {
        params.city = selectedCity;
      }
      
      const response = await api.get(`/shop/shoplists`, { params });
      setShop(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllShopsData();
  }, [selectedState, selectedDistrict, selectedCity]); // Fetch data whenever state or district changes

  return (
    <>
    <h3 className=" text-center text-gray-800 mt-2">Select Your Location</h3>
    <form className="bg-white p-3 shadow-md rounded-md">
        <div className="flex flex-wrap justify-between">
          <div className=" lg:w-1/3 mb-1">
            <label className="block text-gray-600 text-lg mb-1">Select State:</label>
            <select value={selectedState} onChange={handleStateChange} className="w-80 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">--Select State--</option>
              {Object.keys(stateDistrictCityData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className=" lg:w-1/3 mb-1">
            <label className="block text-gray-600 text-lg mb-1">Select District:</label>
            <select value={selectedDistrict} onChange={handleDistrictChange} className="w-80 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">--Select District--</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div className=" lg:w-1/3 mb-1">
            <label className="block text-gray-600 text-lg mb-1">Select City:</label>
            <select value={selectedCity} onChange={handleCityChange} className="w-80 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">--Select City--</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
    </form>

    <section className="mt-4">
      <h2 className="text-3xl text-center text-gray-800 mb-6">List of Available Shops</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-blue-600 text-white">Shop Name</th>
              <th className="px-4 py-2 bg-blue-600 text-white">Phone</th>
              <th className="px-4 py-2 bg-blue-600 text-white">State</th>
              <th className="px-4 py-2 bg-blue-600 text-white">City</th>
              <th className="px-4 py-2 bg-blue-600 text-white">Book Appointment</th>
            </tr>
          </thead>
          <tbody>
            {shop.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-red-600">No Shops Exist</td>
              </tr>
            ) : (
              shop.map((curShop, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 text-gray-700">{curShop.shopname}</td>
                  <td className="px-4 py-2 text-gray-700">{curShop.phone}</td>
                  <td className="px-4 py-2 text-gray-700">{curShop.state}</td>
                  <td className="px-4 py-2 text-gray-700">{curShop.city}</td>
                  <td className="px-4 py-2">
                    <Link to={`/nearbyShops/${curShop._id}/shopinfo`} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">Select</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>

    </>
  );
};
