import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useLogin } from "./LoginContext";

export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const leftDrawerRef = useRef();
  const rightDrawerRef = useRef();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside of sidebars
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (isOpenLeft && leftDrawerRef.current && !leftDrawerRef.current.contains(e.target)) ||
        (isOpenRight && rightDrawerRef.current && !rightDrawerRef.current.contains(e.target))
      ) {
        setIsOpenLeft(false);
        setIsOpenRight(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenLeft, isOpenRight]);

  const NavLink = ({ to, label, onClick, className = "" }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative font-medium group py-2 no-underline transition duration-300 ${className}`}
    >
      {label}
      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
    </Link>
  );

  NavLink.propTypes = {
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
  };

  const toggleRightSidebar = () => {
    setIsOpenRight(!isOpenRight);
    setIsOpenLeft(false);
  };

  return (
    <nav className={`w-full transition-all duration-300 bg-black py-2 z-50 shadow ${scrolled ? "shadow-lg" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">

        {/* Left Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => {
            setIsOpenLeft(!isOpenLeft);
            setIsOpenRight(false);
          }}
        >
          {isOpenLeft ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
        </button>

        {/* Brand (with logo in desktop mode) */}
        <Link
          to="/"
          className="hidden md:flex items-center text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
        >
          <img src="/images/sbt logo.svg" alt="Salonify Logo" className="w-10 h-10 mr-2" /> {/* ✅ CHANGED */}
          Salonify
        </Link>

        {/* Brand (for mobile center text) */}
        <Link
          to="/"
          className="md:hidden text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
        >
          Salonify
        </Link>


        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          <NavLink to="/about" label="About" />
          <NavLink to="/services" label="Services" />
          <NavLink to="/contact" label="Contact" />

          {loggedIn ? (
            <img
              alt="User Avatar"
              src="/images/dp_logo.png"
              width="50"
              height="50"
              className="rounded-full cursor-pointer"
              onClick={toggleRightSidebar}
            />
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-1 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Login / Signup
            </Link>
          )}
        </div>

        {/* Mobile Avatar Button */}
        {loggedIn && (
          <button className="md:hidden" onClick={toggleRightSidebar}>
            <img
              alt="User Avatar"
              src="/images/dp_logo.png"
              width="40"
              height="40"
              className="rounded-full"
            />
          </button>
        )}
      </div>

      {/* Left Drawer */}
      <div
        ref={leftDrawerRef}
        className={`fixed top-0 left-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenLeft ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-4 flex justify-between items-center"> {/* ✅ CHANGED */}
          <div className="flex items-center space-x-2">
            <img src="/images/sbt logo.svg" alt="Salonify Logo" className="w-8 h-8" /> {/* ✅ NEW */}
            <span className="text-xl font-semibold text-purple-600">Salonify</span> {/* ✅ NEW */}
          </div>
          <XMarkIcon className="h-6 w-6 text-black cursor-pointer" onClick={() => setIsOpenLeft(false)} />
        </div>
        <div className="px-6 flex flex-col space-y-4 text-black">
          <NavLink to="/about" label="About" onClick={() => setIsOpenLeft(false)} />
          <NavLink to="/services" label="Services" onClick={() => setIsOpenLeft(false)} />
          <NavLink to="/contact" label="Contact" onClick={() => setIsOpenLeft(false)} />
        </div>
      </div>

      {/* Right Drawer */}
      <div
        ref={rightDrawerRef}
        className={`fixed top-0 right-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenRight ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {loggedIn && (
            <div className="flex items-center space-x-3">
              <img
                alt="User Avatar"
                src="/images/dp_logo.png"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-purple-600 font-semibold">{user.name}</span>
            </div>
          )}
          <XMarkIcon
            className="h-6 w-6 text-black cursor-pointer"
            onClick={() => setIsOpenRight(false)}
          />
        </div>
        <div className="px-6 flex flex-col space-y-4 text-black">
          {loggedIn ? (
            <>
              {/* Remove duplicate name display from here */}
              {user.userType === "shopOwner" ? (
                <>
                  <NavLink to="/barberprofile" label="Profile" onClick={toggleRightSidebar} />
                  <NavLink to="/registershop" label="Register your Salon" onClick={toggleRightSidebar} />
                </>
              ) : user.userType === "admin" ? (
                <NavLink to="/admin" label="Admin Dashboard" onClick={toggleRightSidebar} />
              ) : (
                <>
                  <NavLink to="/customerprofile" label="Profile" onClick={toggleRightSidebar} />
                  <NavLink to="/nearbyShops" label="Book Appointment" onClick={toggleRightSidebar} />
                </>
              )}
              <NavLink to="/learning" label="📘 Guide" onClick={toggleRightSidebar} />
              <NavLink to="/donate" label="🌱 Donate for Environment" onClick={toggleRightSidebar} />
              <NavLink
                to="/login"
                label="Logout"
                onClick={() => {
                  logout();
                  toggleRightSidebar();
                }}
              />
            </>
          ) : (
            <>
              <p>Welcome to Salonify</p>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
                onClick={toggleRightSidebar}
              >
                Login / Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};



