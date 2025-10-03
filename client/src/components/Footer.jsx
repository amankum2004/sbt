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
  FaCopyright
} from "react-icons/fa";

export const Footer = () => {
  return (
    <div className="w-full">
      {/* Main Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-pink-800 text-white pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and Description */}
            <div className="flex flex-col items-center md:items-start">
              <a href="/" className="mb-4">
                <img 
                  src="/images/salonHub-logo.svg" 
                  alt="Salon Booking Time" 
                  className="h-16 w-16 rounded-full bg-white shadow-lg"
                />
              </a>
              <h3 className="text-xl font-bold mb-2 text-center md:text-left">Book Your Beauty</h3>
              <p className="text-pink-200 text-sm text-center md:text-left">
                Your one-stop solution for all salon booking needs
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <FaChevronRight className="text-xs mr-2" /> About Us
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <FaChevronRight className="text-xs mr-2" /> Services
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <FaChevronRight className="text-xs mr-2" /> Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <FaChevronRight className="text-xs mr-2" /> Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-pink-300" />
                  <span className="text-pink-200">
                    Indian Institute of Technology Mandi,<br />
                    Kamand, Himachal Pradesh-175005
                  </span>
                </li>
                <li className="flex items-center">
                  <FaPhoneAlt className="mr-3 text-pink-300" />
                  <a href="tel:+918810269376" className="text-pink-200 hover:text-white transition-colors">
                    +91 8810269376
                  </a>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-3 text-pink-300" />
                  <a href="mailto:sbthelp123@gmail.com" className="text-pink-200 hover:text-white transition-colors">
                    sbthelp123@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter and Social */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Newsletter</h3>
              <p className="text-pink-200 mb-4">
                Subscribe to get updates on special offers
              </p>
              
              {/* Social Media Icons */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 text-pink-200">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaFacebook size={18} />
                  </a>
                  <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaTwitter size={18} />
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaInstagram size={18} />
                  </a>
                  <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaLinkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Section */}
      <div className="bg-gradient-to-r from-purple-950 to-pink-900 py-4">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-pink-200 text-sm mb-2 md:mb-0">
              <FaCopyright className="inline mr-1" /> {new Date().getFullYear()} Salon Booking Time. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/privacy-policy" className="text-pink-200 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};