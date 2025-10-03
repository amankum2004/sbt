import React from "react";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCopyright,
  FaStar,
  FaShieldAlt
} from "react-icons/fa";

export const Footer = () => {
  // Structured data for LocalBusiness
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "SalonHub - Online Salon Booking Platform",
    "description": "Book salon appointments online for haircuts, facials, spa, and beauty services across India. Best salon booking platform with verified professionals.",
    "url": "https://salonhub.co.in",
    "telephone": "+91-8810269376",
    "email": "sbthelp123@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Indian Institute of Technology Mandi",
      "addressLocality": "Kamand",
      "addressRegion": "Himachal Pradesh",
      "postalCode": "175005",
      "addressCountry": "IN"
    },
    "areaServed": "India",
    "serviceType": "Salon Booking, Beauty Services, Online Appointments",
    "sameAs": [
      "https://www.facebook.com/salonhub",
      "https://www.instagram.com/salonhub",
      "https://twitter.com/salonhub",
      "https://www.linkedin.com/company/salonhub"
    ]
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="w-full">
        {/* Trust Badges Section - New Addition for SEO */}
        <div className="bg-white border-t border-gray-200 py-6">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: FaStar, text: "4.8/5 Customer Rating", subtext: "5000+ Happy Customers" },
                { icon: FaShieldAlt, text: "100% Secure Payments", subtext: "SSL Encrypted" },
                { icon: FaMapMarkerAlt, text: "50+ Cities in India", subtext: "Pan-India Service" },
                { icon: FaCopyright, text: "Verified Salons", subtext: "Quality Assured" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <item.icon className="text-purple-600 text-2xl mb-2" />
                  <span className="text-gray-800 font-semibold text-sm">{item.text}</span>
                  <span className="text-gray-500 text-xs">{item.subtext}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <footer className="bg-gradient-to-r from-purple-900 to-pink-800 text-white pt-12 pb-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Company Info - Enhanced for SEO */}
              <div className="lg:col-span-2">
                <div className="flex flex-col items-center md:items-start">
                  <a href="/" className="mb-4 flex items-center">
                    <img 
                      src="/images/salonHub-logo.svg" 
                      alt="SalonHub - Online Salon Booking Platform for Beauty Services in India" 
                      className="h-16 w-16 rounded-full bg-white shadow-lg"
                    />
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold">SalonHub</h1>
                      <p className="text-pink-200 text-sm">India's Trusted Salon Booking Platform</p>
                    </div>
                  </a>
                  <p className="text-pink-200 text-sm text-center md:text-left mb-4">
                    <strong>SalonHub</strong> is India's leading online platform for <strong>salon and beauty service bookings</strong>. 
                    Book <strong>haircuts, facials, spa treatments, and grooming services</strong> with top-rated professionals across 50+ cities.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Salon Booking", "Beauty Services", "Hair Care", "Spa Treatments"].map((tag, idx) => (
                      <span key={idx} className="bg-purple-700 px-2 py-1 rounded text-xs text-pink-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links - Optimized with Keywords */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Salon Services</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Haircut & Styling", url: "/services#hair" },
                    { name: "Facial & Skin Care", url: "/services#facial" },
                    { name: "Hair Coloring", url: "/services#coloring" },
                    { name: "Beard Grooming", url: "/services#beard" },
                    { name: "Waxing Services", url: "/services#waxing" },
                    { name: "Bridal Makeup", url: "/services#bridal" }
                  ].map((service, index) => (
                    <li key={index}>
                      <a 
                        href={service.url} 
                        className="text-pink-200 hover:text-white flex items-center transition-colors group"
                        title={`Book ${service.name} Services`}
                      >
                        <FaChevronRight className="text-xs mr-2 group-hover:translate-x-1 transition-transform" /> 
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Cities - Local SEO */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Service Cities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Delhi", "Mumbai", "Bangalore", "Chennai", 
                    "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
                    "Jaipur", "Lucknow", "Chandigarh", "Noida"
                  ].map((city, index) => (
                    <a 
                      key={index}
                      // href={`/salons-in-${city.toLowerCase()}`}
                      className="text-pink-200 hover:text-white text-sm transition-colors"
                      title={`Salon Services in ${city}`}
                    >
                      {city}
                    </a>
                  ))}
                </div>
                <div className="mt-4">
                  <a 
                    // href="/all-cities" 
                    className="text-pink-300 hover:text-white text-sm font-semibold transition-colors"
                  >
                    +40 More Cities →
                  </a>
                </div>
              </div>

              {/* Contact & Social - Enhanced */}
              <div>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Contact & Support</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <FaMapMarkerAlt className="mt-1 mr-3 text-pink-300 flex-shrink-0" />
                    <span className="text-pink-200 text-sm">
                      Indian Institute of Technology Mandi,<br />
                      Kamand, Himachal Pradesh-175005,<br />
                      <strong>India</strong>
                    </span>
                  </li>
                  <li className="flex items-center">
                    <FaPhoneAlt className="mr-3 text-pink-300 flex-shrink-0" />
                    <a 
                      href="tel:+918810269376" 
                      className="text-pink-200 hover:text-white transition-colors text-sm"
                      title="Call SalonHub Customer Support"
                    >
                      +91 8810269376
                    </a>
                  </li>
                  <li className="flex items-center">
                    <FaEnvelope className="mr-3 text-pink-300 flex-shrink-0" />
                    <a 
                      href="mailto:sbthelp123@gmail.com" 
                      className="text-pink-200 hover:text-white transition-colors text-sm"
                      title="Email SalonHub Support"
                    >
                      sbthelp123@gmail.com
                    </a>
                  </li>
                </ul>

                {/* Social Media with Proper Links */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-pink-200">Follow SalonHub</h4>
                  <div className="flex space-x-3">
                    {[
                      { icon: FaFacebook, url: "https://www.facebook.com/salonhub", name: "Facebook" },
                      { icon: FaTwitter, url: "https://twitter.com/salonhub", name: "Twitter" },
                      { icon: FaInstagram, url: "https://www.instagram.com/salonhub", name: "Instagram" },
                      { icon: FaLinkedin, url: "https://www.linkedin.com/company/salonhub", name: "LinkedIn" }
                    ].map((social, index) => (
                      <a 
                        key={index}
                        href={social.url}
                        target="_blank" 
                        rel="noopener noreferrer nofollow" 
                        className="bg-pink-700 hover:bg-pink-600 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        title={`Follow SalonHub on ${social.name}`}
                        aria-label={`Follow on ${social.name}`}
                      >
                        <social.icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Copyright Section - Enhanced */}
        <div className="bg-gradient-to-r from-purple-950 to-pink-900 py-4">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-2 md:mb-0">
                <p className="text-pink-200 text-sm">
                  <FaCopyright className="inline mr-1" /> 
                  {new Date().getFullYear()} <strong>SalonHub</strong>. All rights reserved.
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-pink-300 text-sm">Proudly serving</span>
                  <span className="text-white font-semibold text-sm">India</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center space-x-4">
                <a 
                  href="/privacy-policy" 
                  className="text-pink-200 hover:text-white text-sm transition-colors"
                  title="SalonHub Privacy Policy"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms-of-service" 
                  className="text-pink-200 hover:text-white text-sm transition-colors"
                  title="SalonHub Terms of Service"
                >
                  Terms of Service
                </a>
                <a 
                  href="/cancellation-policy" 
                  className="text-pink-200 hover:text-white text-sm transition-colors"
                  title="SalonHub Cancellation Policy"
                >
                  Cancellation Policy
                </a>
                <a 
                  href="/sitemap.xml" 
                  className="text-pink-200 hover:text-white text-sm transition-colors"
                  title="SalonHub Sitemap"
                >
                  Sitemap
                </a>
              </div>
            </div>
            {/* SEO Keywords Footer - Hidden but crawlable */}
            <div className="text-center mt-3">
              <div className="hidden md:block">
                <p className="text-pink-300 text-xs">
                  SalonHub - Online Salon Booking | Beauty Services | Hair Salon | Spa Treatments | 
                  Facial | Haircut | Grooming | India | Delhi | Mumbai | Bangalore | Chennai | 
                  Kolkata | Hyderabad | Pune | Affordable | Professional | Verified Salons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};






// import React from "react";
// import { 
//   FaFacebook, 
//   FaTwitter, 
//   FaInstagram, 
//   FaLinkedin,
//   FaChevronRight,
//   FaMapMarkerAlt,
//   FaPhoneAlt,
//   FaEnvelope,
//   FaCopyright
// } from "react-icons/fa";

// export const Footer = () => {
//   return (
//     <div className="w-full">
//       {/* Main Footer */}
//       <footer className="bg-gradient-to-r from-purple-900 to-pink-800 text-white pt-12 pb-8 px-4">
//         <div className="container mx-auto max-w-7xl">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
//             {/* Logo and Description */}
//             <div className="flex flex-col items-center md:items-start">
//               <a href="/" className="mb-4">
//                 <img 
//                   src="/images/salonHub-logo.svg" 
//                   alt="Salon Booking Time" 
//                   className="h-16 w-16 rounded-full bg-white shadow-lg"
//                 />
//               </a>
//               <h3 className="text-xl font-bold mb-2 text-center md:text-left">Book Your Beauty</h3>
//               <p className="text-pink-200 text-sm text-center md:text-left">
//                 Your one-stop solution for all salon booking needs
//               </p>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Quick Links</h3>
//               <ul className="space-y-3">
//                 <li>
//                   <a href="/about" className="text-pink-200 hover:text-white flex items-center transition-colors">
//                     <FaChevronRight className="text-xs mr-2" /> About Us
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/services" className="text-pink-200 hover:text-white flex items-center transition-colors">
//                     <FaChevronRight className="text-xs mr-2" /> Services
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/contact" className="text-pink-200 hover:text-white flex items-center transition-colors">
//                     <FaChevronRight className="text-xs mr-2" /> Contact
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/privacy-policy" className="text-pink-200 hover:text-white flex items-center transition-colors">
//                     <FaChevronRight className="text-xs mr-2" /> Privacy Policy
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             {/* Contact Info */}
//             <div>
//               <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Contact Us</h3>
//               <ul className="space-y-3">
//                 <li className="flex items-start">
//                   <FaMapMarkerAlt className="mt-1 mr-3 text-pink-300" />
//                   <span className="text-pink-200">
//                     Indian Institute of Technology Mandi,<br />
//                     Kamand, Himachal Pradesh-175005
//                   </span>
//                 </li>
//                 <li className="flex items-center">
//                   <FaPhoneAlt className="mr-3 text-pink-300" />
//                   <a href="tel:+918810269376" className="text-pink-200 hover:text-white transition-colors">
//                     +91 8810269376
//                   </a>
//                 </li>
//                 <li className="flex items-center">
//                   <FaEnvelope className="mr-3 text-pink-300" />
//                   <a href="mailto:sbthelp123@gmail.com" className="text-pink-200 hover:text-white transition-colors">
//                     sbthelp123@gmail.com
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             {/* Newsletter and Social */}
//             <div>
//               <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Newsletter</h3>
//               <p className="text-pink-200 mb-4">
//                 Subscribe to get updates on special offers
//               </p>
              
//               {/* Social Media Icons */}
//               <div className="mt-6">
//                 <h4 className="text-md font-medium mb-3 text-pink-200">Follow Us</h4>
//                 <div className="flex space-x-4">
//                   <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
//                     <FaFacebook size={18} />
//                   </a>
//                   <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
//                     <FaTwitter size={18} />
//                   </a>
//                   <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
//                     <FaInstagram size={18} />
//                   </a>
//                   <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
//                     <FaLinkedin size={18} />
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Copyright Section */}
//       <div className="bg-gradient-to-r from-purple-950 to-pink-900 py-4">
//         <div className="container mx-auto max-w-7xl px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <p className="text-pink-200 text-sm mb-2 md:mb-0">
//               <FaCopyright className="inline mr-1" /> {new Date().getFullYear()} SalonHub. All rights reserved.
//             </p>
//             <div className="flex space-x-4">
//               <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
//                 Terms of Service
//               </a>
//               <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
//                 Privacy Policy
//               </a>
//               <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
//                 Cookie Policy
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };