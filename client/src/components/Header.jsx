// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
// import PropTypes from "prop-types";
// import { useLogin } from "./LoginContext";

// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   Header.propTypes = {
//     label: PropTypes.string.isRequired,
//     to: PropTypes.string.isRequired,
//     onClick: PropTypes.string.isRequired,
//     className: PropTypes.string.isRequired,
//   };

//   const NavLink = ({ to, label, onClick, className = "" }) => (
//   <Link
//     to={to}
//     onClick={onClick}
//     className={`relative font-medium group py-2 no-underline transition duration-300 ${className}`}
//   >
//     {label}
//     <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
//   </Link>
//   );


//   return (
//     <nav className={` w-full transition-all duration-300 bg-black py-2 z-50 shadow ${scrolled ? "shadow-lg" : ""}`}>
//       <div className="max-w-7xl mx-auto px-6 lg:px-10">
//         <div className="flex justify-between items-center">
//           <Link
//             to="/"
//             className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
//           >
//             Salonify
//           </Link>

//           <div className="hidden md:flex items-center space-x-8">
//             <NavLink to="/" label="Home" />
//             <NavLink to="/about" label="About" />
//             <NavLink to="/services" label="Services" />
//             <NavLink to="/contact" label="Contact" />

//             {loggedIn ? (
//               <img
//                 alt="img"
//                 className="hidden md:block rounded-full"
//                 src="/images/dp_logo.png"
//                 width="50"
//                 height="50"
//               />
//             ) : (
//               <ul className="nav-item login-item items-center my-2">
//                 <Link
//                   to="/login"
//                   className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-1 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Login / Signup
//                 </Link>
//               </ul>
//             )}

//             <button
//               className="text-gray-300 hover:text-purple-400 transition-colors duration-300"
//               onClick={() => setSideDrawerOpen(!sideDrawerOpen)}
//               aria-label={sideDrawerOpen ? "Close menu" : "Open menu"}
//             >
//               {sideDrawerOpen ? (
//                 <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
//               ) : (
//                 <Bars3Icon className="h-7 w-7 transition-transform duration-300" />
//               )}
//             </button>
//           </div>

//           <button
//             className="md:hidden text-gray-300 hover:text-purple-400 transition-colors duration-300"
//             onClick={() => setIsOpen(!isOpen)}
//             aria-label={isOpen ? "Close menu" : "Open menu"}
//           >
//             {isOpen ? (
//               <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
//             ) : (
//               <Bars3Icon className="h-7 w-7 transition-transform duration-300 hover:rotate-180" />
//             )}
//           </button>
//         </div>

//         <div
//           className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
//             isOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"
//           }`}
//         >
//           <div className="flex flex-col items-center space-y-5 py-4 text-white">
//             <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
//             <NavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
//             <NavLink to="/services" label="Services" onClick={() => setIsOpen(false)} />
//             <NavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />

//             {loggedIn ? (
//               <img
//                 alt="img"
//                 className="hidden md:block"
//                 src="/images/dp_logo.png"
//                 width="50"
//                 height="50"
//               />
//             ) : (
//               <ul className="nav-item login-item">
//                 <Link
//                   to="/login"
//                   className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Login / Signup
//                 </Link>
//               </ul>
//             )}
//           </div>
//         </div>

//         <div
//           className={`absolute top-[67px] right-0 w-64 h-full transform transition-transform duration-300 ease-in-out z-40 ${
//             sideDrawerOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <div className="bg-white min-h-screen flex flex-col items-center space-y-5 py-4 text-black">
//             {loggedIn ? (
//               <>
//                 <span className="text-purple-600 italic text-lg font-bold mx-1">
//                   {user.name}
//                 </span>
//                 {user.userType === "shopOwner" ? (
//                   <>
//                     <NavLink to="/barberprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
//                     <NavLink to="/registershop" label="Register your Salon" onClick={() => setSideDrawerOpen(false)} />
//                   </>
//                 ) : user.userType === "admin" ? (
//                   <>
//                     <NavLink to="/customerprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
//                     <NavLink to="/admin" label="Admin Dashboard" onClick={() => setSideDrawerOpen(false)} />
//                     <NavLink to="/registershop" label="Register Salon" onClick={() => setSideDrawerOpen(false)} />
//                   </>
//                 ) : (
//                   <>
//                     <NavLink to="/customerprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
//                     <NavLink to="/nearbyShops" label="Book Appointment" onClick={() => setSideDrawerOpen(false)} />
//                   </>
//                 )}
//               </>
//             ) : (
//               "Welcome to Salonify"
//             )}

//             <NavLink to="/learning" label="📘 Learning" className="text-black hover:text-black" onClick={() => setSideDrawerOpen(false)} />
//             <NavLink to="/donate" label="🌱 Donate for Environment" className="text-black hover:text-black" onClick={() => setSideDrawerOpen(false)} />

//             {loggedIn ? (
//               <NavLink to="/login" label="LogOut" onClick={logout} />
//             ) : (
//               <ul className="nav-item login-item">
//                 <Link
//                   to="/login"
//                   className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Login / Signup
//                 </Link>
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };




import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useLogin } from "./LoginContext";

export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          {isOpenLeft ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>

        {/* Brand Name */}
        <Link
          to="/"
          className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
        >
          Salonify
        </Link>

        {/* Right Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => {
            setIsOpenRight(!isOpenRight);
            setIsOpenLeft(false);
          }}
        >
          {isOpenRight ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          <NavLink to="/about" label="About" />
          <NavLink to="/services" label="Services" />
          <NavLink to="/contact" label="Contact" />

          {loggedIn ? (
            <img alt="img" className="rounded-full" src="/images/dp_logo.png" width="50" height="50" />
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-1 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>

      {/* Left Drawer */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpenLeft ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col space-y-4 text-black">
          <NavLink to="/about" label="About" onClick={() => setIsOpenLeft(false)} />
          <NavLink to="/services" label="Services" onClick={() => setIsOpenLeft(false)} />
          <NavLink to="/contact" label="Contact" onClick={() => setIsOpenLeft(false)} />
        </div>
      </div>

      {/* Right Drawer */}
      <div
        className={`fixed top-0 right-0 w-64 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpenRight ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col space-y-4 text-black">
          {loggedIn ? (
            <>
              <span className="text-purple-600 italic text-lg font-bold">{user.name}</span>
              {user.userType === "shopOwner" ? (
                <>
                  <NavLink to="/barberprofile" label="Profile" onClick={() => setIsOpenRight(false)} />
                  <NavLink to="/registershop" label="Register your Salon" onClick={() => setIsOpenRight(false)} />
                </>
              ) : user.userType === "admin" ? (
                <>
                  <NavLink to="/admin" label="Admin Dashboard" onClick={() => setIsOpenRight(false)} />
                </>
              ) : (
                <>
                  <NavLink to="/customerprofile" label="Profile" onClick={() => setIsOpenRight(false)} />
                  <NavLink to="/nearbyShops" label="Book Appointment" onClick={() => setIsOpenRight(false)} />
                </>
              )}
              <NavLink to="/learning" label="📘 Learning" onClick={() => setIsOpenRight(false)} />
              <NavLink to="/donate" label="🌱 Donate for Environment" onClick={() => setIsOpenRight(false)} />
              <NavLink to="/login" label="Logout" onClick={logout} />
            </>
          ) : (
            <>
              <p>Welcome to Salonify</p>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
                onClick={() => setIsOpenRight(false)}
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
