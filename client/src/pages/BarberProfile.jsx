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
        <main className="font-sans bg-gray-100 p-6 min-h-screen">
            <section className="bg-white p-10 rounded-xl shadow-lg max-w-3xl mx-auto">
                <div className="flex justify-end mb-6">
                    <button 
                        onClick={() => navigate(`/barber-profile-update`)} 
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="text-center mb-10">
                    <p className="text-lg font-bold text-blue-500">
                        Welcome <span className="text-red-500 italic">{user?.name}</span>
                    </p>
                    <h3 className="text-2xl text-gray-700 mt-2">Your profile</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 font-semibold">
                    {/* Input Group */}
                    {[
                        { label: "Shop Owner Id", name: "shop_owner_id", type: "text", readOnly: true },
                        { label: "Name", name: "name", type: "text", readOnly: true },
                        { label: "Email", name: "email", type: "email", readOnly: true },
                        { label: "Phone", name: "phone", type: "text", readOnly: true },
                    ].map(({ label, name, type, readOnly }) => (
                        <div key={name} className="flex items-center space-x-4">
                            <label htmlFor={name} className="w-40 text-gray-700 text-right">{label}:</label>
                            <input
                                type={type}
                                name={name}
                                id={name}
                                value={profile[name]}
                                onChange={handleInput}
                                readOnly={readOnly}
                                className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-100"
                                required
                            />
                        </div>
                    ))}

                    {/* Time Slot Creation */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="date" className="w-40 text-gray-700 text-right">Date:</label>
                        <input
                            type="date"
                            name="date"
                            value={profile.date}
                            onChange={handleInput}
                            min={today}
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-lg text-gray-700 mb-2">Time Slots:</label>
                        {profile.showtimes.map((showtime, index) => (
                            <div key={index} className="flex items-center space-x-4 mb-4">
                                <label className="w-40 text-gray-700 text-right">Time {index + 1}:</label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={showtime.date}
                                    onChange={(e) => handleShowtimeChange(index, e)}
                                    min={today}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                        ))}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={addShowtime}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                            >
                                Add Showtime
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
};


