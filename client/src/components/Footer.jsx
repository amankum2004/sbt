import React from "react";
import { Link } from "react-router-dom";
import {
  FaChevronRight,
  FaCopyright,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaStar,
  FaTwitter,
} from "react-icons/fa";

export const Footer = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "SalonHub - Online Salon Booking Platform",
    description:
      "Book salon appointments online for haircuts, facials, spa, and beauty services across India. Best salon booking platform with verified professionals.",
    url: "https://salonhub.co.in",
    telephone: "+91-8810269376",
    email: "salonhub.business@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Indian Institute of Technology Mandi",
      addressLocality: "Kamand",
      addressRegion: "Himachal Pradesh",
      postalCode: "175005",
      addressCountry: "IN",
    },
    areaServed: "India",
    serviceType: "Salon Booking, Beauty Services, Online Appointments",
    sameAs: [
      "https://www.facebook.com/salonhub",
      "https://www.instagram.com/salonhub",
      "https://twitter.com/salonhub",
      "https://www.linkedin.com/company/salonhub",
    ],
  };

  const serviceLinks = [
    { name: "Haircut & Styling", url: "/services#hair" },
    { name: "Facial & Skin Care", url: "/services#facial" },
    { name: "Hair Coloring", url: "/services#coloring" },
    { name: "Beard Grooming", url: "/services#beard" },
    { name: "Waxing Services", url: "/services#waxing" },
    { name: "Bridal Makeup", url: "/services#bridal" },
  ];

  const quickLinks = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: "Services", url: "/services" },
    { name: "Contact", url: "/contact" },
    { name: "Booking Guide", url: "/learning" },
    { name: "Donate", url: "/donate" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", url: "/privacy-policy" },
    { name: "Terms of Service", url: "/terms-of-service" },
    { name: "Cancellation Policy", url: "/cancellation-policy" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <footer className="relative overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative w-full px-4 pb-12 pt-12 sm:px-6 lg:px-8">
          <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: FaStar, title: "4.8/5 Rating", subtitle: "Trusted by customers" },
              { icon: FaShieldAlt, title: "Secure Payments", subtitle: "Encrypted checkout" },
              { icon: FaMapMarkerAlt, title: "50+ Cities", subtitle: "Expanding across India" },
              { icon: FaChevronRight, title: "Fast Booking", subtitle: "In just a few clicks" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <item.icon className="mb-2 text-amber-300" />
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-slate-300">{item.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="mb-4 inline-flex items-center gap-3">
                <img
                  src="/images/salonHub-logo.svg"
                  alt="SalonHub"
                  className="h-14 w-14 rounded-full border border-white/20 bg-white p-1"
                />
                <div>
                  <p className="bg-gradient-to-r from-cyan-300 via-amber-300 to-orange-300 bg-clip-text text-2xl font-black text-transparent">
                    SalonHub
                  </p>
                  <p className="text-xs text-slate-300">India's trusted booking platform</p>
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-slate-300">
                Book haircuts, facials, spa sessions, and grooming services from verified salons with
                smooth scheduling and instant confirmations.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Salon Booking", "Beauty Services", "Spa Treatments"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Quick Links</h3>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
                    >
                      <FaChevronRight className="text-[10px] text-amber-300" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Popular Services</h3>
              <ul className="mt-4 space-y-2.5">
                {serviceLinks.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
                    >
                      <FaChevronRight className="text-[10px] text-amber-300" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Contact & Social</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-1 text-amber-300" />
                  <span>
                    IIT Mandi, Kamand,
                    <br />
                    Himachal Pradesh, India
                  </span>
                </li>
                <li>
                  <a href="tel:+918810269376" className="inline-flex items-center gap-2 transition hover:text-white">
                    <FaPhoneAlt className="text-amber-300" />
                    +91 8810269376
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:salonhub.business@gmail.com"
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <FaEnvelope className="text-amber-300" />
                    salonhub.business@gmail.com
                  </a>
                </li>
              </ul>

              <div className="mt-5 flex items-center gap-3">
                {[
                  { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61583405962148", name: "Facebook" },
                  { icon: FaTwitter, url: "https://x.com/salonhub_co_in", name: "Twitter" },
                  { icon: FaInstagram, url: "https://www.instagram.com/salonhub_co_in/", name: "Instagram" },
                  { icon: FaLinkedin, url: "https://www.linkedin.com/company/salonhub-co-in/", name: "LinkedIn" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-200 transition hover:border-cyan-300 hover:text-white"
                    aria-label={`Follow SalonHub on ${social.name}`}
                  >
                    <social.icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/95">
          <div className="flex w-full flex-col items-center justify-between gap-3 px-4 py-4 sm:px-6 md:flex-row lg:px-8">
            <p className="text-xs text-slate-400">
              <FaCopyright className="mr-1 inline" />
              {new Date().getFullYear()} SalonHub. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {legalLinks.map((item) => (
                <Link key={item.url} to={item.url} className="text-xs text-slate-400 transition hover:text-slate-100">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
