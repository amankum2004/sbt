import React from "react";
import { motion } from "framer-motion";

export const About = () => {
  // Structured data for About page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About SalonHub - Online Salon Booking Platform",
    "description": "Learn about SalonHub - India's leading platform for online salon booking. Our mission to make beauty services accessible with easy booking for haircuts, facials, spa & more.",
    "mainEntity": {
      "@type": "Organization",
      "name": "SalonHub",
      "description": "Online salon and beauty services booking platform in India",
      "url": "https://salonhub.co.in",
      "founder": "SalonHub Team",
      "foundingDate": "2024",
      "areaServed": "India",
      "serviceType": "Salon Booking Platform"
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl"
        >
          {/* Updated to SalonHub for consistency */}
          <h1 className="text-4xl font-bold text-center text-purple-800 mb-6">
            About SalonHub - India's Leading Salon Booking Platform
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed text-center mb-10">
            At <strong>SalonHub</strong>, we believe in making <strong>beauty and grooming services accessible</strong> to everyone in India. 
            Our platform connects you with <strong>top-rated salons and spas</strong> across the country, making <strong>online salon booking</strong> simple, fast, and stress-free.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Story - Revolutionizing Salon Booking in India</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              SalonHub was born from a simple vision: to <strong>transform how India books salon appointments</strong>. 
              Tired of endless phone calls, uncertain availability, and last-minute disappointments, we created a 
              comprehensive digital solution that puts <strong>beauty services at your fingertips</strong>.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Founded in 2024, we've grown to become one of India's most trusted platforms for 
              <strong> online beauty service bookings</strong>. From basic haircuts to elaborate bridal packages, 
              we connect customers with the <strong>best salons and beauty professionals</strong> across the country.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">What We Offer - Comprehensive Beauty Solutions</h2>
            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-4">
              <li>
                <strong>Wide Range of Beauty Services:</strong> From <strong>haircuts and styling</strong> to 
                <strong> facials, waxing, manicure, pedicure, bridal makeup, and spa treatments</strong> - 
                we cover all your beauty and grooming needs.
              </li>
              <li>
                <strong>Verified Salon Partners:</strong> Every salon on our platform is carefully verified 
                to ensure <strong>quality service and professional standards</strong> for our customers.
              </li>
              <li>
                <strong>Real-Time Availability:</strong> See <strong>available time slots instantly</strong> 
                and book appointments that fit your schedule perfectly.
              </li>
              <li>
                <strong>Genuine Customer Reviews:</strong> Make informed decisions with <strong>authentic reviews and ratings</strong> 
                from real customers who've experienced the services.
              </li>
              <li>
                <strong>Secure Online Payments:</strong> Multiple payment options with <strong>complete security and transparency</strong> 
                for all your transactions.
              </li>
              <li>
                <strong>Pan-India Coverage:</strong> Book salon services in major cities including 
                <strong> Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, and more</strong>.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Mission & Vision</h2>
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To make <strong>quality beauty services accessible and affordable</strong> for every Indian by 
                leveraging technology to create a <strong>seamless salon booking experience</strong>.
              </p>
            </div>
            <div className="bg-pink-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become <strong>India's most trusted beauty services platform</strong>, revolutionizing the 
                way people discover and book salon services while empowering local beauty businesses to grow.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Why Choose SalonHub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["100% Verified Salons", "Every partner salon is thoroughly verified for quality and hygiene standards"],
                ["Easy Online Booking", "Book appointments in less than 2 minutes with our user-friendly platform"],
                ["Best Price Guarantee", "Competitive pricing with no hidden charges for all beauty services"],
                ["24/7 Customer Support", "Dedicated support team to help with all your booking needs and queries"],
                ["Wide Service Range", "From basic grooming to premium spa treatments - everything in one place"],
                ["Instant Confirmation", "Get immediate booking confirmation with all service details"]
              ].map(([title, desc]) => (
                <div key={title} className="bg-white border border-purple-100 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-purple-600 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Commitment to Quality</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              We are deeply committed to providing a platform that's <strong>trustworthy, reliable, and customer-centric</strong>. 
              We partner with salons that share our values of <strong>excellence, hygiene, and professional service</strong>.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Every booking through SalonHub comes with our <strong>quality assurance promise</strong>. We work tirelessly 
              to ensure that your experience - from booking to service delivery - is <strong>seamless and satisfying</strong>.
            </p>
          </section>

          <section className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Join the SalonHub Community</h2>
            <p className="text-lg mb-6 opacity-90">
              Thousands of satisfied customers across India trust SalonHub for their beauty service needs. 
              Experience the difference today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:shadow-lg transition-all">
                Book Your First Appointment
              </a>
              <a href="/contact" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all">
                Contact Us
              </a>
            </div>
          </section>

          <section className="mt-10 text-center text-gray-600">
            <p className="text-lg">
              <strong>Thank you for choosing SalonHub.</strong> We look forward to helping you look and feel your best!
            </p>
            <p className="text-sm mt-4">
              SalonHub - Your trusted partner for <strong>online salon booking in India</strong>
            </p>
          </section>
        </motion.div>
      </main>
    </>
  );
};








// import React from "react";
// import { motion } from "framer-motion";

// export const About = () => {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl"
//       >
//         <h1 className="text-4xl font-bold text-center text-purple-800 mb-6">
//           About Salonify
//         </h1>
//         <p className="text-lg text-gray-600 leading-relaxed text-center mb-10">
//           At Salonify, we believe in making beauty accessible to everyone, anytime. Our platform connects you with top-rated salons and makes booking simple and stress-free.
//         </p>

//         <section className="mb-10">
//           <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Story</h2>
//           <p className="text-gray-700 text-lg leading-relaxed">
//             We started with a vision to revolutionize salon bookings. Tired of making phone calls or walking in blindly, we created a digital space where users could easily find available time slots and book their services with confidence and convenience.
//           </p>
//         </section>

//         <section className="mb-10">
//           <h2 className="text-2xl font-semibold text-purple-600 mb-4">What We Offer</h2>
//           <ul className="list-disc pl-6 text-gray-700 text-lg space-y-4">
//             <li>
//               <strong>Comprehensive Salon Listings:</strong> From haircuts to spa treatments, we feature a wide variety of beauty services.
//             </li>
//             <li>
//               <strong>User-Friendly Interface:</strong> Simple and intuitive design to help you find and book appointments within minutes.
//             </li>
//             <li>
//               <strong>Verified Reviews:</strong> Read honest feedback from customers to choose the best salon and service.
//             </li>
//             <li>
//               <strong>Personalized Experience:</strong> Save favorites, track appointments, and get tailored recommendations.
//             </li>
//           </ul>
//         </section>

//         <section className="mb-10">
//           <h2 className="text-2xl font-semibold text-purple-600 mb-4">Our Commitment</h2>
//           <p className="text-gray-700 text-lg leading-relaxed mb-4">
//             We're dedicated to providing a platform that's trustworthy, reliable, and easy to use. We partner with salons to guarantee top-notch service, every time you book.
//           </p>
//           <p className="text-gray-700 text-lg leading-relaxed">
//             Thank you for choosing Salonify. We look forward to helping you look and feel your best!
//           </p>
//         </section>
//       </motion.div>
//     </main>
//   );
// };
