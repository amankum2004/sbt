import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingProvider, LoadingSpinner } from './Loading';
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
        <LoadingSpinner size="xl" />
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




