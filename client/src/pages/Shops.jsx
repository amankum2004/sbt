// import { useEffect, useState } from "react";
// // import { useAuth } from "../store/auth";
// import { Link } from "react-router-dom";
// import { api } from "../utils/api";
// // import "./states_districts.js" 
// // const token = JSON.parse(localStorage.getItem('token'))

// export const Shops = () => {
//   const stateDistrictData = {
//     "Andaman and Nicobar Islands": ["Nicobars", "North And Middle Andaman", "South Andamans"],
//     "Arunachal Pradesh": ["DistrictA", "DistrictB", "DistrictC"],
//     "Bihar": ["DistrictA", "DistrictB", "DistrictC"],
//     "Chhattisgarh": ["DistrictA", "DistrictB", "DistrictC"],
//     "Delhi": ["Central", "East", "New Delhi","North","North East","North West","Shahdara","South","South East","South West","West"],
//     "Gujarat": ["DistrictA", "DistrictB", "DistrictC"],
//     "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur","Kangra","Kinnaur","Kullu","Lahaul And Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
//   };

//     const [shop,setShop] = useState([]);
//     const [selectedState, setSelectedState] = useState("");
//     const [districts, setDistricts] = useState([]);
  
//     const handleStateChange = (event) => {
//       const state = event.target.value;
//       setSelectedState(state);
//       setDistricts(stateDistrictData[state] || []);
//     };

//     const getAllShopsData = async() => {
//         try {
//             const response = await api.get(`/shop/shoplists`)
//             // const response = await fetch(`http://localhost:8000/api/shop/shoplists`,{
//             //     method:"GET",
//             //     headers:{
//             //         Authorization: `Bearer ${token}`,
//             //     }
//             // });
//             // const data = await response.json();
//             // setShop(Array.isArray(data) ? data : []);
//             console.log(`shops ${response.data}`);
//             setShop(response.data);
//         }
//         catch (error) {
//             console.log(error);
//         }
//     }
    
//     useEffect(() => {
//       getAllShopsData();
//     },[])

//   return <>
//     <h3>Select your location manually</h3>
//   <form>
//     <div>
//       <label>
//         Select State:
//         <select value={selectedState} onChange={handleStateChange}>
//           <option value="">--Select State--</option>
//           {Object.keys(stateDistrictData).map((state) => (
//             <option key={state} value={state}>
//               {state}
//             </option>
//           ))}
//         </select>
//       </label>

//       {districts.length > 0 && (
//         <label>
//           Select District:
//           <select>
//             <option value="">--Select District--</option>
//             {districts.map((district) => (
//               <option key={district} value={district}>
//                 {district}
//               </option>
//             ))}
//           </select>
//         </label>
//       )}
//     </div>

//   </form>
//     <section className="users-section">
//         <div className="container">
//             <h2>List of Shops</h2>
//         </div>
//         <div className="container shoplist">
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Shop Name</th>
//                         <th>Phone</th>
//                         <th>Address</th>
//                         <th>Location</th>
//                         <th>Book appointment</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {shop.length === 0 ? (
//                       <h2 style={{color:"red"}}>No Shops Exist</h2>
//                       ) : (
//                       shop.map((curShop, index) => (
//                           <tr key={index}>
//                               <td>{curShop.shopname}</td>
//                               <td>{curShop.phone}</td>
//                               <td>{curShop.state}</td>
//                               <td>{curShop.city}</td>
//                               <td>
//                                   <Link to={`/nearbyShops/${curShop._id}/shopinfo`}>Select</Link>
//                               </td>
//                           </tr>
//                           ))
//                        )}
//                 </tbody>
//             </table>
//         </div>
//     </section>
//     </>
// };


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import '../CSS/Shops.css'

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
    <h3 className="form-title">Select Your Location</h3>
    <form className="location-form">
        <div className="form-group">
          <label>
            Select State:
            <select value={selectedState} onChange={handleStateChange} className="form-control">
              <option value="">--Select State--</option>
              {Object.keys(stateDistrictCityData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          {districts.length > 0 && (
            <label>
              Select District:
              <select value={selectedDistrict} onChange={handleDistrictChange} className="form-control">
                <option value="">--Select District--</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          )}

          {cities.length > 0 && (
            <label>
              Select City:
              <select value={selectedCity} onChange={handleCityChange} className="form-control">
                <option value="">--Select City--</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </form>

    <section className="users-section">
      {/* <div className="container">
        <h2 className="section-title">List of Shops</h2>
        </div> */}
        <h2 className="section-title">List of available shops</h2>
      {/* <div className="container"> */}
      <div className="cont">
        <table className="shop-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Location</th>
              <th>Book Appointment</th>
            </tr>
          </thead>
          <tbody>
            {shop.length === 0 ? (
            <div>
              <h1>No Shops Exist</h1>
            </div>
              
            ) : (
              shop.map((curShop, index) => (
                <tr key={index}>
                  <td>{curShop.shopname}</td>
                  <td>{curShop.phone}</td>
                  <td>{curShop.state}</td>
                  <td>{curShop.city}</td>
                  <td>
                    <Link to={`/nearbyShops/${curShop._id}/shopinfo`} className="select-button">Select</Link>
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
