import React from "react";
import { motion } from "framer-motion";
import { FaBullseye, FaLightbulb, FaHandshake, FaHeart, FaLeaf } from "react-icons/fa";

const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const About = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About SalonHub - Online Salon Booking Platform",
    description:
      "Learn about SalonHub - India's leading platform for online salon booking. Our mission is to make beauty services accessible with easy booking for haircuts, facials, spa and more.",
    mainEntity: {
      "@type": "Organization",
      name: "SalonHub",
      description: "Online salon and beauty services booking platform in India",
      url: "https://salonhub.co.in",
      founder: "SalonHub Team",
      foundingDate: "2024",
      areaServed: "India",
      serviceType: "Salon Booking Platform",
    },
  };

  const values = [
    {
      title: "Customer First",
      desc: "Every booking flow is designed to be fast, transparent, and low-friction.",
      icon: FaHeart,
      tone: "from-rose-500 to-orange-500",
    },
    {
      title: "Trust Through Quality",
      desc: "We partner only with salons that meet strong service and hygiene standards.",
      icon: FaHandshake,
      tone: "from-cyan-500 to-blue-500",
    },
    {
      title: "Innovation in Beauty",
      desc: "Technology helps customers discover better options and book with confidence.",
      icon: FaLightbulb,
      tone: "from-amber-500 to-yellow-500",
    },
    {
      title: "Sustainable Growth",
      desc: "We help local beauty businesses grow through predictable digital bookings.",
      icon: FaLeaf,
      tone: "from-emerald-500 to-teal-500",
    },
  ];

  const milestones = [
    {
      title: "2024: The Idea Took Shape",
      desc: "SalonHub started with a simple goal: eliminate call-and-wait chaos from salon booking.",
    },
    {
      title: "Platform Rollout",
      desc: "We launched online discovery, service browsing, and slot confirmation in one seamless flow.",
    },
    {
      title: "Growing Across Cities",
      desc: "SalonHub now serves customers across major Indian cities with trusted partner salons.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={riseIn}
          transition={{ duration: 0.55 }}
          className="relative w-full"
        >
          <section className="mb-10 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <FaBullseye /> About SalonHub
                </p>
                <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  India's Trusted Platform for Smart Salon Booking
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                  SalonHub was built to make beauty and grooming services more accessible, reliable,
                  and stress-free. We connect customers with top-rated salons and create a better booking
                  experience through technology.
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">At A Glance</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["Founded", "2024"],
                    ["Coverage", "Pan-India"],
                    ["Focus", "Salon + Spa Bookings"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-300">{label}</p>
                      <p className="mt-1 text-lg font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Fast Booking", "< 2 minutes"],
              ["Support", "24/7"],
              ["Service Discovery", "Live availability"],
              ["Customer Trust", "Verified reviews"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-white/90 px-5 py-4 text-center shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </section>

          <section className="mb-10 rounded-3xl border border-cyan-100 bg-white/95 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">Our Story</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              SalonHub started by solving a real problem: customers were spending too much time calling,
              waiting, and guessing availability. We turned that into a smooth digital experience.
            </p>

            <div className="mt-7 space-y-4">
              {milestones.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-10">
            <h2 className="text-2xl font-black md:text-3xl">What We Stand For</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {values.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="rounded-2xl border border-white/15 bg-white/5 p-5"
                  >
                    <div
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}
                    >
                      <Icon />
                    </div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-200">{item.desc}</p>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className="mb-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 p-7 shadow-md">
              <h3 className="text-xl font-black text-slate-900">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Make quality beauty services accessible and affordable for every Indian through simple,
                transparent, and reliable online salon booking.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-7 shadow-md">
              <h3 className="text-xl font-black text-slate-900">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Become India's most trusted beauty services platform while empowering local salon owners
                with stronger digital visibility and growth.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 p-8 text-center text-white shadow-xl md:p-10">
            <h2 className="text-2xl font-black md:text-3xl">Join the SalonHub Community</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/95 md:text-base">
              Thousands of customers already trust SalonHub for consistent and convenient beauty service
              bookings across India.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5"
              >
                Book Your Appointment
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/70 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Contact Us
              </a>
            </div>
          </section>
        </motion.div>
      </main>
    </>
  );
};
