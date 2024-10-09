import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
// import '../CSS/Shops.css'

export const Shops = () => {
  const stateDistrictCityData = {
    "Andaman and Nicobar Islands": {
      "Nicobars": ["Car Nicobar", "Nancowry"],
      "North and Middle Andaman": ["Mayabunder", "Rangat"],
      "South Andaman": ["Port Blair", "Wandoor"]
    },
    "Arunachal Pradesh": {
      "Tawang": ["Tawang", "Bumla"],
      "West Kameng": ["Bomdila", "Rupa"],
      "East Kameng": ["Seppa", "Sangram"],
      "Lower Subansiri": ["Ziro", "Daporijo"],
      "Papum Pare": ["Itanagar", "Naharlagun"],
      "Upper Subansiri": ["Daporijo", "Margherita"]
    },
    "Bihar": {
      "Patna": ["Patna", "Danapur"],
      "Gaya": ["Gaya", "Bodh Gaya"],
      "Bhagalpur": ["Bhagalpur", "Naugachia"],
      "Muzaffarpur": ["Muzaffarpur", "Sahebganj"],
      "Darbhanga": ["Darbhanga", "Jhaijha"],
      "Purnia": ["Purnia", "Kishanganj"]
    },
    "Chhattisgarh": {
      "Raipur": ["Raipur", "Durg"],
      "Bilaspur": ["Bilaspur", "Masturi"],
      "Korba": ["Korba", "Katghora"],
      "Durg": ["Durg", "Bhilai"],
      "Rajnandgaon": ["Rajnandgaon", "Dongargaon"]
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
      "Ahmedabad": ["Ahmedabad City", "Vastrapur"],
      "Vadodara": ["Vadodara City", "Fatehganj"],
      "Surat": ["Surat City", "Udhna"],
      "Rajkot": ["Rajkot City", "Jasdan"],
      "Gandhinagar": ["Gandhinagar City", "Mansa"]
    },
    "Himachal Pradesh": {
      "Bilaspur": ["Bilaspur", "Ghumarwin"],
      "Chamba": ["Chamba", "Bharmour"],
      "Hamirpur": ["Hamirpur", "Nadaun"],
      "Kangra": ["Dharamshala", "Palampur"],
      "Kinnaur": ["Reckong Peo", "Kalpa"],
      "Kullu": ["Kullu", "Manali"],
      "Lahaul and Spiti": ["Keylong", "Kaza"],
      "Mandi": ["Mandi", "Jogindernagar"],
      "Shimla": ["Shimla", "Kufri"],
      "Sirmaur": ["Nahan", "Paonta Sahib"],
      "Solan": ["Solan", "Kasauli"],
      "Una": ["Una", "Haroli"]
    },
    "Jharkhand": {
      "Bokaro": ["Bokaro Steel City", "Chas"],
      "Dhanbad": ["Dhanbad City", "Sindri"],
      "East Singhbhum": ["Jamshedpur", "Ghatshila"],
      "Deoghar": ["Deoghar City", "Madhupur"],
      "Ranchi": ["Ranchi City", "Ramgarh"]
    },
    "Karnataka": {
      "Bangalore": ["Bangalore City", "Malleswaram"],
      "Mysore": ["Mysore City", "Hunsur"],
      "Mangalore": ["Mangalore City", "Surathkal"],
      "Hubli": ["Hubli City", "Dharwad"],
      "Belgaum": ["Belgaum City", "Khanapur"]
    },
    "Kerala": {
      "Thiruvananthapuram": ["Thiruvananthapuram City", "Kazhakootam"],
      "Kochi": ["Kochi City", "Ernakulam"],
      "Kozhikode": ["Kozhikode City", "Koyilandy"],
      "Malappuram": ["Malappuram City", "Perinthalmanna"],
      "Kottayam": ["Kottayam City", "Changanassery"]
    },
    "Madhya Pradesh": {
      "Indore": ["Indore City", "Mhow"],
      "Bhopal": ["Bhopal City", "Hoshangabad"],
      "Gwalior": ["Gwalior City", "Morena"],
      "Jabalpur": ["Jabalpur City", "Katangi"],
      "Ujjain": ["Ujjain City", "Madhav Nagar"]
    },
    "Maharashtra": {
      "Mumbai": ["Mumbai City", "Thane"],
      "Pune": ["Pune City", "Khadki"],
      "Nagpur": ["Nagpur City", "Kamptee"],
      "Nashik": ["Nashik City", "Sinnar"],
      "Aurangabad": ["Aurangabad City", "Kannad"]
    },
    "Manipur": {
      "Imphal East": ["Imphal City", "Wangoi"],
      "Imphal West": ["Imphal City", "Lilong"],
      "Thoubal": ["Thoubal City", "Kakching"],
      "Bishnupur": ["Bishnupur City", "Nambol"],
      "Chandel": ["Chandel City", "Moreh"]
    },
    "Meghalaya": {
      "East Khasi Hills": ["Shillong", "Jowai"],
      "West Khasi Hills": ["Nongstoin", "Mairang"],
      "Ri Bhoi": ["Nongpoh", "Umiam"],
      "East Garo Hills": ["Williamnagar", "Babadam"],
      "West Garo Hills": ["Tura", "Rongram"]
    },
    "Mizoram": {
      "Aizawl": ["Aizawl City", "Saitual"],
      "Champhai": ["Champhai City", "Hnahthial"],
      "Serchhip": ["Serchhip City", "Lunglei"],
      "Lunglei": ["Lunglei City", "Tlabung"],
      "Mamit": ["Mamit City", "Kawrthah"]
    },
    "Nagaland": {
      "Dimapur": ["Dimapur City", "Chümoukedima"],
      "Kohima": ["Kohima City", "Phek"],
      "Mon": ["Mon City", "Longleng"],
      "Zunheboto": ["Zunheboto City", "Satoi"],
      "Wokha": ["Wokha City", "Bhandari"]
    },
    "Odisha": {
      "Bhubaneswar": ["Bhubaneswar City", "Khurda"],
      "Cuttack": ["Cuttack City", "Jagatpur"],
      "Sambalpur": ["Sambalpur City", "Burla"],
      "Berhampur": ["Berhampur City", "Brahmapur"],
      "Rourkela": ["Rourkela City", "Birmitrapur"]
    },
    "Punjab": {
      "Amritsar": ["Amritsar City", "Tarn Taran"],
      "Ludhiana": ["Ludhiana City", "Jagraon"],
      "Patiala": ["Patiala City", "Rajpura"],
      "Jalandhar": ["Jalandhar City", "Phagwara"],
      "Mohali": ["Mohali City", "Kharar"]
    },
    "Rajasthan": {
      "Jaipur": ["Jaipur City", "Sanganer"],
      "Udaipur": ["Udaipur City", "Rajsamand"],
      "Jodhpur": ["Jodhpur City", "Osian"],
      "Ajmer": ["Ajmer City", "Kishangarh"],
      "Bikaner": ["Bikaner City", "Pugal"]
    },
    "Tamil Nadu": {
      "Chennai": ["Chennai City", "T Nagar"],
      "Coimbatore": ["Coimbatore City", "Tidel Park"],
      "Madurai": ["Madurai City", "Thiruparankundram"],
      "Tiruchirappalli": ["Tiruchirappalli City", "Srirangam"],
      "Salem": ["Salem City", "Attur"]
    },
    "Telangana": {
      "Hyderabad": ["Hyderabad City", "Secunderabad"],
      "Warangal": ["Warangal City", "Kazipet"],
      "Nizamabad": ["Nizamabad City", "Bodhan"],
      "Khammam": ["Khammam City", "Kothagudem"],
      "Mahabubnagar": ["Mahabubnagar City", "Kurgunta"]
    },
    "Tripura": {
      "Agartala": ["Agartala City", "Udaipur"],
      "Dhalai": ["Ambassa", "Manu"],
      "North Tripura": ["Dharmanagar", "Kailashahar"],
      "Unakoti": ["Kailashahar", "Panchayatan"],
      "South Tripura": ["Belonia", "Sabroom"]
    },
    "Uttar Pradesh": {
      "Agra": ["Agra City", "Firozabad"],
      "Lucknow": ["Lucknow City", "Barabanki"],
      "Varanasi": ["Varanasi City", "Mirzapur"],
      "Kanpur": ["Kanpur City", "Unnao"],
      "Noida": ["Noida City", "Greater Noida"]
    },
    "Uttarakhand": {
      "Dehradun": ["Dehradun City", "Rishikesh"],
      "Haridwar": ["Haridwar City", "Roorkee"],
      "Nainital": ["Nainital City", "Haldwani"],
      "Pauri Garhwal": ["Pauri City", "Lansdowne"],
      "Tehri Garhwal": ["Tehri City", "New Tehri"]
    },
    "West Bengal": {
      "Kolkata": ["Kolkata City", "Howrah"],
      "Darjeeling": ["Darjeeling City", "Kalimpong"],
      "Siliguri": ["Siliguri City", "Jalpaiguri"],
      "Malda": ["Malda City", "Baharampur"],
      "North 24 Parganas": ["Barasat", "Bongaon"]
    }
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
