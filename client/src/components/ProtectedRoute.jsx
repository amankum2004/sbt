import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from './LoginContext';
import { LoadingSpinner } from './Loading';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { loggedIn, user, isInitializing } = useLogin();
  
  // Show loading while checking auth
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!loggedIn) {
    console.log('ProtectedRoute: Not logged in, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check user type if required
  if (requiredUserType && user?.usertype !== requiredUserType) {
    console.log(`ProtectedRoute: User type ${user?.usertype} does not match required ${requiredUserType}`);
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;
