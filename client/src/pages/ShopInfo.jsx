// import '../CSS/ShopInfo.css'
// import  { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// // import axios from 'axios';
// // import { useLogin } from '../components/LoginContext';
// import {useNavigate} from "react-router-dom"
// import { api } from '../utils/api';

// const DateTimeSelection = () => {
//   const { shopId } = useParams();
//   const [timeSlots, setTimeSlots] = useState([]);
//   const [selectedShowtimes, setSelectedShowtimes] = useState([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTimeSlots();
//   }, [shopId]);

//   const fetchTimeSlots = async () => {
//     try {
//       // const response = await axios.get(`http://localhost:8000/api/time/shops/${shopId}/available`);
//       const response = await api.get(`/time/shops/${shopId}/available`);
//       setTimeSlots(response.data);
//     } catch (error) {
//       console.error('Failed to fetch time slots:', error.response ? error.response.data : error.message);
//     }
//   };

//   const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
//     const selectedShowtime = { timeSlotId, showtimeId, showtimeDate };
//     const isAlreadySelected = selectedShowtimes.some(
//       (slot) => slot.showtimeId === showtimeId
//     );

//     if (isAlreadySelected) {
//       // Deselect the time slot
//       const updatedShowtimes = selectedShowtimes.filter(
//         (slot) => slot.showtimeId !== showtimeId
//       );
//       setSelectedShowtimes(updatedShowtimes);
//       setTotalAmount(totalAmount - 60);
//     } else {
//       // Select the time slot
//       setSelectedShowtimes([...selectedShowtimes, selectedShowtime]);
//       setTotalAmount(totalAmount + 60);
//     }
//   };

//   // Redirect to payment page with selectedShowtimes and totalAmount
//   const handleBookAppointment = () => {
//     // console.log("Calculated Total Amount: ", totalAmount); 
//     console.log("Selected time slot: ", selectedShowtimes); 
//     navigate('/payment', {
//       state: {
//         selectedShowtimes, // Pass showtimes if needed on the payment page
//         totalAmount, // Pass the correct total amount from state
//       },
//     });
//   };

//   return (
//     <div className="time-slots-container">
//       <h2 className="section-title">Book Your Time Slot</h2>
//       <div className="time-slots-wrapper">
//         {timeSlots.length > 0 ? (
//           <>
//             {timeSlots.map((timeSlot) => (
//               <div key={timeSlot._id} className="time-slot-card">
//                 <h3 className="time-slot-date">Date: {new Date(timeSlot.date).toLocaleDateString()}</h3>
//                 <div className="showtimes-wrapper">
//                   {timeSlot.showtimes.map((showtime) => (
//                     <button
//                       key={showtime._id}
//                       className={`showtime-button ${showtime.is_booked ? 'booked' : selectedShowtimes.some(slot => slot.showtimeId === showtime._id) ? 'selected' : 'available'}`}
//                       disabled={showtime.is_booked}
//                       onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
//                     >
//                       {new Date(showtime.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ))}
//             <h3>Total Amount: ₹{totalAmount}</h3>
//             <button
//               className="book-appointment-button"
//               onClick={handleBookAppointment}
//               disabled={selectedShowtimes.length === 0}
//             >Book Appointment
//             </button>
//           </>
//         ) : (
//           <h2 className="no-slots-message">No available time slots for this shop.</h2>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DateTimeSelection;

import React from "react"; 
// import '../CSS/ShopInfo.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {useLogin} from '../components/LoginContext'
import { api } from '../utils/api';

const DateTimeSelection = () => {
  const { shopId } = useParams();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shopDetails, setShopDetails] = useState({});
  const [customerEmail, setCustomerEmail] = useState(''); // Assuming you get this from the user context/session
  const [customerName, setCustomerName] = useState(''); // Assuming you get this from the user context/session
  const navigate = useNavigate();
  const {user} = useLogin();

  useEffect(() => {
    fetchTimeSlots();
    fetchShopDetails();
    fetchCustomerEmail(); // Replace this with your logic to get the logged-in user email
  }, [shopId]);

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get(`/time/shops/${shopId}/available`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch time slots:', error.response ? error.response.data : error.message);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shop/shoplists/${shopId}`);
      setShopDetails(response.data); // Assuming the response contains shopName and location
    } catch (error) {
      console.error('Failed to fetch shop details:', error.response ? error.response.data : error.message);
    }
  };

  const fetchCustomerEmail = async () => {
    // Assuming you get the logged-in user from your context or a separate API call
    setCustomerEmail(user.email);
    setCustomerName(user.name);
  };

  const handleShowtimeSelect = (timeSlotId, showtimeId, showtimeDate) => {
    const selectedShowtime = { timeSlotId, showtimeId, showtimeDate };
    const isAlreadySelected = selectedShowtimes.some(
      (slot) => slot.showtimeId === showtimeId
    );

    if (isAlreadySelected) {
      const updatedShowtimes = selectedShowtimes.filter(
        (slot) => slot.showtimeId !== showtimeId
      );
      setSelectedShowtimes(updatedShowtimes);
      setTotalAmount(totalAmount - 60);
    } else {
      setSelectedShowtimes([...selectedShowtimes, selectedShowtime]);
      setTotalAmount(totalAmount + 60);
    }
  };

  const handleBookAppointment = () => {
    navigate('/payment', {
      state: {
        selectedShowtimes, // The time slots the customer selected
        totalAmount, // Total price
        customerEmail, // Customer's email (logged in)
        customerName,
        shopName: shopDetails.shopname, // Shop name
        location: shopDetails.city, // Shop location
      },
    })
  };

  return (
    // <div className="time-slots-container">
    //   <h2 className="section-title">Book Your Time Slot</h2>
    //   <div className="time-slots-wrapper">
    //     {timeSlots.length > 0 ? (
    //       <>
    //         {timeSlots.map((timeSlot) => (
    //           <div key={timeSlot._id} className="time-slot-card">
    //             <h3 className="time-slot-date">Date: {new Date(timeSlot.date).toLocaleDateString('en-IN')}</h3>
    //             <div className="showtimes-wrapper">
    //               {timeSlot.showtimes.map((showtime) => (
    //                 <button
    //                   key={showtime._id}
    //                   className={`showtime-button ${showtime.is_booked ? 'booked' : selectedShowtimes.some(slot => slot.showtimeId === showtime._id) ? 'selected' : 'available'}`}
    //                   disabled={showtime.is_booked}
    //                   onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
    //                 >
    //                   {new Date(showtime.date).toLocaleTimeString('en-US', {
    //                   hour: '2-digit',
    //                   minute: '2-digit'
    //                 })}
    //                 </button>
    //               ))}
    //             </div>
    //           </div>
    //         ))}
    //         <h3>Total Amount: ₹{totalAmount}</h3>
    //         <button
    //           className="book-appointment-button"
    //           onClick={handleBookAppointment}
    //           disabled={selectedShowtimes.length === 0}
    //         >
    //           Book Appointment
    //         </button>
    //       </>
    //     ) : (
    //       <h2 className="no-slots-message">No available time slots for this shop.</h2>
    //     )}
    //   </div>
    // </div>

    <div className="p-5 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-5 text-center">Book Your Time Slot</h2>
      <div className="space-y-5">
        {timeSlots.length > 0 ? (
          <>
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot._id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-xl mb-2 text-gray-800">Date: {new Date(timeSlot.date).toLocaleDateString('en-IN')}</h3>
                <div className="flex gap-2 flex-wrap">
                  {timeSlot.showtimes.map((showtime) => (
                    <button
                      key={showtime._id}
                      className={`px-4 py-2 rounded-lg text-white transition-colors duration-300 min-w-[80px] text-center ${
                        showtime.is_booked
                          ? 'bg-red-500 cursor-not-allowed'
                          : selectedShowtimes.some(slot => slot.showtimeId === showtime._id)
                          ? 'bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      disabled={showtime.is_booked}
                      onClick={() => handleShowtimeSelect(timeSlot._id, showtime._id, showtime.date)}
                    >
                      {new Date(showtime.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <h3 className="text-lg font-semibold">Total Amount: ₹{totalAmount}</h3>
            <button
              className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              onClick={handleBookAppointment}
              disabled={selectedShowtimes.length === 0}
            >
              Book Appointment
            </button>
          </>
        ) : (
          <h2 className="text-red-600 text-xl text-center mt-5">No available time slots for this shop.</h2>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelection;



