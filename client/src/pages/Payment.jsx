import {useEffect} from "react";
import {useLogin} from '../components/LoginContext'
import { useLocation } from 'react-router-dom'; // To access the passed state
// import '../CSS/Payment.css'
import React from "react"; 

export const Payment = () => {
  const location = useLocation();
  const {user} = useLogin();
  const { selectedShowtimes, 
          totalAmount,
          customerEmail = '', // Default empty string if not passed
          customerName = '', // Default empty string if not passed
          shopName = '', // Default empty string if not passed
          location: shopLocation = ''} = location.state || {};  // Fallback to 500 if no totalAmount is passed
          useEffect(() => {
            console.log("Total Amount Passed: ", totalAmount);
            console.log("Customer Email: ", customerEmail);
            console.log("Customer Name: ", customerName);
            console.log("Shop Name: ", shopName);
            console.log("Location: ", shopLocation);
            console.log("Selected Time Slots: ", selectedShowtimes);
          }, [totalAmount, customerEmail,customerName, shopName, shopLocation, selectedShowtimes]);

  const currency = "INR";
  const receiptId = "qwsaq1";

  const paymentHandler = async (e) => {
    e.preventDefault(); // Prevent default behavior on button click

    const response = await fetch("http://localhost:8000/order", {
      method: "POST",
      body: JSON.stringify({
        amount: totalAmount * 100, 
        currency,
        receipt: receiptId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const order = await response.json();
    console.log(order);

    var options = {
      key: "rzp_test_34xCQafgf3IMYu", // Enter the Key ID generated from the Dashboard
      amount: totalAmount * 100, // Amount in paise (hence multiplied by 100)
      currency: "INR",
      name: "Salon Booking Time", // Your business name
      description: "Payment Transaction",
      // image: "https://example.com/your_logo",
      image: "/public/sbt logo.svg",
      order_id: order.id, // Order ID obtained in the response of Step 1
      handler: async function (response) {
        console.log("Razorpay Response: ", response);
        const body = {
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          signature: response.razorpay_signature,
          customerEmail, 
          customerName,
          shopDetails: {shopName,location:shopLocation},
          selectedTimeSlot: selectedShowtimes
        };

        const validateRes = await fetch("http://localhost:8000/order/validate", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const jsonRes = await validateRes.json();
        console.log(jsonRes);
        if (jsonRes.message === "Payment successful and email sent!") {
          alert('Payment completed and email sent to customer!');
        }
      },
      prefill: {
        name: customerName, // Customer's name
        email: customerEmail,
        contact: user.phone, // Customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });
    rzp1.open();
  };

  return (
//     <section className="section-payment">
//   <div className="container">
//     <h1 className="main-heading">Payment</h1>
    
//     <h3>
//       <span className="static-content">Dear: </span>
//       <span className="dynamic-content">{customerName}</span>
//     </h3>
    
//     <h3>
//       <span className="static-content">Total Amount: </span>
//       <span className="dynamic-content">₹{totalAmount}</span>
//     </h3>
    
//     <h3>
//       <span className="static-content">Selected Time Slot: </span>
//       <span className="dynamic-content">
//         {selectedShowtimes && selectedShowtimes.length > 0 ? selectedShowtimes.map(slot => (
//           <div key={slot.showtimeId}>
//             Date: {new Date(slot.showtimeDate).toLocaleDateString()},
//             <br></br> 
//             Time: {new Date(slot.showtimeDate).toLocaleTimeString()}
//           </div>
//         )) : "No time slot selected"}
//       </span>
//     </h3>
    
//     <h3>
//       <span className="static-content">Customer Email: </span>
//       <span className="dynamic-content">{customerEmail}</span>
//     </h3>
    
//     <h3>
//       <span className="static-content">Shop Name: </span>
//       <span className="dynamic-content">{shopName}</span>
//     </h3>
    
//     <h3>
//       <span className="static-content">Location: </span>
//       <span className="dynamic-content">{shopLocation}</span>
//     </h3>
    
//     <button className="book-appointment-button" onClick={paymentHandler}>
//       Pay
//     </button>
//   </div>
// </section>

<section className="section-payment py-10 bg-gray-50">
<div className="container mx-auto max-w-2xl p-8 bg-white shadow-lg rounded-lg">
  <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment</h1>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-2">
    <span className="static-content font-medium">Dear: </span>
    <span className="dynamic-content text-gray-900">{customerName}</span>
  </h3>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-2">
    <span className="static-content font-medium">Total Amount: </span>
    <span className="dynamic-content text-green-600">₹{totalAmount}</span>
  </h3>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-4">
    <span className="static-content font-medium">Selected Time Slot: </span>
    <span className="dynamic-content text-gray-900">
      {selectedShowtimes && selectedShowtimes.length > 0 ? selectedShowtimes.map(slot => (
        <div key={slot.showtimeId} className="mb-1">
          Date: {new Date(slot.showtimeDate).toLocaleDateString()},
          <br />
          Time: {new Date(slot.showtimeDate).toLocaleTimeString()}
        </div>
      )) : "No time slot selected"}
    </span>
  </h3>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-2">
    <span className="static-content font-medium">Customer Email: </span>
    <span className="dynamic-content text-gray-900">{customerEmail}</span>
  </h3>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-2">
    <span className="static-content font-medium">Shop Name: </span>
    <span className="dynamic-content text-gray-900">{shopName}</span>
  </h3>
  
  <h3 className="text-lg font-semibold text-gray-700 mb-6">
    <span className="static-content font-medium">Location: </span>
    <span className="dynamic-content text-gray-900">{shopLocation}</span>
  </h3>
  
  <button
    className="book-appointment-button w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-all"
    onClick={paymentHandler}
  >
    Pay
  </button>
</div>
</section>


  );
};
