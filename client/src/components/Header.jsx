import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  HeartHandshake,
  House,
  Image,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  PhoneCall,
  Scissors,
  UserCircle,
} from "lucide-react";
import { useLogin } from "./LoginContext";

export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const leftDrawerRef = useRef(null);
  const rightDrawerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideLeft =
        isOpenLeft && leftDrawerRef.current && !leftDrawerRef.current.contains(event.target);
      const clickedOutsideRight =
        isOpenRight && rightDrawerRef.current && !rightDrawerRef.current.contains(event.target);

      if (clickedOutsideLeft || clickedOutsideRight) {
        setIsOpenLeft(false);
        setIsOpenRight(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenLeft, isOpenRight]);

  useEffect(() => {
    if (isOpenLeft || isOpenRight) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenLeft, isOpenRight]);

  const closeAll = () => {
    setIsOpenLeft(false);
    setIsOpenRight(false);
  };

  const toggleRightSidebar = () => {
    setIsOpenRight((prev) => !prev);
    setIsOpenLeft(false);
  };

  const NavLink = ({ to, label, onClick, icon: Icon, className = "" }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-medium no-underline transition ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 text-amber-300" /> : null}
      <span>{label}</span>
      <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-300 to-amber-300 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );

  NavLink.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    icon: PropTypes.elementType,
    className: PropTypes.string,
  };

  const normalizedUserType = (user?.usertype || "").toLowerCase();

  const userMenuItems =
    normalizedUserType === "shopowner"
      ? [
          { to: "/barberprofile", label: "Profile", icon: UserCircle },
          { to: "/barberDashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/analytics-dashboard", label: "Analytics", icon: BarChart3 },
          { to: "/timeSlot-create", label: "Create Slots", icon: Calendar },
          // { to: "/poster", label: "Poster", icon: Image },
          { to: "/nearbyShops", label: "Book Appointment", icon: Calendar },
          { to: "/customerDashboard", label: "My Bookings", icon: ClipboardList },
        ]
      : normalizedUserType === "admin"
        ? [
            { to: "/customerprofile", label: "Profile", icon: UserCircle },
            { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
            { to: "/registershop", label: "Register Salon", icon: Scissors },
            // { to: "/poster", label: "Poster", icon: Image },
            { to: "/customerDashboard", label: "My Bookings", icon: ClipboardList },
            { to: "/nearbyShops", label: "Book Appointment", icon: Calendar },
          ]
        : [
            { to: "/customerprofile", label: "Profile", icon: UserCircle },
            { to: "/customerDashboard", label: "My Bookings", icon: ClipboardList },
            { to: "/nearbyShops", label: "Book Appointment", icon: Calendar },
          ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur transition-all duration-300 ${
          scrolled ? "shadow-[0_10px_30px_-14px_rgba(15,23,42,0.9)]" : ""
        }`}
      >
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
            onClick={() => {
              setIsOpenLeft((prev) => !prev);
              setIsOpenRight(false);
            }}
            aria-label="Open navigation menu"
          >
            {isOpenLeft ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 bg-clip-text text-2xl font-black text-transparent md:hidden"
          >
            SalonHub
          </Link>

          <Link to="/" className="hidden items-center gap-3 md:flex">
            <img
              src="/images/salonHub-logo.svg"
              alt="SalonHub Logo"
              className="h-10 w-10 rounded-full border border-white/30 bg-white/90 p-1"
            />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 bg-clip-text text-2xl font-black text-transparent">
              SalonHub
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <NavLink to="/" label="Home" className="text-slate-200 hover:text-white" />
            <NavLink to="/about" label="About" className="text-slate-200 hover:text-white" />
            <NavLink to="/services" label="Services" className="text-slate-200 hover:text-white" />
            <NavLink to="/contact" label="Contact" className="text-slate-200 hover:text-white" />

            {loggedIn ? (
              <button
                type="button"
                onClick={toggleRightSidebar}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-slate-100 transition hover:bg-cyan-300/20"
                aria-label="Open user menu"
              >
                <img
                  alt="User Avatar"
                  src="/images/dp_logo.png"
                  className="h-9 w-9 rounded-full border border-white/20"
                />
                <span className="pr-2 text-sm font-medium">{user?.name || "Account"}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-amber-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:brightness-110"
              >
                Login
              </Link>
            )}
          </div>

          {!loggedIn ? (
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:brightness-110 md:hidden"
            >
              Login
            </Link>
          ) : (
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-cyan-300/10 md:hidden"
              onClick={toggleRightSidebar}
              aria-label="Open user menu"
            >
              <img alt="User Avatar" src="/images/dp_logo.png" className="h-8 w-8 rounded-full" />
            </button>
          )}
        </div>
      </nav>

      {(isOpenLeft || isOpenRight) && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[1px]"
          onClick={closeAll}
        />
      )}

      <aside
        ref={leftDrawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ${
          isOpenLeft ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link to="/" className="flex items-center gap-2" onClick={closeAll}>
            <img src="/images/salonHub-logo.svg" alt="SalonHub" className="h-9 w-9 rounded-full bg-white" />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 bg-clip-text text-2xl font-black text-transparent">
              SalonHub
            </span>
          </Link>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
            onClick={closeAll}
            aria-label="Close mobile menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1 p-4">
          <NavLink
            to="/"
            label="Home"
            icon={House}
            onClick={closeAll}
            className="w-full text-slate-200 hover:text-white"
          />
          <NavLink
            to="/about"
            label="About"
            icon={Info}
            onClick={closeAll}
            className="w-full text-slate-200 hover:text-white"
          />
          <NavLink
            to="/services"
            label="Services"
            icon={Scissors}
            onClick={closeAll}
            className="w-full text-slate-200 hover:text-white"
          />
          <NavLink
            to="/contact"
            label="Contact"
            icon={PhoneCall}
            onClick={closeAll}
            className="w-full text-slate-200 hover:text-white"
          />
        </div>
      </aside>

      <aside
        ref={rightDrawerRef}
        className={`fixed inset-y-0 right-0 z-50 w-80 border-l border-white/10 bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ${
          isOpenRight ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          {loggedIn ? (
            <div className="flex items-center gap-3">
              <img alt="User Avatar" src="/images/dp_logo.png" className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Signed In</p>
                <p className="text-md font-bold text-white">{user?.name || "SalonHub User"}</p>
              </div>
            </div>
          ) : (
            <p className="font-semibold text-white">Welcome to SalonHub</p>
          )}

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
            onClick={closeAll}
            aria-label="Close user menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto p-4">
          {loggedIn ? (
            <>
              {userMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  onClick={closeAll}
                  className="w-full text-slate-200 hover:text-white"
                />
              ))}

              <NavLink
                to="/poster"
                label="Poster/Media"
                icon={Image}
                onClick={closeAll}
                className="w-full text-slate-200 hover:text-white"
              />
              <NavLink
                to="/learning"
                label="Booking Guide/Helper"
                icon={BookOpen}
                onClick={closeAll}
                className="w-full text-slate-200 hover:text-white"
              />
              <NavLink
                to="/donate"
                label="Donate for Environment"
                icon={HeartHandshake}
                onClick={closeAll}
                className="w-full text-slate-200 hover:text-white"
              />
              <NavLink
                to="/login"
                label="Logout"
                icon={LogOut}
                className="w-full text-rose-300 hover:text-rose-200"
                onClick={() => {
                  logout();
                  closeAll();
                }}
              />
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 px-4 py-3 text-sm font-bold text-slate-950"
            >
              <LogIn className="h-4 w-4" />
              Login / Signup
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
