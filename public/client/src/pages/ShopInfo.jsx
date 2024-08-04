// import  { useState } from 'react';
// import { useAuth } from '../store/auth';

// const defaultContactFormData = {
//   username:"",
//   email:"",
//   phone:"",
// };

// export const DateTimeSelection = () => {
//   const [contact,setContact] = useState(defaultContactFormData);
//   const [userData,setUserData] = useState(true); 
//   const {user} = useAuth();

//   if (userData && user) {
//       setContact({
//           username: user.username,
//           email: user.email,
//           phone: user.phone,
//       });
//       setUserData(false);
//   }

//   const handleInput = (e) => {
//       let name = e.target.name;
//       let value = e.target.value;

//       setContact({
//           ...contact,
//           [name]:value,
//       })
//   }
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
//   const [timeSlots, setTimeSlots] = useState([]);

//   const handleDateChange = (event) => {
//     const selectedDate = event.target.value;
//     setSelectedDate(selectedDate);
//     generateTimeSlots(selectedDate);
//   };

//   const generateTimeSlots = (date) => {
//     const timeSlotsForDate = [];
//     const currentTime = new Date().getTime();
//     for (let i = 0; i < 24; i++) {
//       const time = new Date(date);
//       time.setHours(i);
//       if (time.getTime() > currentTime) {
//         timeSlotsForDate.push({ time: time.toLocaleTimeString(), available: Math.random() < 0.8 });
//       }
//     }
//     setTimeSlots(timeSlotsForDate);
//   };

//   // Format date as YYYY-MM-DD
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   return (
//     <div>
//       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
//       <div className="form-inp">
// 				<span><i className="fa fa-user"></i></span>
// 				<input type="text"
//           name="username"
//           placeholder="Name"
//           id="username"
//           value={contact.username}
//           required
//           readOnly
//           autoComplete="off" 
//           onChange={handleInput}/>
// 			</div>
//       <div className="form-inp">
// 				<span><i className="fa fa-envelope"></i></span>
// 				<input type="email"
//           name="email"
//           placeholder="Name"
//           id="email"
//           value={contact.email}
//           required
//           readOnly
//           autoComplete="off" 
//           onChange={handleInput}/>
// 			</div>

//       <div className="form-inp">
//       <span><i className="fa fa-phone"></i></span>
//         <input type="number"
//           name="phone"
//           placeholder="Enter your number"
//           id="phone"
//           value={contact.phone}
//           readOnly
//           required
//           autoComplete="off"
//           onChange={handleInput}/>
//       </div>


//       <h2>Date and Time Selection</h2>
//       <form className='my-form'>
//         <label htmlFor="date">Select a Date:</label>
//         <input type="date" id="date" name="date" min={formatDate(new Date())} value={selectedDate} onChange={handleDateChange} required />
//         <br />
//         <label htmlFor="time">Select a Time:</label>
//         <div className="time-slots">
//           {timeSlots.map((slot, index) => (
//             <div
//               key={index}
//               className={`time-slot ${slot.available ? 'available' : 'booked'} ${slot.time === selectedTime ? 'selected' : ''}`}
//               onClick={() => setSelectedTime(slot.time)}
//             >
//               {slot.time}
//             </div>
//           ))}
//         </div>
//         <br />
//         {/* <input type="submit" value="Next" /> */}
//         {/* <button type="submit" className="btn btn-info">Next</button> */}
//         <a href="/payment">
//           <button className="btn btn-info" type="button">Next</button>
//         </a>
//       </form>
//     </div>
//   );
// };



import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../store/auth';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import PropTypes from "prop-types"
// import { Link } from 'react-router-dom';

const defaultContactFormData = {
  username:"",
  useremail:"",
  userphone:"",
  shop_owner_id: "",
  // time_slot_id: "",
};


// const DateTimeSelection = ({onSelectTimeSlot}) => {
const DateTimeSelection = () => {
  const [details,setDetails] = useState(defaultContactFormData);
  const [userData,setUserData] = useState(true); 
  const [timeSlots, setTimeSlots] = useState([]);
  const {user, API} = useAuth();

  const {id} = useParams();
  const [objectId, setObjectId] = useState(null);

  DateTimeSelection.propTypes = {
    onSelectTimeSlot: PropTypes.string.isRequired, // or PropTypes.number, depending on the type of shopOwnerId
    selectedTimeSlotId: PropTypes.string.isRequired
  };

  useEffect(() => {
    if (id) {
      setObjectId(id);
    }
  }, [id]);

  if (userData && user) {
    setDetails({
      username: user.username,
      email: user.email,
      phone: user.phone,
      shop_owner_id: "",
      // shopname:"",
      // time_slot_id: "",
    });
    setUserData(false);
  }

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setDetails({
        ...details,
        [name]:value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/api/appointment`,{
        username: user.username,
        email: user.email,
        phone: user.phone,
        shop_owner_id: "",
      })
      // console.log(response)
      // console.log(response.data)
      //   const response = await fetch(`${API}/api/appointment`, {
      //   method: "POST",
      //   headers: {
      //     'Content-Type':"application/json",
      //   },
      //   body: JSON.stringify(details)
      // });
      if(response.ok){
        setDetails(defaultContactFormData);
        const data = await response.json();
        console.log(data);
        // alert("Appointment booked successfully");
        Swal.fire({
            title: "Success",
            text: "Appointment booked successfully",
            icon: "success",
        });
        // alert('Appointment booked successfully');
        // navigate("/")
    }
    } catch (error) {
      console.error('Error booking appointment', error);
      alert('Failed to book appointment');
    }
  };


  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await axios.get(`${API}/api/timeslots/available`);
        console.log(response)
        setTimeSlots(response.data);
        // console.log(response.data)
      } catch (error) {
        console.error('Error fetching time slots', error);
      }
    };
    fetchTimeSlots();
  }, [API]);

  // const handleSelect = (slot) => {
  //   if (onSelectTimeSlot) {
  //     onSelectTimeSlot(slot._id);
  //   }
  // };

  return (
    <div>
      <h2>Available Time Slots</h2>
      {/* <p>ObjectId: {objectId}</p> */}
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
                            value={details.username}
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
                            value={details.email}
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
                            value={details.phone}
                            onChange={handleInput}
                            readOnly
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Shop Owner Id : 
                        <input type="text" 
                            placeholder="Shop Owner Id" 
                            value={objectId}
                            onChange={handleInput}
                            required/>
                        </label>
                        </div>
                        {/* <div className="input-box">
                        <label>
                            Shop Name : 
                        <input type="text" 
                            placeholder="Shop Name" 
                            // value={objectId}
                            onChange={handleInput}
                            required/>
                        </label>
                        </div>
                        <div className="input-box">
                        <label>
                            Time Slot Id : 
                        <input type="text" 
                            placeholder="Time Slot Id" 
                            // value={selectedTimeSlotId || ''}
                            onChange={handleInput}
                            required/>
                        </label>
                        </div> */}

                        {/* <ul>
                          {timeSlots.map((slot) => (
                            <li key={slot.id}>
                              {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                            </li>
                          ))}
                        </ul> */}

                        <div>
                          {timeSlots.map((slot) => (
                            <button
                              key={slot._id}
                              // onClick={() => handleSelect(slot)}
                              style={{ margin: '5px', padding: '10px' }}
                            >
                              {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                            </button>
                          ))}
                        </div>

                        {/* <div>
                          {timeSlots.map((slot) => (
                            <button
                              key={slot._id}
                              onClick={() => handleSelect(slot)}
                              style={{ margin: '5px', padding: '10px' }}
                            >
                              {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                            </button>
                          ))}
                        </div> */}

                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                  </div>
                </div>
            </section>
    </div>
    
  );
};

export default DateTimeSelection;




