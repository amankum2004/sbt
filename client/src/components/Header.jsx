// import React from "react"; 
// import "../CSS/Header.css"
// // import { useEffect } from "react";
// // import { useNavigate  } from "react-router-dom";
// import { NavLink } from "react-router-dom"
// import { useState } from "react";
// import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";
// import { NavDropdown } from "react-bootstrap"
// import { useLogin } from "./LoginContext";


// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   // const navigate = useNavigate();
//   const [click, setClick] = useState(false);

//   const handleClick = () => setClick(!click);

//   return (
//     <>
//       <nav className="navbar">
//         <div className="nav-container">
//           <NavLink exact="true" to="/" className="nav-logo">
//             <span style={{ fontSize: "28px" }}>Salon Booking Time</span>
//             <img src="/images/sbt logo sm.jpg" alt="logo" className="icon" />
//             {/* <i className="fas fa-code"></i> */}
//             {/* <span className="icon">
//               <CodeIcon />
//             </span> */}
//           </NavLink>

//           <ul className={click ? "nav-menu active" : "nav-menu"}>
//             <li className="nav-item">
//               <NavLink
//                 exact="true"
//                 to="/"
//                 className="nav-links"
//                 onClick={handleClick}>
//                 Home
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 exact="true"
//                 to="/about"
//                 activeclassname="active"
//                 className="nav-links"
//                 onClick={handleClick}>
//                 About
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 exact="true"
//                 to="/services"
//                 activeclassname="active"
//                 className="nav-links"
//                 onClick={handleClick}>
//                 Services
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink
//                 exact="true"
//                 to="/contact"
//                 activeclassname="active"
//                 className="nav-links"
//                 onClick={handleClick}>
//                 Contact Us
//               </NavLink>
//             </li>
//           </ul>
//           {loggedIn ? (
//             <>
//               <img
//                 alt="img"
//                 className="img"
//                 src="/images/dp_logo.jpg"
//                 width="50"
//                 height="50"
//                 style={{ marginRight: "4px", marginLeft: "-35px" }} />
//               <NavDropdown
//                 className="nav-dropdown"
//                 title={
//                   <span
//                     style={{
//                       color: "yellow",
//                       fontWeight: 'bold',
//                       fontSize: '19px',
//                       transition: 'color 0.3s ease'
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
//               <img
//                 alt="img"
//                 className="img"
//                 src="/images/dp_logo.jpg"
//                 width="50"
//                 height="50"
//                 style={{ marginRight: 10 }}
//               />
//               {/* <NavLink className="nav-links" href="/login" style={{ color: 'yellow' }}>Login</NavLink> */}
//               <li className="nav-item">
//                 <NavLink
//                   exact="true"
//                   to="/login"
//                   style={{ color: "yellow" }}
//                   activeclassname="active"
//                   className="nav-links"
//                   onClick={handleClick}>
//                   Login
//                 </NavLink>
//               </li>
//             </>
//           )}
//           <div className="nav-icon" onClick={handleClick}>
//             {/* <i className={click ? "fas fa-times" : "fas fa-bars"}></i> */}
//             {click ? (
//               <span className="icon">
//                 <HamburgetMenuClose />{" "}
//               </span>
//             ) : (
//               <span className="icon">
//                 <HamburgetMenuOpen />
//               </span>
//             )}
//           </div>
//         </div>
//       </nav>
//     </>
//   )
// }



// import React from "react"; 
// import { NavLink } from "react-router-dom"
// import { useState } from "react";
// import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";
// import { NavDropdown } from "react-bootstrap"
// import { useLogin } from "./LoginContext";

// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [click, setClick] = useState(false);

//   const handleClick = () => setClick(!click);

//   return (
//     <>
//       <nav className="bg-black h-18 flex justify-center items-center text-lg fixed w-full z-50">
//         <div className="flex justify-between items-center w-full max-w-[1500px] px-5">
//           <NavLink exact="true" to="/" className="text-[#f5b921] flex items-center text-2xl">
//             <span>Salon Booking Time</span>
//             <img src="/images/sbt logo sm.jpg" alt="logo" className="w-12 h-12 ml-4" />
//           </NavLink>

//           <ul className={`${click ? "flex" : "hidden"} md:flex flex-col md:flex-row text-center md:space-x-5`}>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/" className="text-white p-2" onClick={handleClick}>Home</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/about" className="text-white p-2" onClick={handleClick}>About</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/services" className="text-white p-2" onClick={handleClick}>Services</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/contact" className="text-white p-2" onClick={handleClick}>Contact Us</NavLink>
//             </li>
//           </ul>

//           {loggedIn ? (
//             <>
//               <img
//                 alt="img"
//                 className="w-12 h-12"
//                 src="/images/dp_logo.jpg"
//                 style={{ marginRight: "4px", marginLeft: "-35px" }}
//               />
//               <NavDropdown
//                 className="text-[#f5b921] font-bold text-lg"
//                 title={
//                   <span style={{ color: "yellow", fontWeight: 'bold', fontSize: '19px' }}>
//                     {user.name}
//                   </span>
//                 }
//                 id="collasible-nav-dropdown">
//                 {user.usertype === 'shopOwner' ? (
//                   <>
//                     <NavDropdown.Item href="/barberprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
//                   </>
//                 ) : user.usertype === 'admin' ? (
//                   <>
//                     <NavDropdown.Item href="/customerprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/admin" className="text-green-600 font-bold">Admin Dashboard</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
//                   </>
//                 ) : (
//                   <>
//                     <NavDropdown.Item href="/customerprofile" className="text-orange-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/nearbyShops" className="text-orange-600 font-bold">Book Appointment</NavDropdown.Item>
//                   </>
//                 )}
//                 <NavDropdown.Divider />
//                 <NavDropdown.Item onClick={logout} className="text-red-600 font-bold">Logout</NavDropdown.Item>
//               </NavDropdown>
//             </>
//           ) : (
//             <>
//               <img
//                 alt="img"
//                 className="w-12 h-12"
//                 src="/images/dp_logo.jpg"
//                 style={{ marginRight: 10 }}
//               />
//               <li className="list-none">
//                 <NavLink
//                   exact="true"
//                   to="/login"
//                   className="text-yellow-500 p-2"
//                   onClick={handleClick}>
//                   Login
//                 </NavLink>
//               </li>
//             </>
//           )}

//           <div className="md:hidden text-yellow-500 cursor-pointer" onClick={handleClick}>
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

// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { NavDropdown } from "react-bootstrap";
// import { useLogin } from "./LoginContext";
// import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";

// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [click, setClick] = useState(false);

//   const handleClick = () => setClick(!click);

//   return (
//     <>
//       <nav className="bg-black h-15 flex justify-center items-center text-lg fixed w-full z-50">
//         <div className="flex justify-between items-center w-full max-w-[1500px] px-5">
//           <NavLink exact="true" to="/" className="text-[#f5b921] flex items-center text-2xl">
//             {/* Display "SBT" on small screens, and "Salon Booking Time" on medium and larger screens */}
//             <span className="md:hidden">SBT</span>
//             <span className="hidden md:block">Salon Booking Time</span>
//             {/* Hide logo image on small screens */}
//             <img src="/images/sbt logo sm.jpg" alt="logo" className="w-12 h-12 ml-4 hidden md:block" />
//           </NavLink>

//           <ul className={`${click ? "flex" : "hidden"} md:flex flex-col md:flex-row text-center md:space-x-5`}>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/" className="text-white p-2" onClick={handleClick}>Home</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/about" className="text-white p-2" onClick={handleClick}>About</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/services" className="text-white p-2" onClick={handleClick}>Services</NavLink>
//             </li>
//             <li className="hover:border-b-4 border-[#ffdd40]">
//               <NavLink exact="true" to="/contact" className="text-white p-2" onClick={handleClick}>Contact Us</NavLink>
//             </li>
//           </ul>

//           {loggedIn ? (
//             <>
//               {/* Hide profile image on small screens */}
//               <img
//                 alt="profile"
//                 className="w-12 h-12 hidden md:block"
//                 src="/images/dp_logo.jpg"
//                 style={{ marginRight: "4px", marginLeft: "-35px" }}
//               />
//               <NavDropdown
//                 className="text-[#f5b921] font-bold text-lg"
//                 title={<span className="text-yellow-500 font-bold text-lg">{user.name}</span>}
//                 id="collasible-nav-dropdown"
//               >
//                 {user.usertype === 'shopOwner' ? (
//                   <>
//                     <NavDropdown.Item href="/barberprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
//                   </>
//                 ) : user.usertype === 'admin' ? (
//                   <>
//                     <NavDropdown.Item href="/customerprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/admin" className="text-green-600 font-bold">Admin Dashboard</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
//                   </>
//                 ) : (
//                   <>
//                     <NavDropdown.Item href="/customerprofile" className="text-orange-600 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/nearbyShops" className="text-orange-600 font-bold">Book Appointment</NavDropdown.Item>
//                   </>
//                 )}
//                 <NavDropdown.Divider />
//                 <NavDropdown.Item onClick={logout} className="text-red-600 font-bold">Logout</NavDropdown.Item>
//               </NavDropdown>
//             </>
//           ) : (
//             <>
//               {/* Hide profile image on small screens */}
//               <img alt="profile" className="w-12 h-10 hidden md:block" src="/images/dp_logo.jpg" style={{ marginRight: 10 }} />
//               <li className="list-none">
//                 <NavLink exact="true" to="/login" className="text-yellow-500 p-2" onClick={handleClick}>Login</NavLink>
//               </li>
//             </>
//           )}

//           <div className="md:hidden text-yellow-500 cursor-pointer" onClick={handleClick}>
//             {click ? (
//               <span className="icon"><HamburgetMenuClose /></span>
//             ) : (
//               <span className="icon"><HamburgetMenuOpen /></span>
//             )}
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }


import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { useLogin } from "./LoginContext";
import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";

export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMenu = () => setClick(false); // to close menu when a link is clicked

  return (
    <>
      <nav className="bg-black h-15 flex justify-center items-center text-lg fixed w-full z-50 shadow-lg">
        <div className="flex justify-between items-center w-full max-w-[1500px] px-5">
          {/* Brand Logo and Title */}
          <NavLink exact="true" to="/" className="text-[#f5b921] flex items-center text-xl lg:text-2xl">
            {/* Display "SBT" on small screens, and "Salon Booking Time" on medium and larger screens */}
            <span className="md:hidden">SBT</span>
            <span className="hidden md:block">Salon Booking Time</span>
            <img src="/images/sbt logo sm.jpg" alt="logo" className="w-8 h-8 ml-2 md:w-12 md:h-12 hidden md:block" />
          </NavLink>

          {/* Navigation Links */}
          <ul className={`${click ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center absolute md:static top-20 left-0 w-full md:w-auto md:bg-transparent bg-black md:space-x-5 space-y-3 md:space-y-0 text-center md:pr-0 pr-10 md:flex-row transition-all ease-in-out duration-500`}>
            <li className="hover:border-b-4 border-[#ffdd40]">
              <NavLink exact="true" to="/" className="text-white p-2" onClick={closeMenu}>Home</NavLink>
            </li>
            <li className="hover:border-b-4 border-[#ffdd40]">
              <NavLink exact="true" to="/about" className="text-white p-2" onClick={closeMenu}>About</NavLink>
            </li>
            <li className="hover:border-b-4 border-[#ffdd40]">
              <NavLink exact="true" to="/services" className="text-white p-2" onClick={closeMenu}>Services</NavLink>
            </li>
            <li className="hover:border-b-4 border-[#ffdd40]">
              <NavLink exact="true" to="/contact" className="text-white p-2" onClick={closeMenu}>Contact Us</NavLink>
            </li>
          </ul>

          {/* User Login and Dropdown */}
          {loggedIn ? (
            <div className="flex items-center">
              {/* Hide profile image on small screens */}
              <img
                alt="profile"
                className="w-10 h-10 hidden md:block"
                src="/images/dp_logo.jpg"
                style={{ marginRight: "10px" }}
              />
              <NavDropdown
                className="text-[#f5b921] font-bold text-lg"
                title={<span className="text-yellow-500 font-bold text-lg">{user.name}</span>}
                id="collasible-nav-dropdown"
              >
                {user.usertype === 'shopOwner' ? (
                  <>
                    <NavDropdown.Item href="/barberprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
                  </>
                ) : user.usertype === 'admin' ? (
                  <>
                    <NavDropdown.Item href="/customerprofile" className="text-blue-600 font-bold">My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/admin" className="text-green-600 font-bold">Admin Dashboard</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" className="text-blue-600 font-bold">Register your Salon</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item href="/customerprofile" className="text-orange-600 font-bold">My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/nearbyShops" className="text-orange-600 font-bold">Book Appointment</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-red-600 font-bold">Logout</NavDropdown.Item>
              </NavDropdown>
            </div>
          ) : (
            <div className="flex items-center">
              <img alt="profile" className="w-10 h-10 hidden md:block" src="/images/dp_logo.jpg" style={{ marginRight: 10 }} />
              <li className="list-none">
                <NavLink exact="true" to="/login" className="text-yellow-500 p-2" onClick={closeMenu}>Login</NavLink>
              </li>
            </div>
          )}

          {/* Hamburger Menu for Mobile Devices */}
          <div className="md:hidden text-yellow-500 cursor-pointer z-50" onClick={handleClick}>
            {click ? (
              <HamburgetMenuClose />
            ) : (
              <HamburgetMenuOpen />
            )}
          </div>
        </div>
      </nav>
    </>
  );
};







