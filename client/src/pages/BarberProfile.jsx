import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";

export const BarberProfile = () => {
    const [userData, setUserData] = useState(true);
    const { user } = useLogin();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        shop_owner_id: '',
        name: '',
        email: '',
        phone: '',
        date: '',
        showtimes: [{ date: '', is_booked: false }],
    });

    useEffect(() => {
        if (userData && user) {
            const fetchShopOwnerId = async () => {
                try {
                    const response = await api.get(`/shop/by-email/${user.email}`);
                    const shopId = response.data._id || '';

                    setProfile({
                        shop_owner_id: shopId,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        date: '',
                        showtimes: [{ date: '', is_booked: false }],
                    });
                } catch (error) {
                    console.error('Error fetching shop data:', error);
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                    }));
                } finally {
                    setUserData(false);
                }
            };

            fetchShopOwnerId();
        }
    }, [user, userData]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value,
        });
    };

    const handleShowtimeChange = (index, e) => {
        const { name, value } = e.target;
        const newShowtimes = [...profile.showtimes];
        newShowtimes[index] = {
            ...newShowtimes[index],
            [name]: value,
        };
        setProfile({
            ...profile,
            showtimes: newShowtimes,
        });
    };

    const addShowtime = () => {
        setProfile({
            ...profile,
            showtimes: [...profile.showtimes, { date: '', is_booked: false }],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/time/timeslots`, profile);
            Swal.fire({ title: "Success", text: "Time slot created successfully", icon: "success" });
            navigate('/');
        } catch (error) {
            console.error('Error creating time slot', error);
            alert('Failed to create time slot');
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <main className="min-h-screen bg-gradient-to-tr from-purple-100 via-pink-50 to-indigo-100 py-10 px-4">
  <section className="bg-white max-w-4xl mx-auto rounded-3xl shadow-2xl p-10 border border-purple-200">
    
    {/* Edit Button */}
    <div className="flex justify-end">
      <button 
        onClick={() => navigate(`/barber-profile-update`)} 
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-transform transform hover:scale-105"
      >
        Edit Profile
      </button>
    </div>

    {/* Welcome Section */}
    <div className="text-center my-10">
      <h1 className="text-4xl font-extrabold text-purple-800">
        Welcome <span className="text-pink-600 italic">{user?.name}</span>
      </h1>
      <p className="mt-2 text-gray-600 text-lg">Manage your salon profile and available time slots</p>
    </div>

    {/* Profile Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Profile Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Shop Owner ID", name: "shop_owner_id", type: "text" },
          { label: "Name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              id={name}
              value={profile[name]}
              onChange={handleInput}
              readOnly
              className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
        ))}
      </div>

      {/* Date Picker */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={profile.date}
          onChange={handleInput}
          min={today}
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />
      </div>

      {/* Showtimes */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Time Slots</label>
        {profile.showtimes.map((showtime, index) => (
          <div key={index} className="flex items-center space-x-4 mb-4">
            <span className="w-24 text-right text-gray-600 font-medium">Slot {index + 1}:</span>
            <input
              type="datetime-local"
              name="date"
              value={showtime.date}
              onChange={(e) => handleShowtimeChange(index, e)}
              min={today}
              className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
        ))}

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={addShowtime}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-transform transform hover:scale-105 shadow-md"
          >
            + Add Slot
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-10">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-10 py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg"
        >
          Submit Slots
        </button>
      </div>
    </form>
  </section>
</main>

    );
};


