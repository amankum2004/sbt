import React from "react";
import { motion } from "framer-motion";

export const Service = () => {
  const services = [
    {
      title: "Hair Cut",
      img: "images/hair_cut.jpg",
      desc: "A variety of haircut styles from classic to modern. Includes washing, trimming, and shaping.",
    },
    {
      title: "Shaving (Clean/Traditional)",
      img: "images/clean_shave.jpg",
      desc: "Close shave using razors or blades, with hot towel treatment and oils.",
    },
    {
      title: "Hair Coloring",
      img: "images/hair color.jpg",
      desc: "Full coloring or highlights to change style or cover grays.",
    },
    {
      title: "Beard Grooming",
      img: "images/Beard_grooming.jpg",
      desc: "Trimming, shaping, and conditioning for a stylish beard.",
    },
    {
      title: "Facial",
      img: "images/facial.jpg",
      desc: "Cleansing, exfoliation, and moisturizing for skin rejuvenation.",
    },
    {
      title: "Head Massage",
      img: "images/head_massage.jpg",
      desc: "Relieves stress, improves scalp health, and boosts circulation.",
    },
    {
      title: "Hair Spa",
      img: "images/hair spa.jpg",
      desc: "Deep conditioning to nourish hair, control frizz, and repair damage.",
    },
    {
      title: "Hair Straightening/Perming",
      img: "images/hair_straight.jpg",
      desc: "Long-lasting chemical treatments for styling hair.",
    },
    {
      title: "Waxing",
      img: "images/waxing.jpg",
      desc: "Removes unwanted body hair for smooth skin.",
    },
    {
      title: "Scalp Treatments",
      img: "images/scalp_treatment.jpg",
      desc: "Targets dandruff, dryness, and hair thinning for a healthier scalp.",
    },
    {
      title: "Eyebrow Shaping",
      img: "images/eye_brow.jpg",
      desc: "Trimming and shaping for a clean, well-groomed look.",
    },
    {
      title: "Hair Loss Treatment",
      img: "images/hair_loss_treatment.jpg",
      desc: "Treatments to reduce thinning and promote new growth.",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-100 to-white py-16 px-4 sm:px-6 lg:px-8">
      <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-purple-800 mb-3 mt-4">
            Our Salon Services
          </h2>
          <p className="text-xl text-gray-600">
            Best Salon and Barber Services for You
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
              >
              <img
                src={service.img}
                alt={service.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </motion.div>
    </section>
  );
};
