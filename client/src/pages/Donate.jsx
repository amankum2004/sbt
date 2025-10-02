import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useLogin } from '../components/LoginContext';
import Swal from 'sweetalert2';

const Donate = () => {
  const navigate = useNavigate();
  const { user } = useLogin();
  const [form, setForm] = useState({
    name: '',
    email: '',
    amount: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      const response = await api.post('/pay/order', {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `donation_${Date.now()}`,
      });
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  };

  const validatePayment = async (paymentData) => {
    try {
      const response = await api.post('/pay/donation/validate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment validation failed:', error);
      throw new Error('Payment validation failed');
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    
    if (!form.amount || form.amount <= 0) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid donation amount",
        icon: "warning"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order
      const order = await createRazorpayOrder(form.amount);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: form.amount * 100,
        currency: "INR",
        name: "Environmental Donation",
        description: "Donation for environmental initiatives",
        image: `${window.location.origin}/sbt%20logo.svg`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Razorpay Response: ", response);
            
            const paymentData = {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              donationDetails: {
                name: form.name,
                email: form.email,
                amount: form.amount,
                message: form.message
              }
            };

            // Validate payment
            const validationResult = await validatePayment(paymentData);
            
            if (validationResult.message === 'Payment successful and email sent!') {
              // Save donation to database
              await api.post("/donation/donate", {
                name: form.name,
                email: form.email,
                amount: form.amount,
                message: form.message,
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id
              });

              Swal.fire({
                title: "Thank You! 🌱",
                text: "Your donation has been received successfully!",
                icon: "success",
                confirmButtonText: "Continue"
              }).then(() => {
                setForm({ name: '', email: '', amount: '', message: '' });
                navigate('/');
              });
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            Swal.fire({
              title: "Payment Error",
              text: "There was an issue processing your payment. Please try again.",
              icon: "error"
            });
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: user?.phone || ''
        },
        notes: {
          purpose: "Environmental Donation"
        },
        theme: {
          color: "#10B981" // Green theme for environment
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response) {
        console.error('Payment failed:', response.error);
        Swal.fire({
          title: "Payment Failed",
          text: response.error.description || "Payment could not be completed",
          icon: "error"
        });
      });
      
      rzp1.open();

    } catch (error) {
      console.error('Donation error:', error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to process donation",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-10 border border-green-200">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-green-700">Donate for the Environment 🌱</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Help us plant trees, reduce pollution, and build a sustainable future.
          </p>
          {/* {user && (
            <p className="mt-2 text-sm text-green-600">
              Welcome back, {user.name}! Your details have been auto-filled.
            </p>
          )} */}
        </div>

        <form onSubmit={handleDonation} className="space-y-6">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="relative">
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              min="1"
              placeholder="Amount (₹)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="absolute right-3 top-3 text-gray-500">₹</div>
          </div>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Your Message (Optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '🌍 Donate Now'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">Where your donation goes:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 🌳 Tree plantation drives</li>
            <li>• ♻️ Waste management initiatives</li>
            <li>• 💧 Clean water projects</li>
            <li>• 🌱 Sustainable farming support</li>
            <li>• 📚 Environmental education programs</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-center text-gray-400">
          100% of your donation will go towards environmental initiatives. All transactions are secure.
        </p>
      </div>
    </div>
  );
};

export default Donate;












// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../utils/api';

// const Donate = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     amount: '',
//     message: ''
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post("/donation/donate", form);
//       alert("Thank you for your donation!");
//       setForm({ name: '', email: '', amount: '', message: '' });
//       navigate('/');
//     } catch (error) {
//       console.error(error);
//       alert("Failed to submit donation.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center px-4 py-16">
//       <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-10 border border-green-200">
//         <div className="text-center mb-8">
//           <h2 className="text-4xl font-extrabold text-green-700">Donate for the Environment 🌱</h2>
//           <p className="mt-4 text-gray-600 text-lg">
//             Help us plant trees, reduce pollution, and build a sustainable future.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             required
//             placeholder="Your Name"
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             placeholder="Your Email"
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             type="number"
//             name="amount"
//             value={form.amount}
//             onChange={handleChange}
//             required
//             placeholder="Amount (₹)"
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <textarea
//             name="message"
//             value={form.message}
//             onChange={handleChange}
//             rows="4"
//             placeholder="Your Message (Optional)"
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
//           />

//           <button
//             type="submit"
//             className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
//           >
//             🌍 Donate Now
//           </button>
//         </form>

//         <p className="mt-6 text-sm text-center text-gray-400">
//           100% of your donation will go towards environmental initiatives.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Donate;
