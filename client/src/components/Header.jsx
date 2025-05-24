import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useLogin } from "./LoginContext";

export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  Header.propTypes = {
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    onClick: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
  };

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


  return (
    <nav className={` w-full transition-all duration-300 bg-black py-2 z-50 shadow ${scrolled ? "shadow-lg" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
          >
            Salonify
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" label="Home" />
            <NavLink to="/about" label="About" />
            <NavLink to="/services" label="Services" />
            <NavLink to="/contact" label="Contact" />

            {loggedIn ? (
              <img
                alt="img"
                className="hidden md:block rounded-full"
                src="/images/dp_logo.png"
                width="50"
                height="50"
              />
            ) : (
              <ul className="nav-item login-item items-center my-2">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-1 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Signup
                </Link>
              </ul>
            )}

            <button
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300"
              onClick={() => setSideDrawerOpen(!sideDrawerOpen)}
              aria-label={sideDrawerOpen ? "Close menu" : "Open menu"}
            >
              {sideDrawerOpen ? (
                <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
              ) : (
                <Bars3Icon className="h-7 w-7 transition-transform duration-300" />
              )}
            </button>
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-purple-400 transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
            ) : (
              <Bars3Icon className="h-7 w-7 transition-transform duration-300 hover:rotate-180" />
            )}
          </button>
        </div>

        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center space-y-5 py-4 text-white">
            <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
            <NavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
            <NavLink to="/services" label="Services" onClick={() => setIsOpen(false)} />
            <NavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />

            {loggedIn ? (
              <img
                alt="img"
                className="hidden md:block"
                src="/images/dp_logo.png"
                width="50"
                height="50"
              />
            ) : (
              <ul className="nav-item login-item">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Signup
                </Link>
              </ul>
            )}
          </div>
        </div>

        <div
          className={`absolute top-[67px] right-0 w-64 h-full transform transition-transform duration-300 ease-in-out z-40 ${
            sideDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="bg-white min-h-screen flex flex-col items-center space-y-5 py-4 text-black">
            {loggedIn ? (
              <>
                <span className="text-purple-600 italic text-lg font-bold mx-1">
                  {user.name}
                </span>
                {user.userType === "shopOwner" ? (
                  <>
                    <NavLink to="/barberprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/registershop" label="Register your Salon" onClick={() => setSideDrawerOpen(false)} />
                  </>
                ) : user.userType === "admin" ? (
                  <>
                    <NavLink to="/customerprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/admin" label="Admin Dashboard" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/registershop" label="Register Salon" onClick={() => setSideDrawerOpen(false)} />
                  </>
                ) : (
                  <>
                    <NavLink to="/customerprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/nearbyShops" label="Book Appointment" onClick={() => setSideDrawerOpen(false)} />
                  </>
                )}
              </>
            ) : (
              "Welcome to Salonify"
            )}

            <NavLink to="/learning" label="📘 Learning" className="text-black hover:text-black" onClick={() => setSideDrawerOpen(false)} />
            <NavLink to="/donate" label="🌱 Donate for Environment" className="text-black hover:text-black" onClick={() => setSideDrawerOpen(false)} />

            {loggedIn ? (
              <NavLink to="/login" label="LogOut" onClick={logout} />
            ) : (
              <ul className="nav-item login-item">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login / Signup
                </Link>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};






// import React from "react"; 
// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
// import PropTypes from "prop-types";
// import { useLogin } from "./LoginContext";




// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
//   // New state for side drawer

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   Header.propTypes = {
//     label: PropTypes.string.isRequired,
//     to: PropTypes.string.isRequired,
//     onClick: PropTypes.string.isRequired,
//   };
//   // Enhanced NavLink Component with improved hover effect
//   const NavLink = ({ to, label, onClick }) => (
//     <Link
//       to={to}
//       onClick={onClick}
//       className="relative text-gray-700 font-medium hover:text-green-600 transition duration-300 group py-2"
//     >
//       {label}
//       <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-green-600 to-blue-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
//     </Link>
//   );

//   return (
//     <nav
//       className={`fixed  w-full transition-all duration-300 bg-black py-1`}
//     >
//       <div className="max-w-7xl mx-auto px-6 lg:px-10">
//         <div className="flex justify-between items-center">
//           {/* Logo with animation */}
//           <Link
//             to="/"
//             className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
//           >
//             Salonify
//           </Link>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-8">
//             <NavLink to="/" label="Home" />
//             <NavLink to="/about" label="About" />
//             <NavLink to="/services" label="Services" />
//             <NavLink to="/contact" label="Contact" />

//             {loggedIn ? (
//               <>
//                 <img
//                   alt="img"
//                   className="img hidden md:block"
//                   src="/images/dp_logo.jpg"
//                   width="50"
//                   height="50"
//                 />
//               </>
//             ) : (
//               <>
//                 {/* <img
//                   alt="img"
//                   className="img hidden sm:block"
//                   src="/images/dp_logo.jpg"
//                   width="50"
//                   height="50"
//                 /> */}
//                 <ul className="nav-item login-item">
//                   <Link
//                     to="/login"
//                     className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Login / Signup
//                   </Link>
//                 </ul>
//               </>
//             )}

//             {/* Button to trigger side drawer for extra links */}
//             <button
//               className="text-gray-700 focus:outline-none hover:text-green-600 transition-colors duration-300"
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

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden text-gray-700 focus:outline-none hover:text-green-600 transition-colors duration-300"
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

//         {/* Mobile Dropdown Menu */}
//         <div
//           className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
//             isOpen
//               ? "max-h-96 opacity-100 translate-y-0"
//               : "max-h-0 opacity-0 -translate-y-4"
//           }`}
//         >
//           <div className="flex flex-col items-center space-y-5 py-4">
//             <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
//             <NavLink
//               to="/about"
//               label="About"
//               onClick={() => setIsOpen(false)}
//             />
//             <NavLink
//               to="/services"
//               label="Services"
//               onClick={() => setIsOpen(false)}
//             />
//             <NavLink
//               to="/contact"
//               label="Contact"
//               onClick={() => setIsOpen(false)}
//             />

//             {loggedIn ? (
//               <>
//                 {/* Hide profile image on small screens */}
//                 <img
//                   alt="img"
//                   className="img hidden md:block"
//                   src="/images/dp_logo.jpg"
//                   width="50"
//                   height="50"
//                 />
//               </>
//             ) : (
//               <>
//                 {/* <img
//                   alt="img"
//                   className="img hidden sm:block"
//                   src="/images/dp_logo.jpg"
//                   width="50"
//                   height="50"
//                 /> */}
//                 <ul className="nav-item login-item">
//                   <Link
//                     to="/login"
//                     className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Login / Signup
//                   </Link>
//                 </ul>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Side Drawer for extra links (visible on desktop) */}
//         <div
//           className={`absolute top-[67px] right-0 w-64 h-full transform transition-transform duration-300 ease-in-out z-40 ${
//             sideDrawerOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <div className="bg-white min-h-screen flex flex-col items-center space-y-5 py-4">
//             {loggedIn ? (
//               <>
//                 <span className="text-green-500 italic text-lg font-bold mx-1">
//                   {user.name}
//                 </span>

//                 {user.userType === 'shopOwner' ? (
//                     <>
//                       <NavLink to="/barberprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
//                       <NavLink to="/registershop" label="Register your Salon" onClick={() => setSideDrawerOpen(false)} />
//                     </>
//                   ) : user.userType === 'admin' ? (
//                     <>
//                       <NavLink to="/customerprofile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
//                       <NavLink to="/admin" label="Admin Dashboard" onClick={() => setSideDrawerOpen(false)} />
//                       <NavLink to="/registershop" label="Register Salon" onClick={() => setSideDrawerOpen(false)} />
//                     </>
//                   ) : (
//                   <>
//                     <NavLink
//                       to="/customerprofile"
//                       label="Profile"
//                       onClick={() => setSideDrawerOpen(false)}
//                     />
//                     <NavLink
//                       to="/nearbyShops"
//                       label="Book Appointment"
//                       onClick={() => setSideDrawerOpen(false)}
//                     />
//                   </>
//                 )}
//               </>
//             ) : (
//               "Welcome to Salonify"
//             )}
//             <NavLink
//               to="/learning"
//               label="📘 Learning"
//               onClick={() => setSideDrawerOpen(false)}
//             />
//             <NavLink
//               to="/donate"
//               label="🌱 Donate for Environment"
//               onClick={() => setSideDrawerOpen(false)}
//             />

//             {loggedIn ? (
//               <>
//                 <NavLink to="/login" label="LogOut" onClick={logout} />
//               </>
//             ) : (
//               <>
//                 <ul className="nav-item login-item">
//                   <Link
//                     to="/login"
//                     className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Login / Signup
//                   </Link>
//                 </ul>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }



// export const Header = () => {
                    //   const { loggedIn, user, logout } = useLogin();
                    //   const [click, setClick] = useState(false);
                    
                    //   const handleClick = () => setClick(!click);
                    
                    //   return (
                    //     <>
                    //       <nav className="navbar">
                    //         <div className="nav-container">
                    //           <NavLink exact="true" to="/" className="nav-logo">
                    //             <span style={{ fontSize: "28px" }}>SBT</span>
                    //             <img src="/images/sbt logo sm.jpg" alt="logo" className="icon" />
                    //           </NavLink>
                    
                    //           <ul className={click ? "nav-menu active" : "nav-menu"}>
                    //             <li className="nav-item">
                    //               <NavLink exact="true" to="/" className="nav-links" onClick={handleClick}>Home</NavLink>
                    //             </li>
                    //             <li className="nav-item">
                    //               <NavLink exact="true" to="/about" className="nav-links" onClick={handleClick}>About</NavLink>
                    //             </li>
                    //             <li className="nav-item">
                    //               <NavLink exact="true" to="/services" className="nav-links" onClick={handleClick}>Services</NavLink>
                    //             </li>
                    //             <li className="nav-item">
                    //               <NavLink exact="true" to="/contact" className="nav-links" onClick={handleClick}>Contact Us</NavLink>
                    //             </li>
                    //           </ul>
                    
                    //           {loggedIn ? (
                    //             <>
                    //               {/* Hide profile image on small screens */}
                    //               <img
                    //                 alt="img"
                    //                 className="img hidden md:block"
                    //                 src="/images/dp_logo.png"
                    //                 width="50"
                    //                 height="50"
                    //                 style={{ marginRight: "4px", marginLeft: "-20px" }} />
                    //               <NavDropdown
                    //                 className="nav-dropdown mr-12 md:block"
                    //                 title={
                    //                   <span
                    //                     style={{
                    //                       color: "yellow",
                    //                       fontWeight: 'bold',
                    //                       fontSize: '19px',
                    //                       transition: 'color 0.3s ease',
                    //                       // marginBottom:"30px",marginRight:"30px"
                    //                     }}
                    //                   >
                    //                     {user.name}
                    //                   </span>
                    //                 }
                    //                 id="collasible-nav-dropdown">
                    //                 {user.usertype === 'shopOwner' ? (
                    //                   <>
                    //                     <NavDropdown.Item href="/barberprofile" style={{ color: 'blue', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    //                     <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register your Salon</NavDropdown.Item>
                    //                   </>
                    //                 ) : user.usertype === 'admin' ? (
                    //                   <>
                    //                     <NavDropdown.Item href="/customerprofile" style={{ color: 'blue', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    //                     <NavDropdown.Item href="/admin" style={{ color: 'green', fontWeight: 'bold' }}>Admin Dashboard</NavDropdown.Item>
                    //                     <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register your Salon</NavDropdown.Item>
                    //                   </>
                    //                 ) : (
                    //                   <>
                    //                     <NavDropdown.Item href="/customerprofile" style={{ color: 'orange', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    //                     <NavDropdown.Item href="/nearbyShops" style={{ color: 'orange', fontWeight: 'bold' }}>Book Appointment</NavDropdown.Item>
                    //                   </>
                    //                 )}
                    //                 <NavDropdown.Divider />
                    //                 <NavDropdown.Item onClick={logout} style={{ color: 'red', fontWeight: 'bold' }}>Logout</NavDropdown.Item>
                    //               </NavDropdown>
                    //             </>
                    //           ) : (
                    //             <>
                    //               {/* Hide profile image on small screens */}
                    //               {/* <img
                    //                 alt="img"
                    //                 className="img hidden sm:block"
                    //                 src="/images/dp_logo.png"
                    //                 width="50"
                    //                 height="50"
                    //                 style={{ marginRight: 10 }} /> */}
                    //               {/* <li className="nav-item login-item">
                    //                 <NavLink
                    //                   exact="true"
                    //                   to="/login"
                    //                   style={{ color: "yellow" ,marginBottom:"30px"}}
                    //                   className="nav-links"
                    //                   onClick={handleClick}>
                    //                   Login
                    //                 </NavLink>
                    //               </li> */}
                    //               <ul className="nav-item login-item">
                    //                   <Link
                    //                     to="/login"
                    //                     className="nav-links"
                    //                   >
                    //                     Login / Signup
                    //                   </Link>
                    //                 </ul>
                    //             </>
                    //           )}
                    //           <div className="nav-icon" onClick={handleClick}>
                    //             {click ? (
                    //               <span className="icon"><HamburgetMenuClose /></span>
                    //             ) : (
                    //               <span className="icon"><HamburgetMenuOpen /></span>
                    //             )}
                    //           </div>
                    //         </div>
                    //       </nav>
                    //     </>
                    //   )
                    // }