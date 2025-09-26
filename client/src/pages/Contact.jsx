import React, { useState, useEffect } from "react";
import { useLogin } from "../components/LoginContext";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { FaMapMarkerAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mt-4 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or need support, 
            our team is ready to help.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
          {/* Contact Info Section */}
          <div className="w-full lg:w-1/3 bg-gradient-to-b from-purple-700 to-pink-600 p-8 text-white">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-purple-100">
                Fill out the form or use the contact details below to reach us.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Address</h3>
                  <p className="text-purple-100">
                    Indian Institute of Technology Mandi<br />
                    Kamand, Himachal Pradesh<br />
                    175005
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <FaEnvelope className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <a 
                    href="mailto:sbthelp123@gmail.com" 
                    className="text-purple-100 hover:text-white transition-colors"
                  >
                    sbthelp123@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* <div className="mt-12">
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <div 
                    key={social}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <span className="sr-only">{social}</span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Contact Form Section */}
          <div className="w-full lg:w-2/3 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={contact.name}
                    readOnly={!!user}
                    onChange={handleInput}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={contact.email}
                    readOnly={!!user}
                    onChange={handleInput}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={contact.message}
                  onChange={handleInput}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};