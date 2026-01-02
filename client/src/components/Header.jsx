import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useLogin } from "./LoginContext";
import {
    UserCircle,
  ClipboardList,
  Scissors,
  LayoutDashboard,
  Calendar,
  BookOpen,
  HeartHandshake,
  Image,
  LogOut,
  LogIn,
} from "lucide-react";

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

  const NavLink = ({ to, label, onClick, icon: Icon, className = "" }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative font-medium group py-2 flex items-center space-x-2 no-underline transition duration-300 ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 text-purple-600" />}
      <span>{label}</span>
      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
    </Link>
  );

  NavLink.propTypes = {
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
    icon: PropTypes.elementType,
  };

  const toggleRightSidebar = () => {
    setIsOpenRight(!isOpenRight);
    setIsOpenLeft(false);
  };

  return (
      <nav className={`fixed w-full transition-all duration-300 bg-black py-2 z-50 shadow ${scrolled ? "shadow-lg" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 relative flex justify-between items-center">
        {/* Hamburger menu */}
        <button
          className="md:hidden text-white z-10"
          onClick={() => {
            setIsOpenLeft(!isOpenLeft);
            setIsOpenRight(false);
          }}
        >
          {isOpenLeft ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
        </button>

        {/* Center logo on mobile if not logged in */}
        <Link
          to="/"
          className={`md:hidden absolute left-1/2 transform -translate-x-1/2 text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}
        >
          SalonHub
        </Link>

        {/* Normal logo on desktop */}
        <Link
          to="/"
          className="hidden md:flex items-center text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
        >
          <img src="/images/salonHub-logo.svg" alt="SalonHub Logo" className="w-10 h-10 mr-2 rounded-full" />
          SalonHub
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden md:flex items-center space-x-8 text-white">
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
              Login
            </Link>
          )}
        </div>

        {/* Login button on right for mobile if not logged in */}
        {!loggedIn && (
          <Link
            to="/login"
            className="md:hidden z-10 text-white font-medium text-sm px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow hover:scale-105 transition-transform duration-300"
          >
            Login
          </Link>
        )}

        {/* User Avatar (mobile) */}
        {loggedIn && (
          <button className="md:hidden z-10" onClick={toggleRightSidebar}>
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
        className={`fixed top-0 left-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenLeft ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/images/salonHub-logo.svg" alt="SalonHub Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold text-purple-600">SalonHub</span>
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
        className={`fixed top-0 right-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenRight ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          {loggedIn && (
            <div className="flex items-center space-x-3">
              <img
                alt="User Avatar"
                src="/images/dp_logo.png"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-purple-600 font-bold">{user.name}</span>
            </div>
          )}
          <XMarkIcon className="h-6 w-6 text-black cursor-pointer" onClick={() => setIsOpenRight(false)} />
        </div>

        <div className="px-6 flex flex-col space-y-4 text-black">
          {loggedIn ? (
            <>
              {user.usertype === "shopOwner" ? (
                <>
                  <NavLink to="/barberprofile" label="Profile" icon={UserCircle} onClick={toggleRightSidebar} />
                  <NavLink to="/barberDashboard" label="Dashboard" icon={LayoutDashboard} onClick={toggleRightSidebar} />
                  <NavLink to="/timeSlot-create" label="Create slots" icon={Calendar} onClick={toggleRightSidebar} />
                  <NavLink to="/customerDashboard" label="My bookings" icon={ClipboardList} onClick={toggleRightSidebar} />
                  <NavLink to="/poster" label="Poster" icon={Image} onClick={toggleRightSidebar} />
                  <NavLink to="/nearbyShops" label="Book appointment" icon={Calendar} onClick={toggleRightSidebar} />
                  {/* <NavLink to="/registershop" label="Register your Salon" icon={Scissors} onClick={toggleRightSidebar} /> */}
                </>
              ) : user.usertype === "admin" ? (
                <>
                  <NavLink to="/customerprofile" label="Profile" icon={UserCircle} onClick={toggleRightSidebar} />
                  <NavLink to="/admin" label="Admin Dashboard" icon={LayoutDashboard} onClick={toggleRightSidebar} />
                  <NavLink to="/registershop" label="Register Salon" icon={Scissors} onClick={toggleRightSidebar} />
                  <NavLink to="/customerDashboard" label="My bookings" icon={ClipboardList} onClick={toggleRightSidebar} />
                  <NavLink to="/poster" label="Poster" icon={Image} onClick={toggleRightSidebar} />
                  <NavLink to="/nearbyShops" label="Book appointment" icon={Calendar} onClick={toggleRightSidebar} />
                </>
              ) : (
                <>
                  <NavLink to="/customerprofile" label="Profile" icon={UserCircle} onClick={toggleRightSidebar} />
                  <NavLink to="/customerDashboard" label="My bookings" icon={ClipboardList} onClick={toggleRightSidebar} />
                  <NavLink to="/nearbyShops" label="Book appointment" icon={Calendar} onClick={toggleRightSidebar} />
                </>
              )}
              <NavLink to="/learning" label="Booking Guide/Help" icon={BookOpen} onClick={toggleRightSidebar} />
              <NavLink to="/donate" label="Donate for Environment" icon={HeartHandshake} onClick={toggleRightSidebar} />
              {/* <NavLink to="/poster" className="sidebar-link">🖼 Poster</NavLink> */}
              <NavLink
                to="/login"
                label="Logout"
                icon={LogOut}
                onClick={() => {
                  logout();
                  toggleRightSidebar();
                }}
              />
            </>
          ) : (
            <>
              <p>Welcome to SalonHub</p>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
                onClick={toggleRightSidebar}
              >
                <LogIn className="w-5 h-5" />
                <span>Login / Signup</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};


// import React, { useState, useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
// import PropTypes from "prop-types";
// import { useLogin } from "./LoginContext";
// import {
//   UserCircle,
//   ClipboardList,
//   Scissors,
//   LayoutDashboard,
//   Calendar,
//   BookOpen,
//   HeartHandshake,
//   LogOut,
//   LogIn,
//   Search,
//   MapPin
// } from "lucide-react";

// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [isOpenLeft, setIsOpenLeft] = useState(false);
//   const [isOpenRight, setIsOpenRight] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const leftDrawerRef = useRef();
//   const rightDrawerRef = useRef();

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         (isOpenLeft && leftDrawerRef.current && !leftDrawerRef.current.contains(e.target)) ||
//         (isOpenRight && rightDrawerRef.current && !rightDrawerRef.current.contains(e.target))
//       ) {
//         setIsOpenLeft(false);
//         setIsOpenRight(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isOpenLeft, isOpenRight]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       // Redirect to search results page or filter nearby shops
//       window.location.href = `/nearbyShops?search=${encodeURIComponent(searchQuery)}`;
//     }
//   };

//   const NavLink = ({ to, label, onClick, icon: Icon, className = "", title = "" }) => (
//     <Link
//       to={to}
//       onClick={onClick}
//       className={`relative font-medium group py-2 flex items-center space-x-2 no-underline transition duration-300 ${className}`}
//       title={title || `Visit ${label} page`}
//     >
//       {Icon && <Icon className="w-5 h-5 text-purple-600" />}
//       <span className="whitespace-nowrap">{label}</span>
//       <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
//     </Link>
//   );

//   NavLink.propTypes = {
//     label: PropTypes.string.isRequired,
//     to: PropTypes.string.isRequired,
//     onClick: PropTypes.func,
//     className: PropTypes.string,
//     icon: PropTypes.elementType,
//     title: PropTypes.string,
//   };

//   const toggleRightSidebar = () => {
//     setIsOpenRight(!isOpenRight);
//     setIsOpenLeft(false);
//   };

//   // Popular cities for quick location access
//   const popularCities = [
//     { name: "Delhi", url: "/salons-in-delhi" },
//     { name: "Mumbai", url: "/salons-in-mumbai" },
//     { name: "Bangalore", url: "/salons-in-bangalore" },
//     { name: "Chennai", url: "/salons-in-chennai" },
//     { name: "Kolkata", url: "/salons-in-kolkata" },
//     { name: "Hyderabad", url: "/salons-in-hyderabad" }
//   ];

//   return (
//     <>
//       {/* Top Bar with SEO-rich content */}
//       <div className="bg-purple-800 text-white py-2 px-4 text-sm hidden md:block">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-6">
//             <span className="flex items-center">
//               <MapPin className="w-4 h-4 mr-1" />
//               <strong>Service Areas:</strong>
//               <div className="ml-2 flex space-x-3">
//                 {popularCities.slice(0, 3).map((city, index) => (
//                   <a 
//                     key={index}
//                     href={city.url}
//                     className="hover:text-purple-200 transition-colors"
//                     title={`Find salons in ${city.name}`}
//                   >
//                     {city.name}
//                   </a>
//                 ))}
//                 <a 
//                   href="/all-cities" 
//                   className="text-purple-200 hover:text-white font-semibold"
//                   title="View all service cities"
//                 >
//                   +40 Cities
//                 </a>
//               </div>
//             </span>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span>🎯 5000+ Happy Customers</span>
//             <span>⭐ 4.8/5 Rating</span>
//             <span>🔒 Secure Booking</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Navigation */}
//       <nav className={`fixed w-full transition-all duration-300 bg-black py-2 z-50 shadow ${scrolled ? "shadow-lg" : ""}`}>
//         <div className="max-w-7xl mx-auto px-4 lg:px-10 relative flex justify-between items-center">
//           {/* Hamburger menu */}
//           <button
//             className="md:hidden text-white z-10"
//             onClick={() => {
//               setIsOpenLeft(!isOpenLeft);
//               setIsOpenRight(false);
//             }}
//             aria-label="Toggle navigation menu"
//             title="Open main menu"
//           >
//             {isOpenLeft ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
//           </button>

//           {/* Center logo on mobile if not logged in */}
//           <Link
//             to="/"
//             className={`md:hidden absolute left-1/2 transform -translate-x-1/2 text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300`}
//             title="SalonHub - Home: Online Salon Booking Platform"
//           >
//             SalonHub
//           </Link>

//           {/* Normal logo on desktop */}
//           <Link
//             to="/"
//             className="hidden md:flex items-center text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
//             title="SalonHub - India's Leading Online Salon Booking Platform"
//           >
//             <img 
//               src="/images/salonHub-logo.svg" 
//               alt="SalonHub Logo - Book Salon Appointments Online for Haircuts, Facials, and Beauty Services" 
//               className="w-10 h-10 mr-2 rounded-full" 
//             />
//             SalonHub
//           </Link>

//           {/* Search Bar - New Addition for SEO */}
//           <div className="hidden lg:block flex-1 max-w-md mx-8">
//             <form onSubmit={handleSearch} className="relative">
//               <input
//                 type="text"
//                 placeholder="Search for haircut, facial, salon services..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
//                 aria-label="Search salon services"
//               />
//               <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//               <button 
//                 type="submit"
//                 className="absolute right-2 top-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
//                 title="Search salon services"
//               >
//                 Search
//               </button>
//             </form>
//           </div>

//           {/* Desktop navigation links */}
//           <div className="hidden md:flex items-center space-x-8 text-white">
//             <NavLink 
//               to="/" 
//               label="Home" 
//               title="SalonHub Home - Online Beauty Service Booking"
//             />
//             <NavLink 
//               to="/about" 
//               label="About" 
//               title="About SalonHub - Our Story & Mission"
//             />
//             <NavLink 
//               to="/services" 
//               label="Services" 
//               title="Beauty Services - Haircut, Facial, Spa & More"
//             />
//             <NavLink 
//               to="/nearbyShops" 
//               label="Book Now" 
//               title="Book Salon Appointment - Find Nearby Salons"
//             />
//             <NavLink 
//               to="/contact" 
//               label="Contact" 
//               title="Contact SalonHub - Customer Support"
//             />
//             {loggedIn ? (
//               <button
//                 onClick={toggleRightSidebar}
//                 className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
//                 title="Open user menu"
//                 aria-label="User account menu"
//               >
//                 <img
//                   alt={`${user.name}'s profile picture`}
//                   src="/images/dp_logo.png"
//                   width="40"
//                   height="40"
//                   className="rounded-full border-2 border-purple-500"
//                 />
//                 <span className="text-sm text-gray-300 hidden lg:block">Welcome, {user.name}</span>
//               </button>
//             ) : (
//               <Link
//                 to="/login"
//                 className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 whitespace-nowrap"
//                 title="Login to SalonHub Account"
//               >
//                 Login / Signup
//               </Link>
//             )}
//           </div>

//           {/* Login button on right for mobile if not logged in */}
//           {!loggedIn && (
//             <Link
//               to="/login"
//               className="md:hidden z-10 text-white font-medium text-sm px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow hover:scale-105 transition-transform duration-300"
//               title="Mobile login button"
//             >
//               Login
//             </Link>
//           )}

//           {/* User Avatar (mobile) */}
//           {loggedIn && (
//             <button 
//               className="md:hidden z-10" 
//               onClick={toggleRightSidebar}
//               aria-label="Open user menu"
//               title="User account"
//             >
//               <img
//                 alt={`${user.name}'s profile picture`}
//                 src="/images/dp_logo.png"
//                 width="40"
//                 height="40"
//                 className="rounded-full border-2 border-purple-500"
//               />
//             </button>
//           )}
//         </div>
//       </nav>

//       {/* Mobile Search Bar */}
//       <div className="lg:hidden bg-gray-900 p-3 fixed top-16 w-full z-40 border-b border-gray-700">
//         <form onSubmit={handleSearch} className="relative">
//           <input
//             type="text"
//             placeholder="Search salon services, haircut, facial..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
//             aria-label="Search salon services"
//           />
//           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//         </form>
//       </div>

//       {/* Left Drawer - Enhanced for SEO */}
//       <div
//         ref={leftDrawerRef}
//         className={`fixed top-0 left-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenLeft ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="p-4 flex justify-between items-center border-b border-gray-200">
//           <div className="flex items-center space-x-2">
//             <img 
//               src="/images/salonHub-logo.svg" 
//               alt="SalonHub - Beauty Salon Booking Platform" 
//               className="w-8 h-8" 
//             />
//             <span className="text-xl font-semibold text-purple-600">SalonHub</span>
//           </div>
//           <XMarkIcon 
//             className="h-6 w-6 text-black cursor-pointer" 
//             onClick={() => setIsOpenLeft(false)}
//             aria-label="Close menu"
//           />
//         </div>
        
//         {/* Quick Cities Access */}
//         <div className="px-6 py-4 border-b border-gray-100">
//           <h3 className="text-sm font-semibold text-gray-700 mb-2">Popular Cities</h3>
//           <div className="grid grid-cols-2 gap-2">
//             {popularCities.map((city, index) => (
//               <a
//                 key={index}
//                 href={city.url}
//                 className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
//                 onClick={() => setIsOpenLeft(false)}
//                 title={`Salons in ${city.name}`}
//               >
//                 {city.name}
//               </a>
//             ))}
//           </div>
//         </div>

//         <div className="px-6 py-4 flex flex-col space-y-4 text-black">
//           <NavLink 
//             to="/" 
//             label="Home" 
//             onClick={() => setIsOpenLeft(false)}
//             title="SalonHub Homepage"
//           />
//           <NavLink 
//             to="/about" 
//             label="About Us" 
//             onClick={() => setIsOpenLeft(false)}
//             title="About SalonHub Platform"
//           />
//           <NavLink 
//             to="/services" 
//             label="Beauty Services" 
//             onClick={() => setIsOpenLeft(false)}
//             title="Hair & Beauty Services"
//           />
//           <NavLink 
//             to="/nearbyShops" 
//             label="Book Appointment" 
//             onClick={() => setIsOpenLeft(false)}
//             title="Book Salon Appointment"
//           />
//           <NavLink 
//             to="/contact" 
//             label="Contact Support" 
//             onClick={() => setIsOpenLeft(false)}
//             title="Contact SalonHub Team"
//           />
//         </div>
//       </div>

//       {/* Right Drawer - Enhanced for SEO */}
//       <div
//         ref={rightDrawerRef}
//         className={`fixed top-0 right-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isOpenRight ? "translate-x-0" : "translate-x-full"}`}
//       >
//         <div className="p-4 flex items-center justify-between border-b border-gray-200">
//           {loggedIn && (
//             <div className="flex items-center space-x-3">
//               <img
//                 alt={`${user.name}'s profile picture`}
//                 src="/images/dp_logo.png"
//                 className="w-10 h-10 rounded-full"
//               />
//               <div>
//                 <span className="text-purple-600 font-bold block">{user.name}</span>
//                 <span className="text-gray-500 text-xs block capitalize">{user.usertype}</span>
//               </div>
//             </div>
//           )}
//           <XMarkIcon 
//             className="h-6 w-6 text-black cursor-pointer" 
//             onClick={() => setIsOpenRight(false)}
//             aria-label="Close user menu"
//           />
//         </div>

//         <div className="px-6 py-4 flex flex-col space-y-4 text-black">
//           {loggedIn ? (
//             <>
//               {user.usertype === "shopOwner" ? (
//                 <>
//                   <NavLink 
//                     to="/barberprofile" 
//                     label="Salon Profile" 
//                     icon={UserCircle} 
//                     onClick={toggleRightSidebar}
//                     title="Manage salon profile"
//                   />
//                   <NavLink 
//                     to="/barberDashboard" 
//                     label="Salon Dashboard" 
//                     icon={LayoutDashboard} 
//                     onClick={toggleRightSidebar}
//                     title="Salon owner dashboard"
//                   />
//                   <NavLink 
//                     to="/timeSlot-create" 
//                     label="Create Time Slots" 
//                     icon={Calendar} 
//                     onClick={toggleRightSidebar}
//                     title="Create booking slots"
//                   />
//                   <NavLink 
//                     to="/customerDashboard" 
//                     label="Booking Management" 
//                     icon={ClipboardList} 
//                     onClick={toggleRightSidebar}
//                     title="Manage customer bookings"
//                   />
//                 </>
//               ) : user.usertype === "admin" ? (
//                 <>
//                   <NavLink 
//                     to="/customerprofile" 
//                     label="Admin Profile" 
//                     icon={UserCircle} 
//                     onClick={toggleRightSidebar}
//                     title="Admin profile settings"
//                   />
//                   <NavLink 
//                     to="/admin" 
//                     label="Admin Dashboard" 
//                     icon={LayoutDashboard} 
//                     onClick={toggleRightSidebar}
//                     title="Administration panel"
//                   />
//                   <NavLink 
//                     to="/registershop" 
//                     label="Register New Salon" 
//                     icon={Scissors} 
//                     onClick={toggleRightSidebar}
//                     title="Register salon partner"
//                   />
//                 </>
//               ) : (
//                 <>
//                   <NavLink 
//                     to="/customerprofile" 
//                     label="My Profile" 
//                     icon={UserCircle} 
//                     onClick={toggleRightSidebar}
//                     title="Customer profile settings"
//                   />
//                   <NavLink 
//                     to="/customerDashboard" 
//                     label="My Bookings" 
//                     icon={ClipboardList} 
//                     onClick={toggleRightSidebar}
//                     title="View my appointments"
//                   />
//                   <NavLink 
//                     to="/nearbyShops" 
//                     label="Book New Appointment" 
//                     icon={Calendar} 
//                     onClick={toggleRightSidebar}
//                     title="Book salon service"
//                   />
//                 </>
//               )}
//               <NavLink 
//                 to="/learning" 
//                 label="Booking Guide & Help" 
//                 icon={BookOpen} 
//                 onClick={toggleRightSidebar}
//                 title="How to use SalonHub"
//               />
//               <NavLink 
//                 to="/donate" 
//                 label="Environmental Donation" 
//                 icon={HeartHandshake} 
//                 onClick={toggleRightSidebar}
//                 title="Support environment"
//               />
//               <NavLink
//                 to="/login"
//                 label="Logout"
//                 icon={LogOut}
//                 onClick={() => {
//                   logout();
//                   toggleRightSidebar();
//                 }}
//                 title="Sign out of account"
//               />
//             </>
//           ) : (
//             <>
//               <div className="text-center py-4">
//                 <p className="text-gray-600 mb-4">Welcome to SalonHub</p>
//                 <Link
//                   to="/login"
//                   className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center space-x-2 justify-center"
//                   onClick={toggleRightSidebar}
//                   title="Login or create account"
//                 >
//                   <LogIn className="w-5 h-5" />
//                   <span>Login / Signup</span>
//                 </Link>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };