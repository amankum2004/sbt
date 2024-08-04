// import  { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../store/auth';


// const BarberProfile = () => {
//   // const [shopOwnerId, setShopOwnerId] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const {API} = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${API}/api/timeslots`, {
//         // shop_owner_id: shopOwnerId,
//         start_time: new Date(startTime),
//         end_time: new Date(endTime),
//       });
//       alert('Time slot created successfully');
//     } catch (error) {
//       console.error('Error creating time slot', error);
//       alert('Failed to create time slot');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Create Time Slot</h2>
//       {/* <input
//         type="text"
//         placeholder="Shop Owner ID"
//         value={objectId}
//         onChange={(e) => setShopOwnerId(e.target.value)}
//       /> */}
//       <input
//         type="datetime-local"
//         placeholder="Start Time"
//         value={startTime}
//         onChange={(e) => setStartTime(e.target.value)}
//       />
//       <input
//         type="datetime-local"
//         placeholder="End Time"
//         value={endTime}
//         onChange={(e) => setEndTime(e.target.value)}
//       />
//       <button type="submit">Create</button>
//     </form>
//   );
// };

// export default BarberProfile;


import { useAuth } from "../store/auth";
import { useState } from "react";
import axios from "axios";
// import { useParams } from "react-router-dom";

const timeSlotData = {
    username:"",
    email:"",
    phone:"",
    start_time:"",
    end_time:""
};

export const BarberProfile = () => {
    const [profile,setProfile] = useState(timeSlotData);
    const [userData,setUserData] = useState(true); 
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const {user,API} = useAuth();

    if (userData && user) {
        setProfile({
            username: user.username,
            email: user.email,
            phone: user.phone,
            start_time: new Date(startTime),
            end_time: new Date(endTime),
        });
        setUserData(false);
    }

    const handleInput = (e) => {
        let name = e.target.name;
        let value = e.target.value;

        setProfile({
            ...profile,
            [name]:value,
        })
    }
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post(`${API}/api/timeslots`, {
            username:user.username,
            email:user.email,
            phone:user.phone,
            start_time: new Date(startTime),
            end_time: new Date(endTime),
          });
          console.log(response)
          alert('Time slot created successfully');
        } catch (error) {
          console.error('Error creating time slot', error);
          alert('Failed to create time slot');
        }
      };


    return (
        <>
        <main>
            <section className="section-hero">
                <div className="container">
                    <div className="hero-content">
                        <p>Welcome, 
                            {user ? `${user.username} to our website` : `to our website`}
                        </p>
                        <h3>It is your profile page</h3>
                        <form onSubmit={handleSubmit}>
                        <div className="input-box">
                        <label>
                            Name : 
                        <input type="text" 
                            placeholder="Name"
                            name="username" 
                            id="username" 
                            autoComplete="off"
                            value={profile.username}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Email : 
                        <input type="email" 
                            placeholder="Email"
                            name="email" 
                            id="email" 
                            autoComplete="off"
                            value={profile.email}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Phone : 
                        <input type="phone" 
                            placeholder="Phone"
                            name="phone" 
                            id="phone" 
                            autoComplete="off"
                            value={profile.phone}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>

                        <h2>Create Time Slot</h2>
                        <input
                          type="datetime-local"
                          placeholder="Start Time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                        <input
                          type="datetime-local"
                          placeholder="End Time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                        
                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                    </div>
                </div>
            </section>
        </main>
        </>
    )
}