import React from "react";
import { motion } from "framer-motion";

export const Service = () => {
  // Structured data for Service page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Salon Services - SalonHub",
    "description": "Professional salon services including haircuts, facials, hair spa, beard grooming, waxing, and beauty treatments. Book online at SalonHub.",
    "provider": {
      "@type": "Organization",
      "name": "SalonHub",
      "url": "https://salonhub.co.in"
    },
    "areaServed": "India",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Salon Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Hair Cut"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Hair Coloring"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Facial"
          }
        }
      ]
    }
  };

  const services = [
    {
      title: "Hair Cut & Styling",
      img: "images/hair_cut.jpg",
      desc: "Professional haircut services from classic to modern styles. Includes washing, trimming, and styling for men and women. Book your haircut appointment online.",
      keywords: ["haircut", "hair styling", "trimming", "salon haircut"]
    },
    {
      title: "Shaving (Clean/Traditional)",
      img: "images/clean_shave.jpg",
      desc: "Traditional clean shave with razor and hot towel treatment. Includes pre-shave oil and post-shave care for smooth, irritation-free skin.",
      keywords: ["clean shave", "traditional shave", "razor shave", "barber shave"]
    },
    {
      title: "Hair Coloring Services",
      img: "images/hair color.jpg",
      desc: "Professional hair coloring services including global color, highlights, balayage, and gray coverage. Use premium hair colors for best results.",
      keywords: ["hair color", "highlights", "gray coverage", "hair dye"]
    },
    {
      title: "Beard Grooming & Styling",
      img: "images/Beard_grooming.jpg",
      desc: "Expert beard trimming, shaping, and conditioning services. Get the perfect beard style with professional grooming techniques.",
      keywords: ["beard grooming", "beard trim", "beard styling", "beard care"]
    },
    {
      title: "Facial & Skin Care",
      img: "images/facial.jpg",
      desc: "Professional facial treatments for skin rejuvenation. Includes cleansing, exfoliation, massage, and moisturizing for glowing skin.",
      keywords: ["facial", "skin care", "cleanup", "skin treatment"]
    },
    {
      title: "Head Massage Therapy",
      img: "images/head_massage.jpg",
      desc: "Relaxing head massage to relieve stress, improve scalp health, and boost blood circulation. Reduces tension and promotes hair growth.",
      keywords: ["head massage", "scalp massage", "stress relief", "champi"]
    },
    {
      title: "Hair Spa Treatment",
      img: "images/hair spa.jpg",
      desc: "Deep conditioning hair spa to nourish, repair damage, and control frizz. Restores moisture and vitality to dry, damaged hair.",
      keywords: ["hair spa", "deep conditioning", "hair treatment", "frizz control"]
    },
    {
      title: "Hair Straightening & Perming",
      img: "images/hair_straight.jpg",
      desc: "Chemical treatments for hair straightening or perming. Long-lasting results with keratin treatments and smoothing services.",
      keywords: ["hair straightening", "keratin treatment", "hair smoothing", "perming"]
    },
    {
      title: "Waxing Services",
      img: "images/waxing.jpg",
      desc: "Full body waxing services for smooth, hair-free skin. Includes legs, arms, face, and Brazilian waxing with premium wax.",
      keywords: ["waxing", "hair removal", "body waxing", "smooth skin"]
    },
    {
      title: "Scalp Treatments",
      img: "images/scalp_treatment.jpg",
      desc: "Specialized scalp treatments for dandruff, dryness, and hair thinning. Promotes healthy scalp environment for better hair growth.",
      keywords: ["scalp treatment", "dandruff treatment", "hair fall control", "scalp care"]
    },
    {
      title: "Eyebrow Shaping & Threading",
      img: "images/eye_brow.jpg",
      desc: "Precise eyebrow shaping, threading, and grooming services. Achieve perfectly shaped eyebrows to enhance your facial features.",
      keywords: ["eyebrow shaping", "threading", "eyebrow grooming", "face threading"]
    },
    {
      title: "Hair Loss Treatment",
      img: "images/hair_loss_treatment.jpg",
      desc: "Advanced hair loss treatments to reduce thinning and promote new growth. Includes PRP therapy and medical treatments for hair regrowth.",
      keywords: ["hair loss treatment", "hair fall control", "PRP therapy", "hair regrowth"]
    },
  ];

  const popularServices = [
    "Hair Cut & Styling",
    "Facial & Skin Care", 
    "Hair Coloring Services",
    "Waxing Services",
    "Beard Grooming & Styling",
    "Hair Spa Treatment"
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <section className="bg-gradient-to-br from-gray-100 to-white py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold text-purple-800 mb-3 mt-4">
              Professional Salon Services in India
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best salon and beauty services at SalonHub. From haircuts to spa treatments, 
              we offer premium beauty services with expert professionals. Book your appointment online today!
            </p>
          </div>

          {/* Popular Services Quick Access */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-semibold text-purple-700 text-center mb-6">
              Most Popular Salon Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularServices.map((service, idx) => (
                <div key={idx} className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <span className="text-purple-700 font-medium text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Explore Our Beauty Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { name: "Hair Services", count: "6+ services" },
                { name: "Skin & Facial", count: "3+ services" },
                { name: "Beard & Grooming", count: "4+ services" },
                { name: "Spa & Massage", count: "2+ services" }
              ].map((category, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                  <h3 className="font-semibold text-purple-600">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-purple-50"
              >
                <img
                  src={service.img}
                  alt={`${service.title} service at SalonHub`}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">{service.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.keywords.map((keyword, keyIdx) => (
                      <span key={keyIdx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Book {service.title}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Book Your Salon Service?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Choose from 50+ professional beauty services and book your appointment in 2 minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg transition-all">
                Book Appointment Now
              </a>
              {/* <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-purple-600 transition-all">
                Call for Consultation
              </button> */}
            </div>
            <p className="text-sm mt-4 opacity-80">
              ✅ 100+ Certified Salons ✅ Best Price Guarantee ✅ Instant Confirmation
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-center text-purple-800 mb-8">
              Frequently Asked Questions - Salon Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: "How do I book a salon service online?",
                  answer: "Simply select your service, choose your preferred salon, pick a time slot, and confirm your booking. It's that easy!"
                },
                {
                  question: "What beauty services do you offer?",
                  answer: "We offer comprehensive beauty services including haircuts, coloring, facials, waxing, spa treatments, beard grooming, and specialized hair treatments."
                },
                {
                  question: "Are the salon professionals certified?",
                  answer: "Yes, all our partner salons employ certified and experienced professionals who are experts in their respective beauty services."
                },
                {
                  question: "Can I see service prices before booking?",
                  answer: "Absolutely! All service prices are clearly displayed before booking. No hidden charges or surprises."
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-purple-100 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-700 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};







// import React from "react";
// import { motion } from "framer-motion";

// export const Service = () => {
//   const services = [
//     {
//       title: "Hair Cut",
//       img: "images/hair_cut.jpg",
//       desc: "A variety of haircut styles from classic to modern. Includes washing, trimming, and shaping.",
//     },
//     {
//       title: "Shaving (Clean/Traditional)",
//       img: "images/clean_shave.jpg",
//       desc: "Close shave using razors or blades, with hot towel treatment and oils.",
//     },
//     {
//       title: "Hair Coloring",
//       img: "images/hair color.jpg",
//       desc: "Full coloring or highlights to change style or cover grays.",
//     },
//     {
//       title: "Beard Grooming",
//       img: "images/Beard_grooming.jpg",
//       desc: "Trimming, shaping, and conditioning for a stylish beard.",
//     },
//     {
//       title: "Facial",
//       img: "images/facial.jpg",
//       desc: "Cleansing, exfoliation, and moisturizing for skin rejuvenation.",
//     },
//     {
//       title: "Head Massage",
//       img: "images/head_massage.jpg",
//       desc: "Relieves stress, improves scalp health, and boosts circulation.",
//     },
//     {
//       title: "Hair Spa",
//       img: "images/hair spa.jpg",
//       desc: "Deep conditioning to nourish hair, control frizz, and repair damage.",
//     },
//     {
//       title: "Hair Straightening/Perming",
//       img: "images/hair_straight.jpg",
//       desc: "Long-lasting chemical treatments for styling hair.",
//     },
//     {
//       title: "Waxing",
//       img: "images/waxing.jpg",
//       desc: "Removes unwanted body hair for smooth skin.",
//     },
//     {
//       title: "Scalp Treatments",
//       img: "images/scalp_treatment.jpg",
//       desc: "Targets dandruff, dryness, and hair thinning for a healthier scalp.",
//     },
//     {
//       title: "Eyebrow Shaping",
//       img: "images/eye_brow.jpg",
//       desc: "Trimming and shaping for a clean, well-groomed look.",
//     },
//     {
//       title: "Hair Loss Treatment",
//       img: "images/hair_loss_treatment.jpg",
//       desc: "Treatments to reduce thinning and promote new growth.",
//     },
//   ];

//   return (
//     <section className="bg-gradient-to-br from-gray-100 to-white py-16 px-4 sm:px-6 lg:px-8">
//       <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="max-w-6xl mx-auto"
//             >
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-14">
//           <h2 className="text-4xl font-bold text-purple-800 mb-3 mt-4">
//             Salon Services
//           </h2>
//           <p className="text-xl text-gray-600">
//             Best Salon and Barber Services for You
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {services.map((service, idx) => (
//             <div
//               key={idx}
//               className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
//               >
//               <img
//                 src={service.img}
//                 alt={service.title}
//                 className="w-full h-56 object-cover"
//               />
//               <div className="p-6 text-center">
//                 <h3 className="text-xl font-semibold text-purple-800 mb-2">
//                   {service.title}
//                 </h3>
//                 <p className="text-gray-600 text-base">{service.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       </motion.div>
//     </section>
//   );
// };
