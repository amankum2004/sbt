import React from "react";
import { motion } from "framer-motion";
import { FaCut, FaSpa, FaShieldAlt, FaStar, FaCheckCircle } from "react-icons/fa";

const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const Service = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Salon Services - SalonHub",
    description:
      "Professional salon services including haircuts, facials, hair spa, beard grooming, waxing, and beauty treatments. Book online at SalonHub.",
    provider: {
      "@type": "Organization",
      name: "SalonHub",
      url: "https://salonhub.co.in",
    },
    areaServed: "India",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Salon Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hair Cut",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hair Coloring",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Facial",
          },
        },
      ],
    },
  };

  const services = [
    {
      title: "Hair Cut & Styling",
      img: "images/hair_cut.jpg",
      desc:
        "Professional haircut services from classic to modern styles. Includes washing, trimming, and styling for men and women.",
      keywords: ["haircut", "hair styling", "trimming", "salon haircut"],
    },
    {
      title: "Shaving (Clean/Traditional)",
      img: "images/clean_shave.jpg",
      desc:
        "Traditional clean shave with razor and hot towel treatment, plus pre-shave and post-shave care.",
      keywords: ["clean shave", "traditional shave", "razor shave"],
    },
    {
      title: "Hair Coloring Services",
      img: "images/hair color.jpg",
      desc:
        "Global color, highlights, balayage, and gray coverage using premium hair color products.",
      keywords: ["hair color", "highlights", "gray coverage", "hair dye"],
    },
    {
      title: "Beard Grooming & Styling",
      img: "images/Beard_grooming.jpg",
      desc:
        "Expert beard trimming, shaping, and conditioning to maintain a sharp and clean look.",
      keywords: ["beard grooming", "beard trim", "beard styling"],
    },
    {
      title: "Facial & Skin Care",
      img: "images/facial.jpg",
      desc:
        "Professional facial treatments including cleansing, exfoliation, massage, and hydration.",
      keywords: ["facial", "skin care", "cleanup", "skin treatment"],
    },
    {
      title: "Head Massage Therapy",
      img: "images/head_massage.jpg",
      desc:
        "Relaxing head massage to reduce stress, improve scalp health, and improve blood circulation.",
      keywords: ["head massage", "scalp massage", "champi"],
    },
    {
      title: "Hair Spa Treatment",
      img: "images/hair spa.jpg",
      desc:
        "Deep conditioning treatment for frizz control, nourishment, and damage repair.",
      keywords: ["deep conditioning", "hair treatment", "frizz control"],
    },
    {
      title: "Hair Straightening & Perming",
      img: "images/hair_straight.jpg",
      desc:
        "Long-lasting chemical styling services including smoothening, straightening, and perming.",
      keywords: ["hair straightening", "keratin treatment", "perming"],
    },
    {
      title: "Waxing Services",
      img: "images/waxing.jpg",
      desc:
        "Full-body waxing for smooth skin with premium products and professional hygiene standards.",
      keywords: ["waxing", "hair removal", "body waxing", "smooth skin"],
    },
    {
      title: "Scalp Treatments",
      img: "images/scalp_treatment.jpg",
      desc:
        "Targeted scalp care for dandruff, dryness, and thinning concerns to support healthier growth.",
      keywords: ["dandruff treatment", "hair fall control", "scalp care"],
    },
    {
      title: "Eyebrow Shaping & Threading",
      img: "images/eye_brow.jpg",
      desc:
        "Precise threading and eyebrow shaping services for cleaner facial contours.",
      keywords: ["threading", "eyebrow grooming", "face threading"],
    },
    {
      title: "Hair Loss Treatment",
      img: "images/hair_loss_treatment.jpg",
      desc:
        "Advanced treatment options to reduce hair fall and promote stronger regrowth.",
      keywords: ["hair fall control", "PRP therapy", "hair regrowth"],
    },
  ];

  const popularServices = [
    "Hair Cut & Styling",
    "Facial & Skin Care",
    "Hair Coloring",
    "Waxing Services",
    "Beard Grooming",
    "Hair Treatment",
  ];

  const faqs = [
    {
      question: "How do I book a salon service online?",
      answer:
        "Select your service, choose a nearby salon, pick your slot, and confirm booking instantly.",
    },
    {
      question: "Are professionals certified?",
      answer:
        "Yes. Partner salons are verified and staffed by experienced beauty professionals.",
    },
    {
      question: "Can I view prices before booking?",
      answer: "Yes. Prices are clearly shown before confirmation, with no hidden fees.",
    },
    {
      question: "Do you cover multiple cities?",
      answer: "Yes. SalonHub supports bookings across major cities in India.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-16 top-28 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-36 h-72 w-72 rounded-full bg-amber-200/55 blur-3xl" />

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
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  <FaSpa /> Premium Beauty Catalog
                </p>
                <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Professional Salon Services for Every Style
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                  From precision haircuts to advanced skin and hair treatments, explore verified salon
                  services with transparent pricing and quick booking.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Start Booking
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Need Consultation?
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Service Promise</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["12+", "Core service categories"],
                    ["Verified", "Partner salons"],
                    ["Instant", "Slot confirmation"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-2xl font-black text-amber-200">{value}</p>
                      <p className="text-sm text-slate-200">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Expert Stylists",
                desc: "Experienced professionals for modern and classic looks.",
                icon: FaCut,
              },
              {
                title: "Comfort + Hygiene",
                desc: "Clean setups and high standards across partner salons.",
                icon: FaShieldAlt,
              },
              {
                title: "Consistent Quality",
                desc: "Reliable service outcomes backed by customer reviews.",
                icon: FaStar,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.07 }}
                  className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                    <Icon />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </motion.article>
              );
            })}
          </section>

          <section className="mb-10 rounded-3xl border border-emerald-100 bg-white/95 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">Most Popular Services</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {popularServices.map((service) => (
                <div
                  key={service}
                  className="rounded-xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-amber-50 px-3 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  {service}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-5 text-2xl font-black text-slate-900 md:text-3xl">
              Explore Our Beauty Services
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.38, delay: index * 0.03 }}
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src={service.img}
                      alt={`${service.title} service at SalonHub`}
                      className="h-56 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                    {index < 3 ? (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-900">
                        Popular Choice
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.desc}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <a
                      href="/"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Book This Service
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">Service FAQs</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">{faq.question}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 p-8 text-center text-white shadow-xl md:p-10">
            <h2 className="text-2xl font-black md:text-3xl">Ready for Your Next Salon Session?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/95 md:text-base">
              Book quickly, avoid waiting lines, and get salon services that match your style and schedule.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5"
            >
              <FaCheckCircle className="text-emerald-600" />
              Book Appointment Now
            </a>
          </section>
        </motion.div>
      </main>
    </>
  );
};
