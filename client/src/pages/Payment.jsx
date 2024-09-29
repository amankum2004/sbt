import {useEffect} from "react";
import {useLogin} from '../components/LoginContext'
import { useLocation } from 'react-router-dom'; // To access the passed state

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
    <section className="section-payment">
      <div className="container">
        <h1 className="main-heading">Payment</h1>
        <h3>Dear {customerName}</h3>
        <h3>Total Amount: ₹{totalAmount}</h3>
        <h3>Selected Time Slot: {selectedShowtimes && selectedShowtimes.length > 0 ? selectedShowtimes.map(slot => (
          <div key={slot.showtimeId}>
            Date: {new Date(slot.showtimeDate).toLocaleDateString()}, Time: {new Date(slot.showtimeDate).toLocaleTimeString()}
          </div>
        )) : "No time slot selected"}</h3>
        <h3>Customer Email: {customerEmail}</h3>
        <h3>Shop Name: {shopName}</h3>
        <h3>Location: {shopLocation}</h3>
        <button
          className="book-appointment-button"
          onClick={paymentHandler}
        >Pay
        </button>
      </div>
    </section>
  );
};
