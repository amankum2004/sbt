// import { useLogin } from "../components/LoginContext";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { api } from "../utils/api";

// export const BarberProfile = () => {
//     const [profile, setProfile] = useState({
//         shop_owner_id: '',
//         name: '',
//         email: '',
//         phone: '',
//         date: '',
//         showtimes: [{ time: '', is_booked: false }],
//     });
//     const [userData, setUserData] = useState(true);
//     const { user } = useLogin();

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
//                         showtimes: [{ time: '', is_booked: false }],
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
//             showtimes: [...profile.showtimes, { time: '', is_booked: false }],
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             // const response = await axios.post(`http://localhost:8000/api/time/timeslots`, profile);
//             const response = await api.post(`/time/timeslots`, profile);
//             console.log(response);
//             alert('Time slot created successfully');
//         } catch (error) {
//             console.error('Error creating time slot', error);
//             alert('Failed to create time slot');
//         }
//     };

//     // Calculate the current date in the format YYYY-MM-DD for the min attribute
//     const today = new Date().toISOString().split("T")[0];

//     return (
//         <>
//             <main style={{ fontFamily: "'Arial', sans-serif", backgroundColor: "#f9f9f9", padding: "20px" }}>
//                 <section className="section-hero" style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
//                     <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
//                         <div className="hero-content" style={{ textAlign: "center" }}>
//                             <p style={{ fontSize: "20px", color: "#333" }}>
//                                 Welcome, {user ? `${user.name} to our website` : `to our website`}
//                             </p>
//                             <h3 style={{ fontSize: "24px", color: "#555", marginBottom: "30px" }}>It is your profile page</h3>
//                             <form onSubmit={handleSubmit}>
//                                 <div className="input-box" style={{ marginBottom: "20px" }}>
//                                     <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                         Shop Owner Id:
//                                         <input
//                                             type="text"
//                                             placeholder="Shop Owner Id"
//                                             name="shop_owner_id"
//                                             id="shop_owner_id"
//                                             autoComplete="off"
//                                             value={profile.shop_owner_id}
//                                             onChange={handleInput}
//                                             readOnly
//                                             required
//                                             style={{
//                                                 width: "100%",
//                                                 padding: "10px",
//                                                 fontSize: "16px",
//                                                 border: "1px solid #ccc",
//                                                 borderRadius: "4px",
//                                                 marginTop: "8px",
//                                             }}
//                                         />
//                                     </label>
//                                 </div>
//                                 <div className="input-box" style={{ marginBottom: "20px" }}>
//                                     <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                         Name:
//                                         <input
//                                             type="text"
//                                             placeholder="Name"
//                                             name="name"
//                                             id="name"
//                                             autoComplete="off"
//                                             value={profile.name}
//                                             onChange={handleInput}
//                                             readOnly
//                                             required
//                                             style={{
//                                                 width: "100%",
//                                                 padding: "10px",
//                                                 fontSize: "16px",
//                                                 border: "1px solid #ccc",
//                                                 borderRadius: "4px",
//                                                 marginTop: "8px",
//                                             }}
//                                         />
//                                     </label>
//                                 </div>
//                                 <div className="input-box" style={{ marginBottom: "20px" }}>
//                                     <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                         Email:
//                                         <input
//                                             type="email"
//                                             placeholder="Email"
//                                             name="email"
//                                             id="email"
//                                             autoComplete="off"
//                                             value={profile.email}
//                                             onChange={handleInput}
//                                             readOnly
//                                             required
//                                             style={{
//                                                 width: "100%",
//                                                 padding: "10px",
//                                                 fontSize: "16px",
//                                                 border: "1px solid #ccc",
//                                                 borderRadius: "4px",
//                                                 marginTop: "8px",
//                                             }}
//                                         />
//                                     </label>
//                                 </div>
//                                 <div className="input-box" style={{ marginBottom: "20px" }}>
//                                     <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                         Phone:
//                                         <input
//                                             type="phone"
//                                             placeholder="Phone"
//                                             name="phone"
//                                             id="phone"
//                                             autoComplete="off"
//                                             value={profile.phone}
//                                             onChange={handleInput}
//                                             readOnly
//                                             required
//                                             style={{
//                                                 width: "100%",
//                                                 padding: "10px",
//                                                 fontSize: "16px",
//                                                 border: "1px solid #ccc",
//                                                 borderRadius: "4px",
//                                                 marginTop: "8px",
//                                             }}
//                                         />
//                                     </label>
//                                 </div>

//                                 <h2 style={{ fontSize: "22px", color: "#444", margin: "30px 0 20px" }}>Create Time Slot</h2>
//                                 <div style={{ marginBottom: "20px" }}>
//                                     <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                         Date:
//                                         <input
//                                             type="date"
//                                             name="date"
//                                             value={profile.date}
//                                             onChange={handleInput}
//                                             required
//                                             min={today}
//                                             style={{
//                                                 width: "100%",
//                                                 padding: "10px",
//                                                 fontSize: "16px",
//                                                 border: "1px solid #ccc",
//                                                 borderRadius: "4px",
//                                                 marginTop: "8px",
//                                             }}
//                                         />
//                                     </label>
//                                 </div>
//                                 {profile.date && (
//                                     <div style={{ marginBottom: "20px" }}>
//                                         <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
//                                             Showtimes:
//                                         </label>
//                                         {profile.showtimes.map((showtime, index) => (
//                                             <div key={index} style={{ marginBottom: "10px" }}>
//                                                 <label style={{ fontSize: "16px", color: "#555", display: "block", marginBottom: "4px" }}>
//                                                     Time:
//                                                     <input
//                                                         type="time"
//                                                         name="time"
//                                                         value={showtime.time}
//                                                         onChange={(e) => handleShowtimeChange(index, e)}
//                                                         required
//                                                         style={{
//                                                             width: "100%",
//                                                             padding: "8px",
//                                                             fontSize: "16px",
//                                                             border: "1px solid #ccc",
//                                                             borderRadius: "4px",
//                                                             marginTop: "4px",
//                                                         }}
//                                                     />
//                                                 </label>
//                                             </div>
//                                         ))}
//                                         <button
//                                             type="button"
//                                             onClick={addShowtime}
//                                             style={{
//                                                 backgroundColor: "#007bff",
//                                                 color: "#fff",
//                                                 padding: "10px 20px",
//                                                 fontSize: "16px",
//                                                 borderRadius: "4px",
//                                                 border: "none",
//                                                 cursor: "pointer",
//                                             }}
//                                         >
//                                             Add Showtime
//                                         </button>
//                                     </div>
//                                 )}
//                                 <div>
//                                     <button
//                                         type="submit"
//                                         style={{
//                                             backgroundColor: "#28a745",
//                                             color: "#fff",
//                                             padding: "12px 30px",
//                                             fontSize: "18px",
//                                             borderRadius: "4px",
//                                             border: "none",
//                                             cursor: "pointer",
//                                         }}
//                                     >
//                                         Submit
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </section>
//             </main>
//         </>
//     );
// };




import { useLogin } from "../components/LoginContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import { api } from "../utils/api";

export const BarberProfile = () => {
    const [userData, setUserData] = useState(true);
    const { user } = useLogin();
    const navigate = useNavigate()
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
            // const response = await axios.post(`http://localhost:8000/api/time/timeslots`, profile);
            console.log(response);
            alert('Time slot created successfully');
            navigate('/')
        } catch (error) {
            console.error('Error creating time slot', error);
            alert('Failed to create time slot');
        }
    };

    // Calculate the current date in the format YYYY-MM-DD for the min attribute
    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            <main style={{ fontFamily: "'Arial', sans-serif", backgroundColor: "#f9f9f9", padding: "20px" }}>
                <section className="section-hero" style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                    <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="hero-content" style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "20px", color: "#333" }}>
                                Welcome, {user ? `${user.name} to our website` : `to our website`}
                            </p>
                            <h3 style={{ fontSize: "24px", color: "#555", marginBottom: "30px" }}>It is your profile page</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="input-box" style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Shop Owner Id:
                                        <input
                                            type="text"
                                            placeholder="Shop Owner Id"
                                            name="shop_owner_id"
                                            id="shop_owner_id"
                                            autoComplete="off"
                                            value={profile.shop_owner_id}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                marginTop: "8px",
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="input-box" style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Name:
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            name="name"
                                            id="name"
                                            autoComplete="off"
                                            value={profile.name}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                marginTop: "8px",
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="input-box" style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Email:
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            name="email"
                                            id="email"
                                            autoComplete="off"
                                            value={profile.email}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                marginTop: "8px",
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="input-box" style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Phone:
                                        <input
                                            type="phone"
                                            placeholder="Phone"
                                            name="phone"
                                            id="phone"
                                            autoComplete="off"
                                            value={profile.phone}
                                            onChange={handleInput}
                                            readOnly
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                marginTop: "8px",
                                            }}
                                        />
                                    </label>
                                </div>

                                <h2 style={{ fontSize: "22px", color: "#444", margin: "30px 0 20px" }}>Create Time Slot</h2>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Date:
                                        <input
                                            type="date"
                                            name="date"
                                            value={profile.date}
                                            onChange={handleInput}
                                            required
                                            min={today}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                fontSize: "16px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                marginTop: "8px",
                                            }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ fontSize: "18px", color: "#333", display: "block", marginBottom: "8px" }}>
                                        Showtimes:
                                    </label>
                                    {profile.showtimes.map((showtime, index) => (
                                        <div key={index} style={{ marginBottom: "10px" }}>
                                            <label style={{ fontSize: "16px", color: "#555", display: "block", marginBottom: "4px" }}>
                                                Time:
                                                <input
                                                    type="datetime-local"
                                                    name="date"
                                                    value={showtime.date}
                                                    onChange={(e) => handleShowtimeChange(index, e)}
                                                    required
                                                    min={today}
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px",
                                                        fontSize: "16px",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px",
                                                        marginTop: "4px",
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addShowtime}
                                        style={{
                                            backgroundColor: "#007bff",
                                            color: "#fff",
                                            padding: "10px 20px",
                                            fontSize: "16px",
                                            borderRadius: "4px",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Add Showtime
                                    </button>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        style={{
                                            backgroundColor: "#28a745",
                                            color: "#fff",
                                            padding: "12px 30px",
                                            fontSize: "18px",
                                            borderRadius: "4px",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};








