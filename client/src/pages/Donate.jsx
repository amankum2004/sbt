import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useLogin } from '../components/LoginContext';
import Swal from 'sweetalert2';
import { LoadingSpinner } from "../components/Loading";

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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay script'));
        };
        document.head.appendChild(script);
      });
    };

    loadRazorpayScript().catch((error) => {
      console.error('Failed to load Razorpay:', error);
      Swal.fire({
        title: "Payment Error",
        text: "Payment gateway failed to load. Please refresh the page.",
        icon: "error"
      });
    });
  }, []);

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
    
    // Check if Razorpay is loaded
    if (!razorpayLoaded) {
      Swal.fire({
        title: "Loading...",
        text: "Payment gateway is loading. Please wait a moment.",
        icon: "info"
      });
      return;
    }
    
    if (!form.amount || form.amount <= 0) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid donation amount (minimum ₹1)",
        icon: "warning"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order
      const order = await createRazorpayOrder(form.amount);
      
      // IMPORTANT: Get Razorpay key from environment
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured');
      }

      console.log('Using Razorpay Key:', razorpayKey.substring(0, 10) + '...');
      
      const options = {
        key: razorpayKey, // Make sure this is set
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Environmental Donation",
        description: "Donation for environmental initiatives",
        image: `${window.location.origin}/salonHub-logo.svg`,
        order_id: order.id,
        // In the handler function inside Razorpay options:
        handler: async function (response) {
            try {
                console.log("Razorpay Response: ", response);
                
                // ✅ FIX: Ensure all required fields exist
                if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
                    throw new Error('Incomplete payment response');
                }
                
                // ✅ FIX: Create donation details object with validation
                const donationDetails = {
                    name: form.name.trim(),
                    email: form.email.toLowerCase().trim(),
                    amount: parseFloat(form.amount),
                    message: form.message ? form.message.trim() : ''
                };

                console.log('Sending donation details:', donationDetails);

                const paymentData = {
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    donationDetails: donationDetails
                };

                // Validate payment with backend
                const validationResult = await validatePayment(paymentData);
                
                if (validationResult.success) {
                    // Optional: Save donation to your database via separate endpoint if needed
                    // try {
                    //     await api.post("/donation/donate", {
                    //         name: donationDetails.name,
                    //         email: donationDetails.email,
                    //         amount: donationDetails.amount,
                    //         message: donationDetails.message,
                    //         payment_id: response.razorpay_payment_id,
                    //         order_id: response.razorpay_order_id
                    //     });
                    //     console.log('Donation saved to database');
                    // } catch (dbError) {
                    //     console.warn('Database save failed:', dbError.message);
                    //     // Continue since payment was already validated and saved in the validate endpoint
                    // }

                    Swal.fire({
                        title: "Thank You! 🌱",
                        html: `
                            <div style="text-align: center;">
                                <p style="font-size: 18px; margin-bottom: 10px;">
                                    Your donation of <strong>₹${donationDetails.amount}</strong> has been received successfully!
                                </p>
                                <p style="color: #666; font-size: 14px;">
                                    A confirmation email has been sent to ${donationDetails.email}
                                </p>
                            </div>
                        `,
                        icon: "success",
                        confirmButtonText: "Continue",
                        confirmButtonColor: "#10B981"
                    }).then(() => {
                        setForm({ name: '', email: '', amount: '', message: '' });
                        navigate('/');
                    });
                } else {
                    throw new Error(validationResult.error || 'Payment validation failed');
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                Swal.fire({
                    title: "Payment Error",
                    text: error.message || "There was an issue processing your payment. Please try again.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
            }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: user?.phone || ''
        },
        notes: {
          purpose: "Environmental Donation",
          donation_for: "Tree Plantation"
        },
        theme: {
          color: "#10B981" // Green theme for environment
        },
        modal: {
          ondismiss: function() {
            Swal.fire({
              title: "Payment Cancelled",
              text: "Donation was not completed.",
              icon: "info"
            });
            setIsLoading(false);
          }
        }
      };

      // Verify Razorpay object exists
      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded. Please refresh the page.');
      }

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response) {
        console.error('Payment failed:', response.error);
        Swal.fire({
          title: "Payment Failed",
          text: response.error.description || "Payment could not be completed",
          icon: "error",
          confirmButtonText: "Try Again"
        });
        setIsLoading(false);
      });
      
      rzp1.open();
      setIsLoading(false); // Reset loading state after opening modal

    } catch (error) {
      console.error('Donation error:', error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to process donation",
        icon: "error",
        confirmButtonText: "OK"
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-3 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />

      <div className="relative mx-auto mt-1 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="mb-3 text-center">
          <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Green Mission
          </p>
          <h1 className="mt-3 text-4xl font-black text-green-600">Donate For The Environment</h1>
          <p className="mt-4 text-base text-slate-600">
            Help us plant trees, reduce pollution, and build a sustainable future.
          </p>
          {!razorpayLoaded && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-700">
                Loading payment gateway...
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleDonation} className="space-y-6">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
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
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
            />
            <div className="absolute right-3 top-3 text-slate-500">₹</div>
          </div>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Your Message (Optional)"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
          />

          <button
            type="submit"
            disabled={isLoading || !razorpayLoaded}
            className={`w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 ${
              isLoading || !razorpayLoaded ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="-ml-1 mr-3" />
                Processing...
              </span>
            ) : (
              '🌍 Donate Now'
            )}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-2 font-bold text-emerald-800">Where your donation goes:</h3>
          <ul className="space-y-1 text-sm text-emerald-700">
            <li>• 🌳 Tree plantation drives</li>
            <li>• ♻️ Waste management initiatives</li>
            <li>• 💧 Clean water projects</li>
            <li>• 🌱 Sustainable farming support</li>
            <li>• 📚 Environmental education programs</li>
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 sm:text-sm">
          100% of your donation will go towards environmental initiatives. All transactions are secure.
        </p>
      </div>
    </main>
  );
};

export default Donate;


