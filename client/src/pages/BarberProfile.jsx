// import { useLogin } from "../components/LoginContext";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// import { api } from "../utils/api";
// import React from "react"; 

// export const BarberProfile = () => {
//     const [userData, setUserData] = useState(true);
//     const { user } = useLogin();
//     const navigate = useNavigate()
//     const [profile, setProfile] = useState({
//         shop_owner_id: '',
//         name: '',
//         email: '',
//         phone: '',
//         date: '',
//         showtimes: [{ date: '', is_booked: false }],
//     });

//     useEffect(() => {
//         if (userData && user) {
//             const fetchShopOwnerId = async () => {
//                 try {
//                     const response = await api.get(`/shop/by-email/${user.email}`);
//                     const shopId = response.data._id;

//                     setProfile({
//                         shop_owner_id: shopId,
//                         name: user.name,
//                         email: user.email,
//                         phone: user.phone,
//                         date: '',
//                         showtimes: [{ date: '', is_booked: false }],
//                     });
//                     setUserData(false);
//                 } catch (error) {
//                     console.error('Error fetching shop data:', error);
//                 }
//             };

//             fetchShopOwnerId();
//         }
//     }, [user, userData]);

//     const handleInput = (e) => {
//         const { name, value } = e.target;
//         setProfile({
//             ...profile,
//             [name]: value,
//         });
//     };

//     const handleShowtimeChange = (index, e) => {
//         const { name, value } = e.target;
//         const newShowtimes = [...profile.showtimes];
//         newShowtimes[index] = {
//             ...newShowtimes[index],
//             [name]: value,
//         };
//         setProfile({
//             ...profile,
//             showtimes: newShowtimes,
//         });
//     };

//     const addShowtime = () => {
//         setProfile({
//             ...profile,
//             showtimes: [...profile.showtimes, { date: '', is_booked: false }],
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await api.post(`/time/timeslots`, profile);
//             console.log(response);
//             alert('Time slot created successfully');
//             navigate('/')
//         } catch (error) {
//             console.error('Error creating time slot', error);
//             alert('Failed to create time slot');
//         }
//     };

//     // Calculate the current date in the format YYYY-MM-DD for the min attribute
//     const today = new Date().toISOString().split("T")[0];

//     return (
//      <>
//         <main className="font-sans bg-gray-100 p-5">
//                 <section className="bg-white p-10 rounded-lg shadow-lg max-w-2xl mx-auto">
//                     <div className="text-center">
//                     <p className="text-lg font-bold text-blue-500 mb-6">
//                                 Welcome 
//                                 {user ? (  
//                                 <>
//                                     <span className="text-red-500 italic font-bold mx-1">{user.name}</span> to our website
//                                 </>
//                                 ) : ` to our website `}
//                             </p>
//                         <h3 className="text-2xl text-gray-700 mb-6">It is your profile page</h3>
//                         <form onSubmit={handleSubmit}>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">
//                                     Shop Owner Id:
//                                     <input
//                                         type="text"
//                                         placeholder="Shop Owner Id"
//                                         name="shop_owner_id"
//                                         id="shop_owner_id"
//                                         value={profile.shop_owner_id}
//                                         onChange={handleInput}
//                                         readOnly
//                                         required
//                                         className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
//                                     />
//                                 </label>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">
//                                     Name:
//                                     <input
//                                         type="text"
//                                         placeholder="Name"
//                                         name="name"
//                                         id="name"
//                                         value={profile.name}
//                                         onChange={handleInput}
//                                         readOnly
//                                         required
//                                         className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
//                                     />
//                                 </label>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">
//                                     Email:
//                                     <input
//                                         type="email"
//                                         placeholder="Email"
//                                         name="email"
//                                         id="email"
//                                         value={profile.email}
//                                         onChange={handleInput}
//                                         readOnly
//                                         required
//                                         className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
//                                     />
//                                 </label>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">
//                                     Phone:
//                                     <input
//                                         type="phone"
//                                         placeholder="Phone"
//                                         name="phone"
//                                         id="phone"
//                                         value={profile.phone}
//                                         onChange={handleInput}
//                                         readOnly
//                                         required
//                                         className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
//                                     />
//                                 </label>
//                             </div>

//                             <h2 className="text-xl text-gray-700 my-3">Create Time Slot</h2>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">
//                                     Date:
//                                     <input
//                                         type="date"
//                                         name="date"
//                                         value={profile.date}
//                                         onChange={handleInput}
//                                         required
//                                         min={today}
//                                         className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
//                                     />
//                                 </label>
//                             </div>
//                             <div className="mb-3">
//                                 <label className="block text-lg text-gray-700 mb-1">Showtimes:</label>
//                                 {profile.showtimes.map((showtime, index) => (
//                                     <div key={index} className="mb-4">
//                                         <label className="block text-md text-gray-600 mb-1">
//                                             Time:
//                                             <input
//                                                 type="datetime-local"
//                                                 name="date"
//                                                 value={showtime.date}
//                                                 onChange={(e) => handleShowtimeChange(index, e)}
//                                                 required
//                                                 min={today}
//                                                 className="w-full p-2 border border-gray-300 rounded-lg mt-1"
//                                             />
//                                         </label>
//                                     </div>
//                                 ))}
//                                 <button
//                                     type="button"
//                                     onClick={addShowtime}
//                                     className="bg-blue-600 text-white px-5 py-2 mb-5 rounded-lg hover:bg-blue-700 transition duration-300"
//                                 >
//                                     Add Showtime
//                                 </button>
//                             </div>
//                             <div>
//                                 <button
//                                     type="submit"
//                                     className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
//                                 >
//                                     Submit
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </section>
//             </main>
//         </>
//     );
// };



import { useLogin } from "../components/LoginContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import React from "react"; 

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
                    const shopId = response.data._id;

                    setProfile({
                        shop_owner_id: shopId,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        date: '',
                        showtimes: [{ date: '', is_booked: false }],
                    });
                    setUserData(false);
                } catch (error) {
                    console.error('Error fetching shop data:', error);
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
            console.log(response);
            alert('Time slot created successfully');
            navigate('/');
        } catch (error) {
            console.error('Error creating time slot', error);
            alert('Failed to create time slot');
        }
    };

    // Calculate the current date in the format YYYY-MM-DD for the min attribute
    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            <main className="font-sans bg-gray-100 p-5 relative">
                <section className="bg-white p-10 rounded-lg shadow-lg max-w-2xl mx-auto relative">
                    {/* Edit button on top right */}
                    <button 
                        // onClick={() => navigate(`/barber-profile-update/${profile.shop_owner_id}`)} 
                        onClick={() => navigate(`/barber-profile-update`)} 
                        className="bg-yellow-500 text-white px-4 py-2 rounded">
                        Edit Profile
                    </button>

                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-500 mb-6">
                            Welcome {user ? (  
                                <span className="text-red-500 italic font-bold mx-1">{user.name}</span> 
                                ) : `to our website`}
                        </p>
                        <h3 className="text-2xl text-gray-700 mb-6">It is your profile page</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">
                                    Shop Owner Id:
                                    <input
                                        type="text"
                                        placeholder="Shop Owner Id"
                                        name="shop_owner_id"
                                        id="shop_owner_id"
                                        value={profile.shop_owner_id}
                                        onChange={handleInput}
                                        readOnly
                                        required
                                        className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
                                    />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">
                                    Name:
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        name="name"
                                        id="name"
                                        value={profile.name}
                                        onChange={handleInput}
                                        readOnly
                                        required
                                        className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
                                    />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">
                                    Email:
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        name="email"
                                        id="email"
                                        value={profile.email}
                                        onChange={handleInput}
                                        readOnly
                                        required
                                        className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
                                    />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">
                                    Phone:
                                    <input
                                        type="phone"
                                        placeholder="Phone"
                                        name="phone"
                                        id="phone"
                                        value={profile.phone}
                                        onChange={handleInput}
                                        readOnly
                                        required
                                        className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
                                    />
                                </label>
                            </div>

                            <h2 className="text-xl text-gray-700 my-3">Create Time Slot</h2>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">
                                    Date:
                                    <input
                                        type="date"
                                        name="date"
                                        value={profile.date}
                                        onChange={handleInput}
                                        required
                                        min={today}
                                        className="w-full p-1.5 border border-gray-300 rounded-lg mt-1"
                                    />
                                </label>
                            </div>
                            <div className="mb-3">
                                <label className="block text-lg text-gray-700 mb-1">Showtimes:</label>
                                {profile.showtimes.map((showtime, index) => (
                                    <div key={index} className="mb-4">
                                        <label className="block text-md text-gray-600 mb-1">
                                            Time:
                                            <input
                                                type="datetime-local"
                                                name="date"
                                                value={showtime.date}
                                                onChange={(e) => handleShowtimeChange(index, e)}
                                                required
                                                min={today}
                                                className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                                            />
                                        </label>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addShowtime}
                                    className="bg-blue-600 text-white px-5 py-2 mb-5 rounded-lg hover:bg-blue-700 transition duration-300"
                                >
                                    Add Showtime
                                </button>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
};








