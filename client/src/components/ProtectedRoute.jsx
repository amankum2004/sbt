// components/ProtectedRoute.js
import React from 'react';
import { useLogin } from './LoginContext'; 
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useLogin();
  const location = useLocation();

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Store the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Add token expiration check here if you have JWT tokens
  // if (user.token && isTokenExpired(user.token)) {
  //   return <Navigate to="/login" state={{ from: location, sessionExpired: true }} replace />;
  // }

  return children;
};

export default ProtectedRoute;