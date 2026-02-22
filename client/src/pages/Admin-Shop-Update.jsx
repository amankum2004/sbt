import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { stateDistrictCityData } from "../utils/locationData"
import { api } from '../utils/api';
import Swal from "sweetalert2";

// const token = JSON.parse(localStorage.getItem('token'));

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
      const response = await api.patch(`/admin/shops/update/${params.id}`, data);
      
      if (response.status === 200) {
        Swal.fire({
          title: "Success",
          text: "Updated successfully",
          icon: "success"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error in updating shop",
          icon: "error"
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Failed to update shop",
        icon: "error"
      });
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />

      <section className="relative mx-auto mt-6 w-full max-w-4xl rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Admin Panel
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Update Shop Data</h2>
          <p className="mt-2 text-sm text-slate-600">Keep salon details accurate for better booking experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={data.name}
                onChange={handleInput}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={data.email}
                onChange={handleInput}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={data.phone}
                onChange={handleInput}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div>
              <label htmlFor="shopname" className="mb-1 block text-sm font-semibold text-slate-700">Shop Name</label>
              <input
                type="text"
                name="shopname"
                id="shopname"
                value={data.shopname}
                onChange={handleInput}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">State</label>
              <select
                name="state"
                value={data.state}
                onChange={handleStateChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="" disabled>Select State</option>
                {Object.keys(stateDistrictCityData).map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">District</label>
              <select
                name="district"
                value={data.district}
                onChange={handleDistrictChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="" disabled>Select District</option>
                {districts.map((district, index) => (
                  <option key={index} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
              <select
                name="city"
                value={data.city}
                onChange={handleCityChange}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="" disabled>Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="street" className="mb-1 block text-sm font-semibold text-slate-700">Street</label>
              <input
                type="text"
                name="street"
                id="street"
                value={data.street}
                onChange={handleInput}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div>
              <label htmlFor="pin" className="mb-1 block text-sm font-semibold text-slate-700">PIN</label>
              <input
                type="number"
                name="pin"
                id="pin"
                value={data.pin}
                onChange={handleInput}
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Services & Pricing</h3>
            <div className="space-y-3">
              {data.services.map((service, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    type="text"
                    name="service"
                    placeholder="Service Name"
                    value={service.service}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={service.price}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 sm:w-32"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddService}
              className="mt-4 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              Add Service
            </button>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-8 py-3 text-sm font-black text-slate-950 transition hover:brightness-110"
            >
              Update Shop
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
