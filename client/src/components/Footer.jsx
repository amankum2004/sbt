import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

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
                  src="/images/sbt logo md.svg" 
                  alt="Salon Booking Time" 
                  className="h-16 w-16 rounded-full bg-white p-2 shadow-lg"
                />
              </a>
              <h3 className="text-xl font-bold mb-2 text-center md:text-left">Salon Booking Time</h3>
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
                    <i className="fas fa-chevron-right text-xs mr-2"></i> About Us
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <i className="fas fa-chevron-right text-xs mr-2"></i> Services
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <i className="fas fa-chevron-right text-xs mr-2"></i> Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-pink-200 hover:text-white flex items-center transition-colors">
                    <i className="fas fa-chevron-right text-xs mr-2"></i> Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-3 text-pink-300"></i>
                  <span className="text-pink-200">
                    Indian Institute of Technology Mandi,<br />
                    Kamand, Himachal Pradesh-175005
                  </span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone-alt mr-3 text-pink-300"></i>
                  <a href="tel:+918810269376" className="text-pink-200 hover:text-white transition-colors">
                    +91 8810269376
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-pink-300"></i>
                  <a href="mailto:sbthelp123@gmail.com" className="text-pink-200 hover:text-white transition-colors">
                    sbthelp123@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-pink-600">Newsletter</h3>
              <p className="text-pink-200 mb-4">
                Subscribe to get updates on special offers
              </p>
              {/* <div className="flex mb-4">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 w-full rounded-l-lg focus:outline-none text-gray-800"
                />
                <button className="bg-pink-600 hover:bg-pink-700 px-4 rounded-r-lg transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div> */}
              
              {/* Social Media Icons */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 text-pink-200">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/" target="_blank" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaFacebook size={24} />
                  </a>
                  <a href="https://x.com/" target="_blank" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaTwitter size={24} />
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaInstagram size={24} />
                  </a>
                  <a href="https://www.linkedin.com/" target="_blank" className="bg-pink-700 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <FaLinkedin size={24} />
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
              <i className="far fa-copyright mr-1"></i> {new Date().getFullYear()} Salon Booking Time. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-pink-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-pink-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-pink-200 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


