// without payment options - directly confirm booking
import React from "react";
import { useEffect } from "react";
import { useLogin } from '../components/LoginContext'
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { useLocation } from 'react-router-dom';

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useLogin();
  const { 
    selectedShowtimes,
    totalAmount,
    customerEmail = '',
    customerName = '',
    shopName = '',
    shopPhone = '',
    location: shopLocation = '',
    shopId = '',
    showtimeServices = {} // Make sure this is included
  } = location.state || {};

  // Function to format time in AM/PM format
  const formatTimeAMPM = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    console.log("Booking Details from location.state:", {
      totalAmount,
      customerEmail,
      customerName,
      shopName,
      shopLocation,
      shopId,
      selectedShowtimes,
      showtimeServices // Check if this exists
    });
  }, [totalAmount, customerEmail, customerName, shopName, shopPhone, shopLocation, shopId, selectedShowtimes, showtimeServices]);

  const confirmBooking = async () => {
    try {
      Swal.fire({
        title: 'Confirming Booking...',
        text: 'Please wait while we book your appointment',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Validate that we have the required data
      if (!shopId) {
        throw new Error('Shop ID is missing. Please go back and select a salon again.');
      }

      if (!selectedShowtimes || selectedShowtimes.length === 0) {
        throw new Error('No time slots selected. Please go back and select a time slot.');
      }

      // Validate that showtimeServices exists
      if (!showtimeServices || Object.keys(showtimeServices).length === 0) {
        throw new Error('Service information is missing. Please go back and select services.');
      }

      const bookingData = {
        customerEmail: customerEmail || user?.email,
        customerName: customerName || user?.name,
        customerPhone: user?.phone || '',
        userId: user?.userId || user?._id,
        shopDetails: {
          shopName,
          shopPhone,
          location: shopLocation,
          shopId: shopId
        },
        selectedTimeSlots: selectedShowtimes,
        totalAmount,
        showtimeServices: showtimeServices // THIS WAS MISSING
      };

      console.log('Final booking data being sent:', bookingData);

      // Use the new direct booking endpoint
      const response = await api.post('/pay/book-direct', bookingData);

      Swal.close();

      if (response.data.success) {
        Swal.fire({
          title: "Booking Confirmed!",
          text: response.data.message,
          icon: "success",
          confirmButtonText: "View My Bookings"
        }).then(() => {
          navigate('/customerDashboard');
        });
      }
    } catch (error) {
      Swal.close();
      console.error("Booking failed:", error);
      Swal.fire({
        title: "Booking Failed",
        text: error.response?.data?.error || error.message || "Failed to book appointment. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Booking</h2>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Customer Details</h3>
                <p><strong>Name:</strong> {customerName}</p>
                <p><strong>Email:</strong> {customerEmail}</p>
                <p><strong>Phone:</strong> {user?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Salon Details</h3>
                <p><strong>Salon name:</strong> {shopName}</p>
                <p><strong>Location:</strong> {shopLocation}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-600">Selected Time Slots</h3>
              {selectedShowtimes?.map((slot, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                  <p><strong>Date:</strong> {formatDate(slot.showtimeDate)}</p>
                  <p><strong>Time:</strong> {formatTimeAMPM(slot.showtimeDate)}</p>
                  {showtimeServices[slot.showtimeId] && (
                    <p><strong>Service:</strong> {showtimeServices[slot.showtimeId].service} - ₹{showtimeServices[slot.showtimeId].price}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xl font-bold text-gray-800">Total Amount: ₹{totalAmount}</h3>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={confirmBooking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



// import React from "react";
// import { useEffect } from "react";
// import { useLogin } from '../components/LoginContext'
// import { useNavigate } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";
// import { useLocation } from 'react-router-dom';

// export const Payment = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const { 
//   selectedShowtimes,
//   totalAmount,
//   customerEmail = '',
//   customerName = '',
//   shopName = '',
//   location: shopLocation = '',
//   shopId = ''
// } = location.state || {};

// useEffect(() => {
//   console.log("Booking Details from location.state:", {
//     totalAmount,
//     customerEmail,
//     customerName,
//     shopName,
//     shopLocation,
//     shopId, // Added shopId to debug
//     selectedShowtimes
//   });
// }, [totalAmount, customerEmail, customerName, shopName, shopLocation, shopId, selectedShowtimes]);

// const confirmBooking = async () => {
//   try {
//     Swal.fire({
//       title: 'Confirming Booking...',
//       text: 'Please wait while we book your appointment',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       }
//     });

//     // Validate that we have the required data
//     if (!shopId) {
//       throw new Error('Shop ID is missing. Please go back and select a salon again.');
//     }

//     if (!selectedShowtimes || selectedShowtimes.length === 0) {
//       throw new Error('No time slots selected. Please go back and select a time slot.');
//     }

//     const bookingData = {
//       customerEmail: customerEmail || user?.email,
//       customerName: customerName || user?.name,
//       customerPhone: user?.phone || '',
//       userId: user?.userId || user?._id,
//       shopDetails: {
//         shopName,
//         location: shopLocation,
//         shopId: shopId // This was the main issue - make sure it's not empty
//       },
//       selectedTimeSlots: selectedShowtimes,
//       totalAmount
//     };

//     console.log('Final booking data being sent:', bookingData);

//     // Use the new direct booking endpoint
//     const response = await api.post('/pay/book-direct', bookingData);

//     Swal.close();

//     if (response.data.success) {
//       Swal.fire({
//         title: "Booking Confirmed!",
//         text: response.data.message,
//         icon: "success",
//         confirmButtonText: "View My Bookings"
//       }).then(() => {
//         navigate('/customerDashboard'); // Redirect to bookings page
//       });
//     }
//   } catch (error) {
//     Swal.close();
//     console.error("Booking failed:", error);
//     Swal.fire({
//       title: "Booking Failed",
//       text: error.response?.data?.error || error.message || "Failed to book appointment. Please try again.",
//       icon: "error",
//       confirmButtonText: "Try Again"
//     });
//   }
// };

//   return (
//     <section className="section-booking py-10 bg-gray-50 min-h-screen">
//       <div className="container mx-auto max-w-2xl p-8 bg-white shadow-lg rounded-lg">
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Confirm Your Booking</h1>
//           <p className="text-green-600 font-semibold">No payment required - Book instantly!</p>
//         </div>

//         {/* Booking Summary Card */}
//         <div className="bg-blue-50 p-6 rounded-lg mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>

//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Customer:</span>
//               <span className="font-medium">{customerName}</span>
//             </div>

//             <div className="flex justify-between">
//               <span className="text-gray-600">Email:</span>
//               <span className="font-medium">{customerEmail}</span>
//             </div>

//             <div className="flex justify-between">
//               <span className="text-gray-600">Shop:</span>
//               <span className="font-medium">{shopName}</span>
//             </div>

//             <div className="flex justify-between">
//               <span className="text-gray-600">Location:</span>
//               <span className="font-medium">{shopLocation}</span>
//             </div>

//             <div className="flex justify-between">
//               <span className="text-gray-600">Total Amount:</span>
//               <span className="font-semibold text-green-600">₹{totalAmount}</span>
//             </div>
//           </div>
//         </div>

//         {/* Selected Time Slots */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Time Slots:</h3>
//           <div className="space-y-2">
//             {selectedShowtimes && selectedShowtimes.length > 0 ? (
//               selectedShowtimes.map((slot, index) => (
//                 <div key={slot.showtimeId || index} className="bg-gray-100 p-3 rounded">
//                   <div className="flex justify-between items-center">
//                     <span className="font-medium">
//                       {new Date(slot.showtimeDate).toLocaleDateString('en-IN', {
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </span>
//                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
//                       {new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         hour12: true
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-red-500">No time slots selected</p>
//             )}
//           </div>
//         </div>

//         {/* Terms and Conditions */}
//         <div className="bg-yellow-50 p-4 rounded-lg mb-6">
//           <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
//           <ul className="text-sm text-yellow-700 space-y-1">
//             <li>• Please arrive 10 minutes before your appointment time</li>
//             <li>• Cancellations should be made at least 2 hours in advance</li>
//             <li>• Payment of ₹{totalAmount} to be made at the salon</li>
//             <li>• Bring your booking confirmation (will be sent via email)</li>
//           </ul>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3">
//           <button
//             className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md"
//             onClick={confirmBooking}
//           >
//             Confirm Booking
//           </button>

//           <button
//             className="w-full py-3 px-6 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all"
//             onClick={() => navigate(-1)} // Go back to previous page
//           >
//             ← Go Back
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };



// with both pay now and pay later options
// import React from "react";
// import { useEffect, useState } from "react";
// import { useLogin } from '../components/LoginContext'
// import { useNavigate } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";
// import { useLocation } from 'react-router-dom';

// export const Payment = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const { selectedShowtimes,
//     totalAmount,
//     customerEmail = '',
//     customerName = '',
//     shopName = '',
//     location: shopLocation = '',
//     shopId = '' // Add shopId if available
//   } = location.state || {};

//   const [isPayingNow, setIsPayingNow] = useState(true); // Toggle between pay now/later

//   useEffect(() => {
//     console.log("Total Amount Passed: ", totalAmount);
//     console.log("Customer Email: ", customerEmail);
//     console.log("Customer Name: ", customerName);
//     console.log("Shop Name: ", shopName);
//     console.log("Location: ", shopLocation);
//     console.log("Selected Time Slots: ", selectedShowtimes);
//   }, [totalAmount, customerEmail, customerName, shopName, shopLocation, selectedShowtimes]);

//   // Function to book appointment without payment
//   const bookWithoutPayment = async () => {
//     try {
//       Swal.fire({
//         title: 'Booking Appointment...',
//         text: 'Please wait while we confirm your booking',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       const bookingData = {
//         customerEmail,
//         customerName,
//         customerPhone: user.phone || '',
//         shopDetails: {
//           shopName,
//           location: shopLocation,
//           shopId
//         },
//         selectedTimeSlots: selectedShowtimes,
//         totalAmount,
//         paymentStatus: 'pending', // Mark as pending payment
//         bookingStatus: 'confirmed', // Or 'pending' based on your business logic
//         paymentMethod: 'pay_later'
//       };

//       const response = await api.post('/bookings/create', bookingData);

//       Swal.close();

//       if (response.data.success) {
//         Swal.fire({
//           title: "Booking Confirmed!",
//           text: "Your appointment has been booked successfully. You can pay at the salon.",
//           icon: "success",
//           confirmButtonText: "OK"
//         }).then(() => {
//           navigate('/my-bookings'); // Redirect to bookings page
//         });
//       }
//     } catch (error) {
//       Swal.close();
//       console.error("Booking failed:", error);
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to book appointment. Please try again.",
//         icon: "error",
//       });
//     }
//   };

//   const currency = "INR";
//   const receiptId = "qwsaq1";
//   var order;
//   // Existing payment handler (slightly modified)
//   const paymentHandler = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('/pay/order', {
//         amount: totalAmount * 100,
//         currency,
//         receipt: receiptId,
//       }, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       order = response.data;
//       console.log("Order created:", order);
//     } catch (error) {
//       console.error("Order creation failed:", error);
//       Swal.fire({
//         title: "Error",
//         text: "Payment order could not be created. Please try again.",
//         icon: "error",
//       });
//       return;
//     }


//     var options = {
//       // key: "rzp_test_34xCQafgf3IMYu", // Enter the Key ID generated from the Dashboard
//       // key: "rzp_live_ZfoO4ejkBHIuwM", // Enter the Key ID generated from the Dashboard
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
//       amount: totalAmount * 100, // Amount in paise (hence multiplied by 100)
//       currency: "INR",
//       name: "Salon Booking Time", // Your business name
//       description: "Payment Transaction",
//       // image: "/sbt logo.svg",
//       image: `${window.location.origin}/sbt%20logo.svg`,
//       order_id: order.id, // Order ID obtained in the response of Step 1
//       handler: async function (response) {
//         console.log("Razorpay Response: ", response);
//         const body = {
//           payment_id: response.razorpay_payment_id,
//           order_id: response.razorpay_order_id,
//           signature: response.razorpay_signature,
//           customerEmail,
//           customerName,
//           shopDetails: { shopName, location: shopLocation },
//           selectedTimeSlot: selectedShowtimes
//         };

//         const validateRes = await api.post('/pay/order/validate', body, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         const jsonRes = await validateRes.data;
//         console.log(jsonRes);
//         if (jsonRes.message === "Payment successful and email sent!") {
//           // alert('Payment completed and email sent to customer!');
//           Swal.fire({ title: "Success", text: "Email sent to you", icon: "success" })
//           navigate('/');
//         }
//       },
//       prefill: {
//         name: customerName, // Customer's name
//         email: customerEmail,
//         contact: user.phone, // Customer's phone number for better conversion rates
//       },
//       notes: {
//         address: "Razorpay Corporate Office",
//       },
//       theme: {
//         color: "#3399cc",
//       },
//     };

//     var rzp1 = new window.Razorpay(options);
//     rzp1.on("payment.failed", function (response) {
//       alert(response.error.code, response.error.description, response.error.source, response.error.step, response.error.reason, response.error.metadata.order_id, response.error.metadata.payment_id);
//     });
//     rzp1.open();
//   };

//   return (
//     <section className="section-payment py-10 bg-gray-50">
//       <div className="container mx-auto max-w-2xl p-8 bg-white shadow-lg rounded-lg">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Booking Summary</h1>

//         {/* Payment Method Selection */}
//         <div className="mb-6 p-4 bg-gray-100 rounded-lg">
//           <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Method</h3>
//           <div className="flex space-x-4">
//             <button
//               className={`flex-1 py-2 px-4 rounded-md transition-all ${isPayingNow
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               onClick={() => setIsPayingNow(true)}
//             >
//               Pay Now
//             </button>
//             <button
//               className={`flex-1 py-2 px-4 rounded-md transition-all ${!isPayingNow
//                 ? 'bg-green-600 text-white shadow-md'
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               onClick={() => setIsPayingNow(false)}
//             >
//               Pay at Salon
//             </button>
//           </div>
//         </div>

//         {/* Booking Details */}
//         <div className="space-y-4 mb-6">
//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Dear: </span>
//             <span className="text-gray-900">{customerName}</span>
//           </h3>

//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Total Amount: </span>
//             <span className="text-green-600">₹{totalAmount}</span>
//           </h3>

//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Selected Time Slot: </span>
//             <span className="text-gray-900">
//               {selectedShowtimes && selectedShowtimes.length > 0 ? selectedShowtimes.map(slot => (
//                 <div key={slot.showtimeId} className="mb-1">
//                   Date: {new Date(slot.showtimeDate).toLocaleDateString()},
//                   <br />
//                   Time: {new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </div>
//               )) : "No time slot selected"}
//             </span>
//           </h3>

//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Customer Email: </span>
//             <span className="text-gray-900">{customerEmail}</span>
//           </h3>

//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Shop Name: </span>
//             <span className="text-gray-900">{shopName}</span>
//           </h3>

//           <h3 className="text-lg font-semibold text-gray-700">
//             <span className="font-medium">Location: </span>
//             <span className="text-gray-900">{shopLocation}</span>
//           </h3>
//         </div>

//         {/* Action Buttons */}
//         {isPayingNow ? (
//           <button
//             className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-all mb-3"
//             onClick={paymentHandler}
//           >
//             Pay Now - ₹{totalAmount}
//           </button>
//         ) : (
//           <button
//             className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-all mb-3"
//             onClick={bookWithoutPayment}
//           >
//             Confirm Booking (Pay at Salon)
//           </button>
//         )}

//         {/* Terms and Conditions */}
//         <div className="text-xs text-gray-500 text-center">
//           {!isPayingNow && (
//             <p>By confirming, you agree to pay ₹{totalAmount} at the salon at the time of service.</p>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };


// only pay now option
// import React from "react";
// import { useEffect } from "react";
// import { useLogin } from '../components/LoginContext'
// import { useNavigate } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";
// import { useLocation } from 'react-router-dom'; // To access the passed state

// export const Payment = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useLogin();
//   const { selectedShowtimes,
//     totalAmount,
//     customerEmail = '', // Default empty string if not passed
//     customerName = '', // Default empty string if not passed
//     shopName = '', // Default empty string if not passed
//     location: shopLocation = '' } = location.state || {};  // Fallback to 500 if no totalAmount is passed
//   useEffect(() => {
//     console.log("Total Amount Passed: ", totalAmount);
//     console.log("Customer Email: ", customerEmail);
//     console.log("Customer Name: ", customerName);
//     console.log("Shop Name: ", shopName);
//     console.log("Location: ", shopLocation);
//     console.log("Selected Time Slots: ", selectedShowtimes);
//   }, [totalAmount, customerEmail, customerName, shopName, shopLocation, selectedShowtimes]);

//   const currency = "INR";
//   const receiptId = "qwsaq1";
//   var order;
//   const paymentHandler = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await api.post('/pay/order', {
//         amount: totalAmount * 100,
//         currency,
//         receipt: receiptId,
//       }, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       order = response.data;
//       console.log("Order created:", order);
//     } catch (error) {
//       console.error("Order creation failed:", error);
//       Swal.fire({
//         title: "Error",
//         text: "Payment order could not be created. Please try again.",
//         icon: "error",
//       });
//       return;
//     }

//     var options = {
//       // key: "rzp_test_34xCQafgf3IMYu", // Enter the Key ID generated from the Dashboard
//       // key: "rzp_live_ZfoO4ejkBHIuwM", // Enter the Key ID generated from the Dashboard
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
//       amount: totalAmount * 100, // Amount in paise (hence multiplied by 100)
//       currency: "INR",
//       name: "Salon Booking Time", // Your business name
//       description: "Payment Transaction",
//       // image: "/sbt logo.svg",
//       image: `${window.location.origin}/sbt%20logo.svg`,
//       order_id: order.id, // Order ID obtained in the response of Step 1
//       handler: async function (response) {
//         console.log("Razorpay Response: ", response);
//         const body = {
//           payment_id: response.razorpay_payment_id,
//           order_id: response.razorpay_order_id,
//           signature: response.razorpay_signature,
//           customerEmail,
//           customerName,
//           shopDetails: { shopName, location: shopLocation },
//           selectedTimeSlot: selectedShowtimes
//         };

//         const validateRes = await api.post('/pay/order/validate', body, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         const jsonRes = await validateRes.data;
//         console.log(jsonRes);
//         if (jsonRes.message === "Payment successful and email sent!") {
//           // alert('Payment completed and email sent to customer!');
//           Swal.fire({ title: "Success", text: "Email sent to you", icon: "success" })
//           navigate('/');
//         }
//       },
//       prefill: {
//         name: customerName, // Customer's name
//         email: customerEmail,
//         contact: user.phone, // Customer's phone number for better conversion rates
//       },
//       notes: {
//         address: "Razorpay Corporate Office",
//       },
//       theme: {
//         color: "#3399cc",
//       },
//     };

//     var rzp1 = new window.Razorpay(options);
//     rzp1.on("payment.failed", function (response) {
//       alert(response.error.code,response.error.description,response.error.source,response.error.step,response.error.reason,response.error.metadata.order_id,response.error.metadata.payment_id);
//     });
//     rzp1.open();
//   };

//   return (
//     <section className="section-payment py-10 bg-gray-50">
//       <div className="container mx-auto max-w-2xl p-8 bg-white shadow-lg rounded-lg">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment</h1>

//         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//           <span className="static-content font-medium">Dear: </span>
//           <span className="dynamic-content text-gray-900">{customerName}</span>
//         </h3>

//         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//           <span className="static-content font-medium">Total Amount: </span>
//           <span className="dynamic-content text-green-600">₹{totalAmount}</span>
//         </h3>

//         <h3 className="text-lg font-semibold text-gray-700 mb-4">
//           <span className="static-content font-medium">Selected Time Slot: </span>
//           <span className="dynamic-content text-gray-900">
//             {selectedShowtimes && selectedShowtimes.length > 0 ? selectedShowtimes.map(slot => (
//               <div key={slot.showtimeId} className="mb-1">
//                 Date: {new Date(slot.showtimeDate).toLocaleDateString()},
//                 <br />
//                 Time: {new Date(slot.showtimeDate).toLocaleTimeString('en-US', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })}
//               </div>
//             )) : "No time slot selected"}
//           </span>
//         </h3>

//         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//           <span className="static-content font-medium">Customer Email: </span>
//           <span className="dynamic-content text-gray-900">{customerEmail}</span>
//         </h3>

//         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//           <span className="static-content font-medium">Shop Name: </span>
//           <span className="dynamic-content text-gray-900">{shopName}</span>
//         </h3>

//         <h3 className="text-lg font-semibold text-gray-700 mb-6">
//           <span className="static-content font-medium">Location: </span>
//           <span className="dynamic-content text-gray-900">{shopLocation}</span>
//         </h3>

//         <button
//           className="book-appointment-button w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-all"
//           onClick={paymentHandler}
//         >
//           Pay
//         </button>
//       </div>
//     </section>


//   );
// };
