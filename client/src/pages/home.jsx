import React from "react";
import { motion } from "framer-motion";
import {
  FaCalendarCheck,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useLogin } from "../components/LoginContext";

const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const Home = () => {
  const { loggedIn, user } = useLogin();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "SalonHub - Online Salon Booking Platform",
    description:
      "Book the best salon and spa services at home or in-salon across India. Haircuts, facials, manicure, pedicure, bridal makeup and more beauty services.",
    url: "https://salonhub.co.in",
    telephone: "+91-8810269376",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "India",
    },
    areaServed: "India",
    serviceType:
      "Salon booking, salon appointment booking online, beauty services, spa treatments",
    sameAs: [],
  };

  const getButtonText = () => {
    if (!loggedIn) return "Book Salon Appointment Now";

    switch (user?.usertype) {
      case "shopOwner":
      case "ShopOwner":
        return "Dashboard";
      case "admin":
        return "Admin Dashboard";
      default:
        return "Book Salon Appointment Now";
    }
  };

  const getButtonLink = () => {
    if (!loggedIn) return "/login";

    switch (user?.usertype) {
      case "shopOwner":
      case "ShopOwner":
        return "/barberDashboard";
      case "admin":
        return "/admin";
      default:
        return "/nearbyShops";
    }
  };

  const trustPoints = [
    {
      title: "Instant Slot Booking",
      desc: "Real-time availability with immediate confirmation.",
      icon: FaCalendarCheck,
      tone: "from-cyan-500 to-blue-500",
    },
    {
      title: "Zero Waiting",
      desc: "Book your slot and skip long waiting queues.",
      icon: FaClock,
      tone: "from-amber-500 to-orange-500",
    },
    {
      title: "Verified Professionals",
      desc: "Rated salons and trusted service experts only.",
      icon: FaShieldAlt,
      tone: "from-emerald-500 to-teal-500",
    },
  ];

  const reasons = [
    [
      "Easy Online Booking",
      "Book salon appointments 24/7 from mobile or desktop with instant confirmation.",
    ],
    [
      "Top Salons Near You",
      "Discover highly rated salons and spas in your city with clear service details.",
    ],
    [
      "Real-Time Slot Availability",
      "Check live slots and choose a time that matches your day.",
    ],
    [
      "Genuine Reviews",
      "Read authentic customer feedback before you choose a salon.",
    ],
    [
      "Wide Service Selection",
      "From quick grooming to bridal packages, everything stays in one place.",
    ],
    [
      "Secure Payments",
      "Pay safely with trusted payment options and transparent pricing.",
    ],
  ];

  const steps = [
    [
      "Search Salons",
      "Browse nearby salons offering haircut, skin, spa, and grooming services.",
    ],
    [
      "Choose Service",
      "Pick the services you need and compare options confidently.",
    ],
    [
      "Select Time Slot",
      "Choose the best available time and confirm in seconds.",
    ],
    [
      "Show Up & Relax",
      "Arrive on time and enjoy your scheduled beauty session.",
    ],
  ];

  const cities = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Chandigarh",
    "Noida",
  ];

  const faqs = [
    [
      "How do I book a salon appointment online?",
      "Search for salons near you, select services and your preferred slot, then confirm booking.",
    ],
    [
      "Can I check ratings before booking?",
      "Yes. SalonHub shows customer ratings and reviews so you can decide confidently.",
    ],
    [
      "Which services are available?",
      "Haircut, styling, facials, waxing, manicure, pedicure, spa treatments, and more.",
    ],
    [
      "Is online payment secure?",
      "Yes. We use secure payment flows to keep your transactions protected.",
    ],
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-3 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-48 h-64 w-64 rounded-full bg-orange-200/60 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          variants={riseIn}
          className="relative w-full"
        >
          <section className="mb-6 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="grid gap-6 p-7 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-2 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Salon Booking Made Elegant
                </p>
                <h3 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Welcome
                  {user ? (
                    <span className="mx-2 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text italic text-transparent">
                      {user.name}
                    </span>
                  ) : (
                    <span className="mx-2">to</span>
                  )}
                  to SalonHub
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                  Find highly rated salons, compare services, and lock your preferred slot in seconds.
                  SalonHub simplifies your entire beauty booking journey from discovery to confirmation.
                </p>

                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href={getButtonLink()}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-7 py-3 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    {getButtonText()}
                  </a>
                  <a
                    href="/services"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3 text-base font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                  >
                    Explore Services
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Why It Works</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["5k+", "Happy Customers"],
                    ["50+", "Cities Covered"],
                    ["24/7", "Booking Access"],
                  ].map(([value, label]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <p className="text-2xl font-black text-amber-200">{value}</p>
                      <p className="text-sm font-medium text-slate-100">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4">
                  <p className="text-sm text-slate-100">
                    Your next self-care session is one booking away. Instant confirmation, no hassle.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 grid gap-4 md:grid-cols-3">
            {trustPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-md"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </motion.article>
              );
            })}
          </section>

          <section className="mb-12 rounded-3xl border border-cyan-100 bg-white/90 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              Why Choose SalonHub for Online Salon Booking?
            </h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {reasons.map(([title, desc], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-12 rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-10">
            <h2 className="text-2xl font-black md:text-3xl">How to Book Salon Online</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(([title, desc], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="rounded-2xl border border-white/15 bg-white/5 p-5"
                >
                  <p className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-slate-900">
                    {index + 1}
                  </p>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-lg md:p-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
                  Book Salon Services in Major Indian Cities
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Find your nearest beauty professionals and book with confidence.
                </p>
              </div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                <FaMapMarkerAlt /> Growing across India
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {cities.map((city) => (
                <div
                  key={city}
                  className="rounded-xl border border-slate-100 bg-gradient-to-br from-cyan-50 to-orange-50 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                >
                  {city}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {faqs.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">{question}</h3>
                  <p className="mt-2 text-sm text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-emerald-500 p-8 text-center text-white shadow-xl md:p-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <FaStar /> Trusted by thousands
            </p>
            <h2 className="text-2xl font-black md:text-3xl">
              Ready to Book Your Salon Appointment?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/95 md:text-base">
              Join thousands of happy customers using SalonHub for easy beauty service bookings.
            </p>
            <a
              href={loggedIn ? "/nearbyShops" : "/login"}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-slate-900 transition hover:-translate-y-0.5"
            >
              <FaCheckCircle className="text-emerald-600" />
              Book Your Favorite Salon Now
            </a>
          </section>
        </motion.div>
      </main>
    </>
  );
};
