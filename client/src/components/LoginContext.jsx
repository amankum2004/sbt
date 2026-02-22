import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingProvider } from './Loading';
import { api } from '../utils/api';

const LoginContext = createContext();

export const useLogin = () => useContext(LoginContext);

export const LoginProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [shopExists, setShopExists] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  let navigate;
  try {
    navigate = useNavigate();
  } catch {
    navigate = () => {};
  }

  // Check if shop exists
  const checkShopExists = async (email) => {
    if (!email) {
      return { exists: false };
    }

    try {
      const normalizedEmail = encodeURIComponent(email.trim().toLowerCase());
      const response = await api.get(`/shop/check-shop/${normalizedEmail}`);
      return response.data;
    } catch (error) {
      console.error("Error checking shop existence:", error);
      return { exists: false };
    }
  };

  // Update shop information
  const updateShop = (shopData) => {
    setShop(shopData);
    if (shopData) {
      localStorage.setItem('shop', JSON.stringify(shopData));
      setShopExists(true);
    } else {
      localStorage.removeItem('shop');
      setShopExists(false);
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true);
        
        // Check if we have the necessary authentication data
        const jwtToken = localStorage.getItem('jwt_token');
        const userDataStr = localStorage.getItem('user_data');
        
        console.log('🔍 Initializing auth:', {
          hasJWT: !!jwtToken,
          hasUserData: !!userDataStr
        });
        
        if (jwtToken && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            console.log('✅ User loaded from localStorage:', userData.email);
            
            setLoggedIn(true);
            setUser(userData);
            
            // Load shop data if exists
            const savedShop = localStorage.getItem('shop');
            if (savedShop) {
              const shopData = JSON.parse(savedShop);
              setShop(shopData);
              setShopExists(true);
            } else if (userData.usertype === 'shopOwner' && userData.email) {
              // Auto-check shop for shop owners
              try {
                const response = await checkShopExists(userData.email);
                if (response.exists) {
                  setShop(response.shop);
                  setShopExists(true);
                  localStorage.setItem('shop', JSON.stringify(response.shop));
                }
              } catch (error) {
                console.error('Error checking shop:', error);
              }
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            logout();
          }
        } else {
          console.log('⚠️ No valid authentication data found');
          setLoggedIn(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (userData) => {
    console.log('LoginContext: login called with user data', userData.email);
    
    // Store user data
    localStorage.setItem('user_data', JSON.stringify(userData));
    setLoggedIn(true);
    setUser(userData);

    // Check shop existence if user is shopOwner
    if (userData.usertype === 'shopOwner' && userData.email) {
      try {
        const response = await checkShopExists(userData.email);
        if (response.exists) {
          setShop(response.shop);
          setShopExists(true);
          localStorage.setItem('shop', JSON.stringify(response.shop));
        } else {
          setShop(null);
          setShopExists(false);
          localStorage.removeItem('shop');
        }
      } catch (error) {
        console.error('Error checking shop during login:', error);
      }
    } else {
      setShopExists(false);
    }
    
    // Navigate to home page after successful login
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const logout = () => {
    console.log('Logging out...');
    // Clear all auth data
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('shop');
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
    setShop(null);
    setShopExists(false);
    navigate('/login', { replace: true });
  };

  const refreshShopData = async () => {
    if (user && user.usertype === 'shopOwner' && user.email) {
      const shopCheck = await checkShopExists(user.email);
      if (shopCheck.exists) {
        setShop(shopCheck.shop);
        setShopExists(true);
        localStorage.setItem('shop', JSON.stringify(shopCheck.shop));
        return shopCheck.shop;
      } else {
        setShop(null);
        setShopExists(false);
        localStorage.removeItem('shop');
        return null;
      }
    }
    return null;
  };

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <LoginContext.Provider value={{ 
      loggedIn, 
      login, 
      logout, 
      user, 
      setUser,
      shop,
      shopExists,
      updateShop,
      refreshShopData,
      checkShopExists
    }}>
      {children}
    </LoginContext.Provider>
  );
};





// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LoadingProvider } from './Loading';
// import { api } from '../utils/api';

// const LoginContext = createContext();

// export const useLogin = () => useContext(LoginContext);

// export const LoginProvider = ({ children }) => {
//   const [loggedIn, setLoggedIn] = useState(true);
//   const [user, setUser] = useState(null);
//   const [shop, setShop] = useState(null);
//   const [shopExists, setShopExists] = useState(false);
//   let navigate;
  
//   try {
//     navigate = useNavigate();
//   } catch {
//     navigate = () => {};
//   }

//   // Check if shop exists for the current user
//   const checkShopExists = async (email) => {
//     try {
//       const response = await api.get(`/shop/check-shop/${email}`);
//       return response.data;
//     } catch (error) {
//       console.error("Error checking shop existence:", error);
//       return { exists: false };
//     }
//   };

//   // Update shop information
//   const updateShop = (shopData) => {
//     setShop(shopData);
//     if (shopData) {
//       localStorage.setItem('shop', JSON.stringify(shopData));
//       setShopExists(true);
//     } else {
//       localStorage.removeItem('shop');
//       setShopExists(false);
//     }
//   };

//   // Function to verify JWT token
//   const verifyToken = () => {
//     const jwtToken = localStorage.getItem('jwt_token');
//     const userData = localStorage.getItem('user_data');
    
//     if (!jwtToken || !userData) {
//       return false;
//     }
    
//     try {
//       // Decode JWT to check expiration
//       const tokenParts = jwtToken.split('.');
//       if (tokenParts.length !== 3) {
//         return false;
//       }
      
//       const payload = JSON.parse(atob(tokenParts[1]));
//       const currentTime = Date.now() / 1000;
      
//       if (payload.exp < currentTime) {
//         // Token expired
//         localStorage.removeItem('jwt_token');
//         localStorage.removeItem('user_data');
//         return false;
//       }
      
//       return true;
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       return false;
//     }
//   };

//   useEffect(() => {
//     try {
//       // Check if we have valid JWT token
//       const hasValidToken = verifyToken();
      
//       if (hasValidToken) {
//         // Get user data from localStorage
//         const savedUser = localStorage.getItem('user_data');
//         const savedShop = localStorage.getItem('shop');
        
//         if (savedUser) {
//           const userData = JSON.parse(savedUser);
//           setLoggedIn(true);
//           setUser(userData);
          
//           // Check shop data
//           if (savedShop) {
//             setShop(JSON.parse(savedShop));
//             setShopExists(true);
//           } else if (userData.usertype === 'shopOwner' && userData.email) {
//             // Auto-check shop existence for shop owners
//             checkShopExists(userData.email).then(result => {
//               if (result.exists) {
//                 setShop(result.shop);
//                 setShopExists(true);
//                 localStorage.setItem('shop', JSON.stringify(result.shop));
//               } else {
//                 setShopExists(false);
//               }
//             });
//           } else {
//             setShopExists(false);
//           }
//         } else {
//           setLoggedIn(false);
//           setUser(null);
//           setShop(null);
//           setShopExists(false);
//         }
//       } else {
//         setLoggedIn(false);
//         setUser(null);
//         setShop(null);
//         setShopExists(false);
//       }
//     } catch (e) {
//       console.error("Error in LoginContext useEffect:", e);
//       localStorage.removeItem('jwt_token');
//       localStorage.removeItem('user_data');
//       localStorage.removeItem('shop');
//       setLoggedIn(false);
//       setUser(null);
//       setShop(null);
//       setShopExists(false);
//     }
//   }, [loggedIn]);

//   const login = async (userData) => {
//     // Store user data separately
//     localStorage.setItem('user_data', JSON.stringify(userData));
//     setLoggedIn(true);
//     setUser(userData);

//     // Check shop existence if user is shopOwner
//     if (userData.usertype === 'shopOwner' && userData.email) {
//       const shopCheck = await checkShopExists(userData.email);
//       if (shopCheck.exists) {
//         setShop(shopCheck.shop);
//         setShopExists(true);
//         localStorage.setItem('shop', JSON.stringify(shopCheck.shop));
//       } else {
//         setShop(null);
//         setShopExists(false);
//         localStorage.removeItem('shop');
//       }
//     } else {
//       setShopExists(false);
//     }
//   };

//   const logout = () => {
//     // Clear ALL auth data
//     localStorage.removeItem('jwt_token');
//     localStorage.removeItem('user_data');
//     localStorage.removeItem('shop');
//     setLoggedIn(false);
//     setUser(null);
//     setShop(null);
//     setShopExists(false);
//     navigate('/login');
//   };

//   // Refresh shop data
//   const refreshShopData = async () => {
//     if (user && user.usertype === 'shopOwner' && user.email) {
//       const shopCheck = await checkShopExists(user.email);
//       if (shopCheck.exists) {
//         setShop(shopCheck.shop);
//         setShopExists(true);
//         localStorage.setItem('shop', JSON.stringify(shopCheck.shop));
//         return shopCheck.shop;
//       } else {
//         setShop(null);
//         setShopExists(false);
//         localStorage.removeItem('shop');
//         return null;
//       }
//     }
//     return null;
//   };

//   if (loggedIn && !user) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <LoadingProvider />
//       </div>
//     );
//   }

//   return (
//     <LoginContext.Provider value={{ 
//       loggedIn, 
//       login, 
//       logout, 
//       user, 
//       setUser,
//       shop,
//       shopExists,
//       updateShop,
//       refreshShopData,
//       checkShopExists
//     }}>
//       {children}
//     </LoginContext.Provider>
//   );
// };






// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LoadingProvider } from './Loading';
// import { api } from '../utils/api';

// const LoginContext = createContext();

// export const useLogin = () => useContext(LoginContext);

// export const LoginProvider = ({ children }) => {
//   const [loggedIn, setLoggedIn] = useState(true);
//   const [user, setUser] = useState(null);
//   const [shop, setShop] = useState(null);
//   const [shopExists, setShopExists] = useState(false);
//   // const navigate = useNavigate();

//   // ✅ Safe hook usage: check if inside a router
//   let navigate;
//   try {
//     navigate = useNavigate();
//   } catch {
//     navigate = () => {}; // fallback during tests
//   }

//   // Check if shop exists for the current user
//   const checkShopExists = async (email) => {
//     try {
//       // console.log("Checking shop existence for:", email);
//       const response = await api.get(`/shop/check-shop/${email}`);
//       // console.log("Shop check response:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("Error checking shop existence:", error);
//       return { exists: false };
//     }
//   };

//   // Update shop information
//   const updateShop = (shopData) => {
//     // console.log("Updating shop data:", shopData);
//     setShop(shopData);
//     if (shopData) {
//       localStorage.setItem('shop', JSON.stringify(shopData));
//       setShopExists(true);
//     } else {
//       localStorage.removeItem('shop');
//       setShopExists(false);
//     }
//   };

//   useEffect(() => {
//     try {
//       // const token = localStorage.getItem("token");
//       // const savedUser = JSON.parse(localStorage.getItem("user"));
//       // const savedShop = JSON.parse(localStorage.getItem("shop"));
//       const token = JSON.parse(localStorage.getItem('token'));
//       const savedShop = JSON.parse(localStorage.getItem('shop'));
      
//       // console.log("LoginContext useEffect - Token:", token);
//       // console.log("LoginContext useEffect - Saved Shop:", savedShop);

//       if (token) {
//         const currentTime = Date.now() / 1000;
//         if (token.exp + 2 * 60 < currentTime) {
//           // Token expired
//           // console.log("Token expired");
//           localStorage.removeItem('token');
//           localStorage.removeItem('shop');
//           setLoggedIn(false);
//           setUser(null);
//           setShop(null);
//           setShopExists(false);
//         } else {
//           // Valid token
//           // console.log("Token valid, user type:", token.usertype);
//           setLoggedIn(true);
//           setUser(token);
          
//           // Check if we have shop data
//           if (savedShop) {
//             // console.log("Found saved shop in localStorage");
//             setShop(savedShop);
//             setShopExists(true);
//           } else if (token.usertype === 'shopOwner' && token.email) {
//             // Auto-check shop existence for shop owners
//             // console.log("Auto-checking shop existence for shop owner");
//             checkShopExists(token.email).then(result => {
//               // console.log("Auto-check result:", result);
//               if (result.exists) {
//                 setShop(result.shop);
//                 setShopExists(true);
//                 localStorage.setItem('shop', JSON.stringify(result.shop));
//               } else {
//                 // console.log("No shop found for this user");
//                 setShopExists(false);
//               }
//             });
//           } else {
//             // console.log("Not a shop owner or no email");
//             setShopExists(false);
//           }
//         }
//       } else {
//         // console.log("No token found");
//         setLoggedIn(false);
//         setUser(null);
//         setShop(null);
//         setShopExists(false);
//       }
//     } catch (e) {
//       // console.error("Error in LoginContext useEffect:", e);
//       localStorage.removeItem('token');
//       localStorage.removeItem('shop');
//       setLoggedIn(false);
//       setUser(null);
//       setShop(null);
//       setShopExists(false);
//     }
//   }, [loggedIn]);

//   const login = async (userData) => {
//     // ✅ STORE JWT STRING
//     // localStorage.setItem("token", userData.token);

//     // ✅ STORE USER SEPARATELY
//     // localStorage.setItem("user", JSON.stringify(userData.user));
//     // // console.log("Login function called with:", userData);
//     localStorage.setItem('token', JSON.stringify(userData));
//     setLoggedIn(true);
//     setUser(userData);

//     // Check shop existence if user is shopOwner
//     if (userData.usertype === 'shopOwner' && userData.email) {
//       // console.log("User is shopOwner, checking shop existence");
//       const shopCheck = await checkShopExists(userData.email);
//       // console.log("Shop check during login:", shopCheck);
//       if (shopCheck.exists) {
//         setShop(shopCheck.shop);
//         setShopExists(true);
//         localStorage.setItem('shop', JSON.stringify(shopCheck.shop));
//       } else {
//         setShop(null);
//         setShopExists(false);
//         localStorage.removeItem('shop');
//       }
//     } else {
//       // console.log("User is not shopOwner");
//       setShopExists(false);
//     }
//   };

//   const logout = () => {
//     // console.log("Logout function called");
//     localStorage.removeItem('token');
//     localStorage.removeItem('shop');
//     setLoggedIn(false);
//     setUser(null);
//     setShop(null);
//     setShopExists(false);
//     navigate('/login');
//   };

//   // Refresh shop data (useful after editing shop details)
//   const refreshShopData = async () => {
//     // console.log("Refreshing shop data for user:", user);
//     if (user && user.usertype === 'shopOwner' && user.email) {
//       const shopCheck = await checkShopExists(user.email);
//       // console.log("Refresh shop data result:", shopCheck);
//       if (shopCheck.exists) {
//         setShop(shopCheck.shop);
//         setShopExists(true);
//         localStorage.setItem('shop', JSON.stringify(shopCheck.shop));
//         return shopCheck.shop;
//       } else {
//         setShop(null);
//         setShopExists(false);
//         localStorage.removeItem('shop');
//         return null;
//       }
//     }
//     return null;
//   };

//   if (loggedIn && !user) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <LoadingProvider />
//       </div>
//     );
//   }

//   // console.log("LoginContext provider values:", { loggedIn, user, shop, shopExists });

//   return (
//     <LoginContext.Provider value={{ 
//       loggedIn, 
//       login, 
//       logout, 
//       user, 
//       setUser,
//       shop,
//       shopExists,
//       updateShop,
//       refreshShopData,
//       checkShopExists
//     }}>
//       {children}
//     </LoginContext.Provider>
//   );
// };



// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LoadingProvider } from './Loading';

// const LoginContext = createContext();

// export const useLogin = () => useContext(LoginContext);

// export const LoginProvider = ({ children }) => {
//   const [loggedIn, setLoggedIn] = useState(true);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     try {
//       const token = JSON.parse(localStorage.getItem('token'));
//       if (token) {
//         const currentTime = Date.now() / 1000;
//         if (token.exp + 2 * 60 < currentTime) {
//           localStorage.removeItem('token');
//           setLoggedIn(false);
//         } else {
//           setLoggedIn(true);
//           setUser(token);
//         }
//       } else {
//         setLoggedIn(false);
//       }
//     } catch (e) {
//       localStorage.removeItem('token');
//       console.log(e);
//     }
//   }, [loggedIn]);

//   const login = (token) => {
//     localStorage.setItem('token', JSON.stringify(token));
//     setLoggedIn(true);
//     setUser(token);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setLoggedIn(false);
//     setUser(null);
//     navigate('/login');
//   };

//   if (loggedIn && !user) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <LoadingProvider />
//       </div>
//     );
//   }

//   return (
//     <LoginContext.Provider value={{ loggedIn, login, logout, user, setUser }}>
//       {children}
//     </LoginContext.Provider>
//   );
// };




// import React from "react";
// import { Loading } from '../components/icons/Loading'
// // import { createContext, useContext, useEffect, useState } from 'react'
// import { createContext, useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// const LoginContext = createContext()

// export const useLogin = () => useContext(LoginContext)

// export const LoginProvider = ({ children }) => {
//   const [loggedIn, setLoggedIn] = useState(true)
//   const [user, setUser] = useState(null)
//   const navigate = useNavigate()
//   useEffect(() => {
//     try {
//       const token = JSON.parse(localStorage.getItem('token'))
//       if (token) {
//         const currentTime = Date.now() / 1000
//         if (token.exp + 2 * 60 < currentTime) {
//           localStorage.removeItem('token')
//           setLoggedIn(false)
//         } else {
//           setLoggedIn(true)
//           setUser(token)
//         }
//       } else {
//         setLoggedIn(false)
//       }
//     } catch (e) {
//       localStorage.removeItem('token')
//       console.log(e)
//     }
//   }, [loggedIn])

//   const login = (token) => {
//     localStorage.setItem('token', JSON.stringify(token))
//     setLoggedIn(true)
//   }
//   const logout = () => {
//     localStorage.removeItem('token')
//     setLoggedIn(false)
//     setUser(null)
//     navigate('/login')
//   }
//   if (loggedIn && !user) {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <Loading />
//       </div>
//     )
//   }

//   return (
//     <LoginContext.Provider value={{ loggedIn, login, logout, user }}>
//       {children}
//     </LoginContext.Provider>
//   )
// }
