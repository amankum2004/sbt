import "../CSS/Header.css"
// import { useEffect } from "react";
// import { useNavigate  } from "react-router-dom";
import { NavLink } from "react-router-dom"
// import { useAuth } from "../store/auth"
import { useState } from "react";
import { HamburgetMenuClose, HamburgetMenuOpen } from "./icons/Hamburget";
import { NavDropdown } from "react-bootstrap"
import { useLogin } from "./LoginContext";
// import {isAllowedLvl} from '../utils/levelCheck'


export const Header = () => {
  // const {isLoggedIn,user, API} = useAuth();
  const { loggedIn, user, logout } = useLogin();
  // const navigate = useNavigate();
  const [click, setClick] = useState(false);
  // const [userType, setUserType] = useState('');

  const handleClick = () => setClick(!click);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       console.error('No token found');
  //       setUserType('');
  //       return; // Handle no token scenario
  //     }
  //     try {
  //       // const response = await fetch(`${API}/api/auth/usertype`,{
  //       const response = await fetch(`http://localhost:8000/api/auth/usertype`,{
  //         method:"GET",
  //         headers:{
  //           "Content-Type"  :"application/json",
  //           "Authorization" :`Bearer ${token}`
  //         }
  //       });
  //       const userData = await response.json();
  //       if (!response.ok) {
  //         throw new Error(userData.error || 'Failed to fetch user data');
  //       }
  //       setUserType(userData.userType || '');
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //       setUserType('');
  //       navigate('/login'); 
  //     }
  //   };

  //   if(loggedIn){
  //     fetchUserData();
  //   }
  // }, [ loggedIn, navigate]);

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
                      // marginRight:'20px'
                    }}
                  >
                    {user.name}
                  </span>
                }
                id="collasible-nav-dropdown">
                {/* {isAllowedLvl('customer', user?.usertype) && (
                  <>
                    <NavLink to="/customerprofile">
                      Customer Profile
                    </NavLink>
                  </>
                  )}
                  {isAllowedLvl('shopOwner', user?.usertype) && (
                  <>
                  <NavLink to="/barberprofile">
                    BarberProfile
                  </NavLink>
                  <NavLink to="/registershop">
                    Register your Salon
                  </NavLink>
                  </>
                  )} */}
                {user.usertype === 'shopOwner' ? (
                  <>
                    <NavDropdown.Item href="/barberprofile" style={{ color: 'blue', fontWeight: 'bold' }}>My Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register your Salon</NavDropdown.Item>
                  </>
                ) : user.usertype === 'admin' ? (
                  <>
                    <NavDropdown.Item href="/admin" style={{ color: 'green', fontWeight: 'bold' }}>Admin Dashboard</NavDropdown.Item>
                    <NavDropdown.Item href="/registershop" style={{ color: 'blue', fontWeight: 'bold' }}>Register Salon</NavDropdown.Item>
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



