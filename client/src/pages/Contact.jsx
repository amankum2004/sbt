import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaEnvelope,
  FaPaperPlane,
  FaPhone,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeadset,
} from "react-icons/fa";
import { useLogin } from "../components/LoginContext";
import { api } from "../utils/api";

const defaultContactFormData = {
  name: "",
  email: "",
  message: "",
};

const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const Contact = () => {
  const [contact, setContact] = useState(defaultContactFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useLogin();
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SalonHub - Beauty Salon Booking Platform",
    description:
      "Contact SalonHub for salon booking inquiries, customer support, and beauty service questions. Get in touch with India's leading online salon booking platform.",
    url: "https://salonhub.co.in/contact",
    mainEntity: {
      "@type": "Organization",
      name: "SalonHub",
      email: "salonhub.business@gmail.com",
      telephone: "+91-8810269376",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Indian Institute of Technology Mandi",
        addressLocality: "Kamand",
        addressRegion: "Himachal Pradesh",
        postalCode: "175005",
        addressCountry: "IN",
      },
      areaServed: "India",
      serviceType: "Online Salon Booking Platform",
    },
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
    setContact((prev) => ({ ...prev, [name]: value }));
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
          confirmButtonColor: "#0f172a",
        });
        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to send message",
        icon: "error",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How do I cancel or reschedule a booking?",
      answer:
        "Use your dashboard to manage bookings, or contact support for urgent assistance.",
    },
    {
      question: "How quickly can I expect a response?",
      answer: "Most support requests receive a response within 2 to 4 hours.",
    },
    {
      question: "Can salon owners partner with SalonHub?",
      answer:
        "Yes. Share your salon details by email and our team will guide you through onboarding.",
    },
    {
      question: "Do you support customers across India?",
      answer:
        "Yes. We help users book salons across major Indian cities with a growing network.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-44 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={riseIn}
          transition={{ duration: 0.55 }}
          className="relative w-full"
        >
          <section className="mb-10 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  <FaHeadset /> Customer Support
                </p>
                <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Contact SalonHub for Booking Help
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                  Need help with salon bookings, account issues, or service questions? Our support team is
                  available to assist quickly and clearly.
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Quick Contact</p>
                <div className="mt-5 space-y-3">
                  <a
                    href="mailto:salonhub.business@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
                  >
                    <FaEnvelope className="text-cyan-200" /> salonhub.business@gmail.com
                  </a>
                  <a
                    href="tel:+918810269376"
                    className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
                  >
                    <FaPhone className="text-amber-200" /> +91-8810269376
                  </a>
                  <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium">
                    <FaClock className="text-emerald-200" /> 24/7 Online Support
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <aside className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
              <h2 className="text-xl font-black">Support Channels</h2>
              <p className="mt-2 text-sm text-slate-300">
                Choose any channel below. We are responsive and happy to help.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    icon: FaEnvelope,
                    title: "Email Support",
                    detail: "salonhub.business@gmail.com",
                    tone: "text-cyan-300",
                  },
                  {
                    icon: FaPhone,
                    title: "Phone Support",
                    detail: "+91-8810269376",
                    tone: "text-amber-300",
                  },
                  {
                    icon: FaMapMarkerAlt,
                    title: "Address",
                    detail: "IIT Mandi, Kamand, Himachal Pradesh",
                    tone: "text-emerald-300",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold">
                        <Icon className={item.tone} /> {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">What you can ask us</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-300" /> Booking and cancellation support
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-300" /> Service or salon partner questions
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-300" /> Partnership and listing inquiries
                  </li>
                </ul>
              </div>
            </aside>

            <article className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl md:p-8">
              <h2 className="text-2xl font-black text-slate-900">Send Us a Message</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill out this form and our team will get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
                      Full Name
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
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
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
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    value={contact.message}
                    onChange={handleInput}
                    required
                    placeholder="Tell us how we can help with your booking, support request, or partnership query."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                  />
                  <p className="mt-1 text-xs text-slate-500">Typical response time: 2-4 hours</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                >
                  <FaPaperPlane />
                  {isSubmitting ? "Sending Your Message..." : "Send Message"}
                </motion.button>
              </form>
            </article>
          </section>

          <section className="mb-10 rounded-3xl border border-cyan-100 bg-white/95 p-8 shadow-lg md:p-10">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">Frequently Asked Questions</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">{faq.question}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-700 to-emerald-600 p-8 text-center text-white shadow-xl md:p-10">
            <h2 className="text-2xl font-black md:text-3xl">Need Immediate Booking Support?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/95 md:text-base">
              Reach us anytime at salonhub.business@gmail.com and our support team will assist you quickly.
            </p>
            <a
              href="mailto:salonhub.business@gmail.com"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5"
            >
              <FaEnvelope className="text-cyan-600" />
              Email Support Team
            </a>
          </section>
        </motion.div>
      </main>
    </>
  );
};
