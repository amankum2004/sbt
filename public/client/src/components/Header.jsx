import "./Header.css"
import { useEffect } from "react";
import { useNavigate  } from "react-router-dom";
import { NavLink } from "react-router-dom"
import { useAuth } from "../store/auth"
import { useState } from "react";
import { HamburgetMenuClose,HamburgetMenuOpen } from "./Icons";
import { NavDropdown } from "react-bootstrap"


export const  Header = () => {
  const {isLoggedIn,user, API} = useAuth();
  const navigate = useNavigate();
  const [click, setClick] = useState(false);
  const [userType, setUserType] = useState('');

  const handleClick = () => setClick(!click);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setUserType('');
        return; // Handle no token scenario
      }
      try {
        const response = await fetch(`${API}/api/auth/usertype`,{
          method:"GET",
          headers:{
            "Content-Type"  :"application/json",
            "Authorization" :`Bearer ${token}`
          }
        });
        const userData = await response.json();
        if (!response.ok) {
          throw new Error(userData.error || 'Failed to fetch user data');
        }
        setUserType(userData.userType || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserType('');
        navigate('/login'); 
      }
    };

    if(isLoggedIn){
      fetchUserData();
    }
  }, [API, isLoggedIn, navigate]);


    return (
        <>
        <nav className="navbar">
        <div className="nav-container">
          <NavLink exact to="/" className="nav-logo">
            <span style={{fontSize:"28px"}}>Salon Booking Time</span>
            <img src="/images/sbt logo sm.jpg" alt="logo" className="icon"/>
            {/* <i className="fas fa-code"></i> */}
            {/* <span className="icon">
              <CodeIcon />
            </span> */}
          </NavLink>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact
                to="/"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/about"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}>
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/services"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}>
                Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact
                to="/contact"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}>
                Contact Us
              </NavLink>
            </li>
          </ul>
          {isLoggedIn ? (
                <>
                <img
                      alt="img"
                      className="img"
                      // src={`${isLoggedIn.pic}`}
                      src="/images/dp.jpeg"
                      width="50"
                      height="50"
                      style={{ marginRight: "2px" ,marginLeft:"-35px"}}/>
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
                        {user.username}
                    </span>
                }
                id="collasible-nav-dropdown">
                  {userType === 'shopOwner' ? (
                    <NavDropdown.Item href="/barberprofile" style={{ color: 'orange',fontWeight: 'bold'}}>My Profile</NavDropdown.Item>
                  ): (
                    <NavDropdown.Item href="/customerprofile" style={{ color: 'orange',fontWeight: 'bold'}}>My Profile</NavDropdown.Item>
                  )}
                  {/* <NavDropdown.Item href="/customerprofile" style={{ color: 'orange',fontWeight: 'bold'}}>My Profile</NavDropdown.Item> */}
                  <NavDropdown.Divider/>
                  <NavDropdown.Item href="/logout" style={{ color: 'green',fontWeight: 'bold'}}>Logout</NavDropdown.Item>
                </NavDropdown>
                </>
            ) : (
              <>
              <img
              alt="img"
              className="img"
              src="/images/dp.jpeg"
              width="50"
              height="50"
            //   style={{ marginRight: 10 }}
              />
              {/* <NavLink className="nav-links" href="/login" style={{ color: 'yellow' }}>Login</NavLink> */}
              <li className="nav-item">
              <NavLink
                exact
                to="/login"
                style={{color:"yellow"}}
                activeClassName="active"
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

// export default Header;