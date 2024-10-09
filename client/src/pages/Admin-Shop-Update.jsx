import React from "react"; 
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from '../utils/api';

// const token = JSON.parse(localStorage.getItem('token'));

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
        services: [{ service: '', price: '' }]
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
            const response = await api.get(`/admin/shops/${params.id}`)
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
        <section className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl text-center font-semibold text-purple-600 mb-6">Update Shop Data</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" value={data.name} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={data.email} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="phone" name="phone" id="phone" value={data.phone} onChange={handleInput} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md"/>
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
