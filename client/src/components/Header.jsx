import "../CSS/Header.css"
import React from "react"; 
// import { useEffect } from "react";
// import { useNavigate  } from "react-router-dom";
import { NavLink } from "react-router-dom"
import { useState } from "react";
import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";
import { NavDropdown } from "react-bootstrap"
import { useLogin } from "./LoginContext";


export const Header = () => {
  const { loggedIn, user, logout } = useLogin();
  // const navigate = useNavigate();
  const [click, setClick] = useState(false);


  const handleClick = () => setClick(!click);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <NavLink exact="true" to="/" className="nav-logo">
            <span style={{ fontSize: "28px" }}>Salon Booking Time</span>
            <img src="/images/sbt logo sm.jpg" alt="logo" className="icon" />
            {/* <i className="fas fa-code"></i> */}
            {/* <span className="icon">
              <CodeIcon />
            </span> */}
          </NavLink>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/"
                className="nav-links"
                onClick={handleClick}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/about"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}>
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/services"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}>
                Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/contact"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}>
                Contact Us
              </NavLink>
            </li>
          </ul>
          {loggedIn ? (
            <>
              <img
                alt="img"
                className="img"
                src="/images/dp_logo.jpg"
                width="50"
                height="50"
                style={{ marginRight: "4px", marginLeft: "-35px" }} />
              <NavDropdown
                className="nav-dropdown"
                title={
                  <span
                    style={{
                      color: "yellow",
                      fontWeight: 'bold',
                      fontSize: '19px',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {user.name}
                  </span>
                }
                id="collasible-nav-dropdown">
                {user.usertype === 'shopOwner' ? (
                  <>
                    <NavDropdown.Item href="/barberprofile" style={{ color: 'blue', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register your Salon</NavDropdown.Item>
                  </>
                ) : user.usertype === 'admin' ? (
                  <>
                    <NavDropdown.Item href="/customerprofile" style={{ color: 'blue', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/admin" style={{ color: 'green', fontWeight: 'bold' }}>Admin Dashboard</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register your Salon</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item href="/customerprofile" style={{ color: 'orange', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/nearbyShops" style={{ color: 'orange', fontWeight: 'bold' }}>Book Appointment</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} style={{ color: 'red', fontWeight: 'bold' }}>Logout</NavDropdown.Item>
              </NavDropdown>
            </>
          ) : (
            <>
              <img
                alt="img"
                className="img"
                src="/images/dp_logo.jpg"
                width="50"
                height="50"
                style={{ marginRight: 10 }}
              />
              {/* <NavLink className="nav-links" href="/login" style={{ color: 'yellow' }}>Login</NavLink> */}
              <li className="nav-item">
                <NavLink
                  exact="true"
                  to="/login"
                  style={{ color: "yellow" }}
                  activeclassname="active"
                  className="nav-links"
                  onClick={handleClick}>
                  Login
                </NavLink>
              </li>
            </>
          )}
          <div className="nav-icon" onClick={handleClick}>
            {/* <i className={click ? "fas fa-times" : "fas fa-bars"}></i> */}
            {click ? (
              <span className="icon">
                <HamburgetMenuOpen />{" "}
              </span>
            ) : (
              <span className="icon">
                <HamburgetMenuClose />
              </span>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}


// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";
// import { NavDropdown } from "react-bootstrap";
// import { useLogin } from "./LoginContext";

// export const Header = () => {
//   const { loggedIn, user, logout } = useLogin();
//   const [click, setClick] = useState(false);

//   const handleClick = () => setClick(!click);

//   return (
//     <>
//       <nav className="bg-black h-20 flex justify-center items-center text-lg fixed z-1000">
//         <div className="bg-black flex justify-cent items-center w-full max-w-[1500px] px-5 z-1000">
//           <NavLink to="/" className="flex items-center text-[#f5b921] text-2xl font-bold">
//             <span>Salon Booking Time</span>
//             <img src="/images/sbt logo sm.jpg" alt="logo" className="ml-4 w-12 h-12" />
//           </NavLink>

//           <ul className={`flex list-none text-center transition-all duration-500 ${click ? "flex-col absolute bg-[#1f5156] left-0 w-full top-20 opacity-100 z-10" : "hidden md:flex"}`}>
//             <li className="nav-item">
//               <NavLink to="/" className="text-white px-4 py-2 hover:text-[#ffdd40]" onClick={handleClick}>
//                 Home
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink to="/about" className="text-white px-4 py-2 hover:text-[#ffdd40]" onClick={handleClick}>
//                 About
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink to="/services" className="text-white px-4 py-2 hover:text-[#ffdd40]" onClick={handleClick}>
//                 Services
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink to="/contact" className="text-white px-4 py-2 hover:text-[#ffdd40]" onClick={handleClick}>
//                 Contact Us
//               </NavLink>
//             </li>
//           </ul>

//           {loggedIn ? (
//             <div className="flex items-center space-x-4">
//               <img alt="profile" className="w-12 h-12" src="/images/dp_logo.jpg" />
//               <NavDropdown title={<span className="text-yellow-500 font-bold text-lg">{user.name}</span>} id="collasible-nav-dropdown">
//                 {user.usertype === "shopOwner" ? (
//                   <>
//                     <NavDropdown.Item href="/barberprofile" className="text-blue-500 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-500 font-bold">Register your Salon</NavDropdown.Item>
//                   </>
//                 ) : user.usertype === "admin" ? (
//                   <>
//                     <NavDropdown.Item href="/admin" className="text-green-500 font-bold">Admin Dashboard</NavDropdown.Item>
//                     <NavDropdown.Item href="/registershop" className="text-blue-500 font-bold">Register Salon</NavDropdown.Item>
//                   </>
//                 ) : (
//                   <>
//                     <NavDropdown.Item href="/customerprofile" className="text-orange-500 font-bold">My Profile</NavDropdown.Item>
//                     <NavDropdown.Item href="/nearbyShops" className="text-orange-500 font-bold">Book Appointment</NavDropdown.Item>
//                   </>
//                 )}
//                 <NavDropdown.Divider />
//                 <NavDropdown.Item onClick={logout} className="text-red-500 font-bold">Logout</NavDropdown.Item>
//               </NavDropdown>
//             </div>
//           ) : (
//             <div className="flex items-center space-x-4">
//               <img alt="profile" className="w-12 h-12" src="/images/dp_logo.jpg" />
//               <NavLink to="/login" className="text-yellow-500 font-bold" onClick={handleClick}>
//                 Login
//               </NavLink>
//             </div>
//           )}

//           <div className="md:hidden text-yellow-500" onClick={handleClick}>
//             {click ? <HamburgetMenuOpen /> : <HamburgetMenuClose />}
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// };




