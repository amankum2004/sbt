import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { FaMapMarkerAlt, FaEnvelope, FaPaperPlane, FaPhone, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

const defaultContactFormData = {
  name: "",
  email: "",
  message: "",
};

export const Contact = () => {
  const [contact, setContact] = useState(defaultContactFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useLogin();
  const navigate = useNavigate();

  // Structured data for Contact page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact SalonHub - Beauty Salon Booking Platform",
    "description": "Contact SalonHub for salon booking inquiries, customer support, and beauty service questions. Get in touch with India's leading online salon booking platform.",
    "url": "https://salonhub.co.in/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "SalonHub",
      "email": "sbthelp123@gmail.com",
      "telephone": "+91-8810269376",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Indian Institute of Technology Mandi",
        "addressLocality": "Kamand",
        "addressRegion": "Himachal Pradesh",
        "postalCode": "175005",
        "addressCountry": "IN"
      },
      "areaServed": "India",
      "serviceType": "Online Salon Booking Platform"
    }
  };

  useEffect(() => {
    if (user) {
      setContact({
        name: user.name || "",
        email: user.email || "",
        message: "",
      });
    }
  }, [user]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.post("/form/contact", contact);
      if (response) {
        setContact(defaultContactFormData);
        Swal.fire({
          title: "Success!",
          text: "Your message has been sent successfully",
          icon: "success",
          confirmButtonColor: "#7e22ce",
        });
        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to send message",
        icon: "error",
        confirmButtonColor: "#7e22ce",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section with SEO-rich content */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-800 mt-8 mb-4">
              Contact SalonHub - Customer Support & Salon Booking Help
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              <strong>SalonHub</strong> - India's leading online salon booking platform. 
              Whether you need help with <strong>salon bookings</strong>, have questions about 
              <strong> beauty services</strong>, or want to provide feedback, we're here to help you 
              <strong> 24/7</strong>.
            </p>
            <div className="bg-white rounded-lg p-4 max-w-2xl mx-auto shadow-sm">
              <p className="text-gray-700">
                <strong>Quick Support:</strong> For urgent salon booking issues, email us directly at{" "}
                <a href="mailto:sbthelp123@gmail.com" className="text-purple-600 font-semibold">
                  sbthelp123@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row mb-12">
            {/* Contact Info Section - Enhanced for SEO */}
            <div className="w-full lg:w-2/5 bg-gradient-to-b from-purple-700 to-pink-600 p-8 text-white">
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Get in Touch with SalonHub</h2>
                <p className="text-purple-100 text-lg">
                  We're here to help with all your <strong>salon booking needs</strong> and 
                  <strong> beauty service inquiries</strong> across India.
                </p>
              </div>

              <div className="space-y-8">
                {/* <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Our Office Address</h3>
                    <p className="text-purple-100">
                      Indian Institute of Technology Mandi<br />
                      Kamand, Himachal Pradesh<br />
                      India - 175005
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email Support</h3>
                    <a 
                      href="mailto:sbthelp123@gmail.com" 
                      className="text-purple-100 hover:text-white transition-colors text-lg font-medium"
                    >
                      sbthelp123@gmail.com
                    </a>
                    <p className="text-purple-100 text-sm mt-1">
                      For salon bookings, customer support, and general inquiries
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone Support</h3>
                    <p className="text-purple-100 text-lg font-medium">
                      +91-8810269376
                    </p>
                    <p className="text-purple-100 text-sm mt-1">
                      Available for urgent salon booking assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Support Hours</h3>
                    <p className="text-purple-100">
                      Monday - Sunday: 24/7 Online Support<br />
                      Email Response: Within 2-4 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              {/* <div className="mt-12">
                <h3 className="font-semibold mb-4 text-lg">Service Areas Across India</h3>
                <div className="flex flex-wrap gap-2">
                  {["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune"].map((city) => (
                    <span key={city} className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {city}
                    </span>
                  ))}
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    +50 more cities
                  </span>
                </div>
              </div> */}
            </div>

            {/* Contact Form Section */}
            <div className="w-full lg:w-3/5 p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Send us a Message - We're Here to Help
              </h2>
              <p className="text-gray-600 mb-6">
                Have questions about <strong>salon bookings</strong>, <strong>beauty services</strong>, 
                or need <strong>technical support</strong>? Fill out the form below and our team will 
                get back to you promptly.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={contact.name}
                      readOnly={!!user}
                      onChange={handleInput}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={contact.email}
                      readOnly={!!user}
                      onChange={handleInput}
                      required
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    How Can We Help You? *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    value={contact.message}
                    onChange={handleInput}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Please describe your inquiry about salon bookings, beauty services, technical issues, or partnership opportunities..."
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    Typical response time: 2-4 hours for salon booking inquiries
                  </p>
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    {isSubmitting ? (
                      'Sending Your Message...'
                    ) : (
                      <>
                        <FaPaperPlane className="mr-3" />
                        Send Message to SalonHub Support
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* FAQ Section for Common Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-center text-purple-800 mb-8">
              Frequently Asked Questions - SalonHub Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: "How do I book a salon appointment through SalonHub?",
                  answer: "Simply visit our website, search for salons near you, select your preferred services and time slot, and confirm your booking. It's quick and easy!"
                },
                {
                  question: "What should I do if I need to cancel my salon booking?",
                  answer: "You can cancel your booking through your account dashboard or contact our support team for immediate assistance with cancellations."
                },
                {
                  question: "Do you offer salon services across all Indian cities?",
                  answer: "Yes! SalonHub services are available in major cities including Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, and many more across India."
                },
                {
                  question: "How can salon owners partner with SalonHub?",
                  answer: "Salon owners can email us at sbthelp123@gmail.com with their salon details to start the partnership process and reach more customers."
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-purple-700 mb-3 text-lg">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Contact Methods */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-10 text-white">
            <h2 className="text-2xl font-bold mb-4">Prefer Other Contact Methods?</h2>
            <p className="text-lg mb-6 opacity-90">
              We're available through multiple channels to assist with your salon booking needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <FaEnvelope className="text-2xl mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm opacity-90">sbthelp123@gmail.com</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <FaPhone className="text-2xl mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm opacity-90">+91-8810269376</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <FaClock className="text-2xl mx-auto mb-2" />
                <h3 className="font-semibold mb-1">24/7 Online</h3>
                <p className="text-sm opacity-90">Contact Form</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};







// import React, { useState, useEffect } from "react";
// import { useLogin } from "../components/LoginContext";
// import { useNavigate } from "react-router-dom";
// import { api } from "../utils/api";
// import Swal from "sweetalert2";
// import { FaMapMarkerAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";
// import { motion } from "framer-motion";

// const defaultContactFormData = {
//   name: "",
//   email: "",
//   message: "",
// };

// export const Contact = () => {
//   const [contact, setContact] = useState(defaultContactFormData);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { user } = useLogin();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) {
//       setContact({
//         name: user.name || "",
//         email: user.email || "",
//         message: "",
//       });
//     }
//   }, [user]);

//   const handleInput = (e) => {
//     const { name, value } = e.target;
//     setContact(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       const response = await api.post("/form/contact", contact);
//       if (response) {
//         setContact(defaultContactFormData);
//         Swal.fire({
//           title: "Success!",
//           text: "Your message has been sent successfully",
//           icon: "success",
//           confirmButtonColor: "#7e22ce",
//         });
//         navigate("/");
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Failed to send message",
//         icon: "error",
//         confirmButtonColor: "#7e22ce",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-6xl mx-auto"
//       >
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-purple-800 mt-8 mb-4">Contact Us</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             We'd love to hear from you! Whether you have questions, feedback, or need support, 
//             our team is ready to help.
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
//           {/* Contact Info Section */}
//           <div className="w-full lg:w-1/3 bg-gradient-to-b from-purple-700 to-pink-600 p-8 text-white">
//             <div className="mb-10">
//               <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
//               <p className="text-purple-100">
//                 Fill out the form or use the contact details below to reach us.
//               </p>
//             </div>

//             <div className="space-y-8">
//               <div className="flex items-start">
//                 <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
//                   <FaMapMarkerAlt className="text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1">Address</h3>
//                   <p className="text-purple-100">
//                     Indian Institute of Technology Mandi<br />
//                     Kamand, Himachal Pradesh<br />
//                     175005
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start">
//                 <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
//                   <FaEnvelope className="text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1">Email</h3>
//                   <a 
//                     href="mailto:sbthelp123@gmail.com" 
//                     className="text-purple-100 hover:text-white transition-colors"
//                   >
//                     sbthelp123@gmail.com
//                   </a>
//                 </div>
//               </div>
//             </div>

//             {/* <div className="mt-12">
//               <h3 className="font-semibold mb-4">Follow Us</h3>
//               <div className="flex space-x-4">
//                 {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
//                   <div 
//                     key={social}
//                     className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
//                   >
//                     <span className="sr-only">{social}</span>
//                   </div>
//                 ))}
//               </div>
//             </div> */}
//           </div>

//           {/* Contact Form Section */}
//           <div className="w-full lg:w-2/3 p-8 sm:p-10">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
            
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                     Your Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     id="name"
//                     value={contact.name}
//                     readOnly={!!user}
//                     onChange={handleInput}
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     id="email"
//                     value={contact.email}
//                     readOnly={!!user}
//                     onChange={handleInput}
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
//                   Your Message
//                 </label>
//                 <textarea
//                   name="message"
//                   id="message"
//                   rows={5}
//                   value={contact.message}
//                   onChange={handleInput}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
//                   placeholder="Tell us how we can help..."
//                 ></textarea>
//               </div>

//               <div className="pt-2">
//                 <motion.button
//                   type="submit"
//                   disabled={isSubmitting}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
//                 >
//                   {isSubmitting ? (
//                     'Sending...'
//                   ) : (
//                     <>
//                       <FaPaperPlane className="mr-2" />
//                       Send Message
//                     </>
//                   )}
//                 </motion.button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };