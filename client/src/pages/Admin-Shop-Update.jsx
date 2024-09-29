// import '../CSS/Admin.css'
// import { useEffect, useState } from "react";
// import {useParams} from "react-router-dom";
// // import { useAuth } from "../store/auth";
// // import { useLogin } from "../components/LoginContext";
// import {toast} from "react-toastify"
// import '../CSS/RegisterShop.css'
// const token = JSON.parse(localStorage.getItem('token'))

// const stateDistrictCityData = {
//     "Andaman and Nicobar Islands": {
//       "Nicobars": ["CityA", "CityB"],
//       "North And Middle Andaman": ["CityC", "CityD"],
//       "South Andamans": ["CityE", "CityF"]
//     },
//     "Arunachal Pradesh": {
//       "DistrictA": ["CityA", "CityB"],
//       "DistrictB": ["CityC", "CityD"],
//       "DistrictC": ["CityE", "CityF"]
//     },
//     "Bihar": {
//       "DistrictA": ["CityA", "CityB"],
//       "DistrictB": ["CityC", "CityD"],
//       "DistrictC": ["CityE", "CityF"]
//     },
//     "Chhattisgarh": {
//       "DistrictA": ["CityA", "CityB"],
//       "DistrictB": ["CityC", "CityD"],
//       "DistrictC": ["CityE", "CityF"]
//     },
//     "Delhi": {
//       "Central": ["Connaught Place", "Karol Bagh"],
//       "East": ["Preet Vihar", "Laxmi Nagar"],
//       "New Delhi": ["Chanakyapuri", "Sarojini Nagar"],
//       "North": ["Civil Lines", "Model Town"],
//       "North East": ["Seelampur", "Shahdara"],
//       "North West": ["Pitampura", "Rohini"],
//       "Shahdara": ["Dilshad Garden", "Karkardooma"],
//       "South": ["Greater Kailash", "Lajpat Nagar"],
//       "South East": ["Kalkaji", "Nehru Place"],
//       "South West": ["Dwarka", "Vasant Kunj"],
//       "West": ["Janakpuri", "Rajouri Garden"]
//     },
//     "Gujarat": {
//       "DistrictA": ["CityA", "CityB"],
//       "DistrictB": ["CityC", "CityD"],
//       "DistrictC": ["CityE", "CityF"]
//     },
//     "Himachal Pradesh": {
//       "Bilaspur": ["CityA", "CityB"],
//       "Chamba": ["CityC", "CityD"],
//       "Hamirpur": ["CityE", "CityF"],
//       "Kangra": ["CityG", "CityH"],
//       "Kinnaur": ["CityI", "CityJ"],
//       "Kullu": ["CityK", "CityL"],
//       "Lahaul And Spiti": ["CityM", "CityN"],
//       "Mandi": ["CityO", "CityP"],
//       "Shimla": ["CityQ", "CityR"],
//       "Sirmaur": ["CityS", "CityT"],
//       "Solan": ["CityU", "CityV"],
//       "Una": ["CityW", "CityX"]
//     },
//   };

// export const AdminShopUpdate = () => {
//     const [districts, setDistricts] = useState([]);
//     const [cities, setCities] = useState([]);
//     const [data,setData] = useState({
//         name:"",
//         email:"",
//         phone:"",
//         shopname:"",
//         state:"",
//         district:"",
//         city:"",
//         street:"",
//         pin:"",
//         bankname:"",
//         bankbranch:"",
//         ifsc:"",
//         micr:"",
//         account:"",
//         // services:""
//     });

//     const handleStateChange = (e) => {
//         const selectedState = e.target.value;
    
//         // Check if the selected state exists in the stateDistrictCityData object
//         if (selectedState in stateDistrictCityData) {
//             setData({ ...data, state: selectedState, district: '', city: '' });
    
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
//         setData({ ...data, district: selectedDistrict, city: '' });
    
//         // Update cities based on the selected state and district
//         const cities = stateDistrictCityData[data.state][selectedDistrict];
//         setCities(cities);
//     };    

//     const handleCityChange = (e) => {
//         setData({ ...data, city: e.target.value });
//     };

//     const params = useParams();
//     // const { authorizationToken, API} = useAuth();
//     // const {user} = useLogin()

//     // GET SINGLE SHOP DATA FOR UPDATION
//     const getSingleUserData = async () => {
//         try {
//                 // const response = await fetch(`http://localhost:27017/api/admin/users/${params.id}`,
//             // const response = await fetch(`${API}/api/admin/shops/${params.id}`,
//             const response = await fetch(`http://localhost:8000/api/admin/shops/${params.id}`,
//             {
//                 method:"GET",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 }
//             });
//             const data = await response.json();
//             // console.log(`user single data: ${data}`);
//             setData(data);

//             // if(response.ok){
//             //     getSingleUserData();
//             // } 
//         }catch (error) {
//             console.log(error);
//         }
//     }
    

//     useEffect(() => {
//         getSingleUserData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     },[])

//     const handleInput = (e) => {
//         let name = e.target.name;
//         let value = e.target.value;

//         setData({
//             ...data,
//             [name]:value
//         });
//     };

//     // update data dynamically
//     const handleSubmit = async(e) => {
//         e.preventDefault();

//         try {
//             // const response = await fetch(`http://localhost:27017/api/admin/users/update/${params.id}`,{
//             // const response = await fetch(`${API}/api/admin/shops/update/${params.id}`,{
//             const response = await fetch(`http://localhost:8000/api/admin/shops/update/${params.id}`,{
//                 method:"PATCH",
//                 headers:{
//                     "Content-Type":"application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(data)
//             });
//             if(response.ok){
//                 toast.success("Updated Successfully");
//             }else{
//                 toast.error("Error in Updation");
//             }
            
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     return (
//         <section className="section-shops-update">
//             <div className="shops-update container">
//                 <h1 className="heading">Update Shop Data</h1>
//             </div>
//             <div className="container grid grid-two-cols">
//                 <section className="shop-update">
//                     <form onSubmit={handleSubmit}>
//                         <div>
//                             <label htmlFor="name">Name</label>
//                             <input type="text" 
//                             name="name" 
//                             id="name" 
//                             autoComplete="off"
//                             value={data.name}
//                             onChange={handleInput}
//                             required/>
//                         </div>
                        
//                         <div>
//                             <label htmlFor="email">email</label>
//                             <input type="email" 
//                             name="email" 
//                             id="email" 
//                             autoComplete="off"
//                             value={data.email}
//                             onChange={handleInput}
//                             required/>
//                         </div>
                        
//                         <div>
//                             <label htmlFor="phone">Phone</label>
//                             <input type="phone" 
//                             name="phone" 
//                             id="phone" 
//                             autoComplete="off"
//                             value={data.phone}
//                             onChange={handleInput}
//                             required/>
//                         </div>

//                         <div>
//                             <label htmlFor="shopname">Shop Name</label>
//                             <input type="text" 
//                             name="shopname" 
//                             id="shopname" 
//                             autoComplete="off"
//                             value={data.shopname}
//                             onChange={handleInput}
//                             required/>
//                         </div>

//                         <div className="input-box">
//                                 <span className="details">State</span>
//                                 <select name="state" value={data.state} onChange={handleStateChange} required>
//                                     <option value="" disabled>Select State</option>
//                                     {Object.keys(stateDistrictCityData).map((state, index) => (
//                                         <option key={index} value={state}>{state}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div className="input-box">
//                                 <span className="details">District</span>
//                                 <select name="district" value={data.district} onChange={handleDistrictChange} required>
//                                     <option value="" disabled>Select District</option>
//                                     {districts.map((district, index) => (
//                                         <option key={index} value={district}>{district}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div className="input-box">
//                                 <span className="details">City</span>
//                                 <select name="city" value={data.city} onChange={handleCityChange} required>
//                                     <option value="" disabled>Select City</option>
//                                     {cities.map((city, index) => (
//                                         <option key={index} value={city}>{city}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         <div>
//                             <label htmlFor="street">Street</label>
//                             <input type="text" 
//                             name="street" 
//                             id="street" 
//                             autoComplete="off"
//                             value={data.street}
//                             onChange={handleInput}
//                             />
//                         </div>
                        
//                         <div>
//                             <label htmlFor="pin">PIN</label>
//                             <input type="number" 
//                             name="pin" 
//                             id="pin" 
//                             autoComplete="off"
//                             value={data.pin}
//                             onChange={handleInput}
//                             required/>
//                         </div>
//                         <div>
//                             <label htmlFor="bankname">Bank Name</label>
//                             <input type="text" 
//                             name="bankname" 
//                             id="bankname" 
//                             autoComplete="off"
//                             value={data.bankname}
//                             onChange={handleInput}
//                             required/>
//                         </div>
//                         <div>
//                             <label htmlFor="bankbranch">Bank Branch</label>
//                             <input type="text" 
//                             name="bankbranch" 
//                             id="bankbranch" 
//                             autoComplete="off"
//                             value={data.bankbranch}
//                             onChange={handleInput}
//                             required/>
//                         </div>
//                         <div>
//                             <label htmlFor="ifsc">IFSC</label>
//                             <input type="text" 
//                             name="ifsc" 
//                             id="ifsc" 
//                             autoComplete="off"
//                             value={data.ifsc}
//                             onChange={handleInput}
//                             required/>
//                         </div>
//                         <div>
//                             <label htmlFor="micr">MICR</label>
//                             <input type="text" 
//                             name="micr" 
//                             id="micr" 
//                             autoComplete="off"
//                             value={data.micr}
//                             onChange={handleInput}
//                             required/>
//                         </div>
//                         <div>
//                             <label htmlFor="micr">Account Number</label>
//                             <input type="number" 
//                             name="account" 
//                             id="account" 
//                             autoComplete="off"
//                             value={data.account}
//                             onChange={handleInput}
//                             required/>
//                         </div>

//                         <div>
//                             <button type="submit">Update</button>
//                         </div>
//                     </form>
//                 </section>
//             </div>
//         </section>



//     )
// }

import '../CSS/Admin.css';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from '../utils/api';
// import '../CSS/RegisterShop.css';

// const token = JSON.parse(localStorage.getItem('token'));

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
    // Other states...
};

export const AdminShopUpdate = () => {
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
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
        bankname: "",
        bankbranch: "",
        ifsc: "",
        micr: "",
        account: "",
    });

    const params = useParams();

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
    
        if (selectedState in stateDistrictCityData) {
            setData({ ...data, state: selectedState, district: '', city: '' });
            const districts = Object.keys(stateDistrictCityData[selectedState]);
            setDistricts(districts);
            setCities([]);
        } else {
            console.error("Selected state not found in data");
            setDistricts([]);
            setCities([]);
        }
    };

    const handleDistrictChange = (e) => {
        const selectedDistrict = e.target.value;
        setData({ ...data, district: selectedDistrict, city: '' });
        const cities = stateDistrictCityData[data.state][selectedDistrict];
        setCities(cities);
    };

    const handleCityChange = (e) => {
        setData({ ...data, city: e.target.value });
    };

    const getSingleUserData = async () => {
        try {
            const response = await api.get(`/admin/shops/${params.id}`)
            // const response = await fetch(`http://localhost:8000/api/admin/shops/${params.id}`, {
            //     method: "GET",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     }
            // });
            const shopData = await response.json();
            setData(shopData);

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
    }, [params.id]);

    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;

        setData({
            ...data,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.patch(`http://localhost:8000/api/admin/shops/update/${params.id}`)
            // const response = await fetch(`http://localhost:8000/api/admin/shops/update/${params.id}`, {
            //     method: "PATCH",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization: `Bearer ${token}`,
            //     },
            //     body: JSON.stringify(data)
            // });
            if (response) {
                toast.success("Updated Successfully");
            } else {
                toast.error("Error in Updation");
            }

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <section className="container">
            <div className="shops-update container">
                <h2 className="heading">Update Shop Data</h2>
            </div>
            <div className="title">
                <div className="content">
                    <form onSubmit={handleSubmit}>
                    <div className="user-details">
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" 
                            name="name" 
                            id="name" 
                            autoComplete="off"
                            value={data.name}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="email">Email</label>
                            <input type="email" 
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            value={data.email}
                            onChange={handleInput}
                            required/>
                        </div>
                        
                        <div>
                            <label htmlFor="phone">Phone</label>
                            <input type="phone" 
                            name="phone" 
                            id="phone" 
                            autoComplete="off"
                            value={data.phone}
                            onChange={handleInput}
                            required/>
                        </div>

                        <div>
                            <label htmlFor="shopname">Shop Name</label>
                            <input type="text" 
                            name="shopname" 
                            id="shopname" 
                            autoComplete="off"
                            value={data.shopname}
                            onChange={handleInput}
                            required/>
                        </div>

                        <div>
                            <span>State</span>
                            <select name="state" value={data.state} onChange={handleStateChange} required>
                                <option value="" disabled>Select State</option>
                                {Object.keys(stateDistrictCityData).map((state, index) => (
                                    <option key={index} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <span>District</span>
                            <select name="district" value={data.district} onChange={handleDistrictChange} required>
                                <option value="" disabled>Select District</option>
                                {districts.map((district, index) => (
                                    <option key={index} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <span>City</span>
                            <select name="city" value={data.city} onChange={handleCityChange} required>
                                <option value="" disabled>Select City</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="street">Street</label>
                            <input type="text" 
                            name="street" 
                            id="street" 
                            autoComplete="off"
                            value={data.street}
                            onChange={handleInput}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="pin">PIN</label>
                            <input type="number" 
                            name="pin" 
                            id="pin" 
                            autoComplete="off"
                            value={data.pin}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div>
                            <label htmlFor="bankname">Bank Name</label>
                            <input type="text" 
                            name="bankname" 
                            id="bankname" 
                            autoComplete="off"
                            value={data.bankname}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div>
                            <label htmlFor="bankbranch">Bank Branch</label>
                            <input type="text" 
                            name="bankbranch" 
                            id="bankbranch" 
                            autoComplete="off"
                            value={data.bankbranch}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div>
                            <label htmlFor="ifsc">IFSC</label>
                            <input type="text" 
                            name="ifsc" 
                            id="ifsc" 
                            autoComplete="off"
                            value={data.ifsc}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div>
                            <label htmlFor="micr">MICR</label>
                            <input type="text" 
                            name="micr" 
                            id="micr" 
                            autoComplete="off"
                            value={data.micr}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div>
                            <label htmlFor="account">Account Number</label>
                            <input type="number" 
                            name="account" 
                            id="account" 
                            autoComplete="off"
                            value={data.account}
                            onChange={handleInput}
                            required/>
                        </div>
                        <div className="button">
                            <input type="submit" value="Update Shop"/>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
