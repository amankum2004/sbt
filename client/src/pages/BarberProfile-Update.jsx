import React from "react"; 
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from '../utils/api';
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
// import axios from "axios";


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

export const BarberProfileUpdate = () => {
    const navigate = useNavigate();
    const { user } = useLogin();
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
        services: [{ service: '', price: '' }]
    });


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

    const handleServiceChange = (e, index) => {
      const updatedServices = data.services.map((service, i) =>
          i === index ? { ...service, [e.target.name]: e.target.value } : service
      );
      setData({ ...data, services: updatedServices });
  };
    const handleAddService = () => {
      setData({ ...data, services: [...data.services, { service: '', price: '' }] });
    };
    const handleRemoveService = (index) => {
        const updatedServices = data.services.filter((service, i) => i !== index);
        setData({ ...data, services: updatedServices });
    };

    const getSingleUserData = async () => {
        try {
            const response = await api.get(`/shop/by-email/${user.email}`)
            const shopData = await response.data;
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
    }, [user.email]);

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
            const response = await api.patch(`/shop/update`,{email: data.email,...data})
            if (response) {
                toast.success("Updated Successfully");
                navigate('/barberprofile')
            } else {
                toast.error("Error in Updation");
            }

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <section className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl text-center font-semibold text-purple-600 mb-6">Update Shop Data</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" readOnly value={data.name} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" readOnly value={data.email} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="phone" name="phone" id="phone" readOnly value={data.phone} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="shopname" className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input type="text" name="shopname" id="shopname" value={data.shopname} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select name="state" value={data.state} onChange={handleStateChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
              <option value="" disabled>Select State</option>
              {Object.keys(stateDistrictCityData).map((state, index) => (
                <option key={index} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select name="district" value={data.district} onChange={handleDistrictChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
              <option value="" disabled>Select District</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select name="city" value={data.city} onChange={handleCityChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
              <option value="" disabled>Select City</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
            <input type="text" name="street" id="street" value={data.street} onChange={handleInput} className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700">PIN</label>
            <input type="number" name="pin" id="pin" value={data.pin} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="bankname" className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input type="text" name="bankname" id="bankname" value={data.bankname} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="bankbranch" className="block text-sm font-medium text-gray-700">Bank Branch</label>
            <input type="text" name="bankbranch" id="bankbranch" value={data.bankbranch} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700">IFSC</label>
            <input type="text" name="ifsc" id="ifsc" value={data.ifsc} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="micr" className="block text-sm font-medium text-gray-700">MICR</label>
            <input type="text" name="micr" id="micr" value={data.micr} onChange={handleInput} className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700">Account Number</label>
            <input type="text" name="account" id="account" value={data.account} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>
        </div>

        <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Services</h3>
                    {data.services.map((service, index) => (
                        <div key={index} className="flex items-center space-x-4 mb-4">
                            <input type="text" name="service" placeholder="Service Name" value={service.service}
                                onChange={(e) => handleServiceChange(e, index)} className="w-full h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                            <input type="number" name="price" placeholder="Price" value={service.price}
                                onChange={(e) => handleServiceChange(e, index)} className="w-24 h-10 border rounded p-2 focus:outline-none focus:border-purple-500" />
                            <button type="button" onClick={() => handleRemoveService(index)} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition duration-300 transform hover:-translate-y-1">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddService} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-300 transform hover:-translate-y-1">Add Service</button>
                </div>

        <div className="text-center">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md">Update Shop</button>
        </div>
      </form>
    </section>

    )
}


export default BarberProfileUpdate;
