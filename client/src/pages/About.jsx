import React from "react";
import { motion } from "framer-motion";

export const About = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl"
      >
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-6">
          About Salonify
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed text-center mb-10">
          At Salonify, we believe in making beauty accessible to everyone, anytime. Our platform connects you with top-rated salons and makes booking simple and stress-free.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Story</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            We started with a vision to revolutionize salon bookings. Tired of making phone calls or walking in blindly, we created a digital space where users could easily find available time slots and book their services with confidence and convenience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">What We Offer</h2>
          <ul className="list-disc pl-6 text-gray-700 text-lg space-y-4">
            <li>
              <strong>Comprehensive Salon Listings:</strong> From haircuts to spa treatments, we feature a wide variety of beauty services.
            </li>
            <li>
              <strong>User-Friendly Interface:</strong> Simple and intuitive design to help you find and book appointments within minutes.
            </li>
            <li>
              <strong>Verified Reviews:</strong> Read honest feedback from customers to choose the best salon and service.
            </li>
            <li>
              <strong>Personalized Experience:</strong> Save favorites, track appointments, and get tailored recommendations.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Commitment</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            We're dedicated to providing a platform that's trustworthy, reliable, and easy to use. We partner with salons to guarantee top-notch service, every time you book.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Thank you for choosing Salonify. We look forward to helping you look and feel your best!
          </p>
        </section>
      </motion.div>
    </main>
  );
};
