import React, { createContext, useContext } from 'react';
import Swal from 'sweetalert2';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const showLoading = (message = 'Please wait...') => {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const hideLoading = () => {
    Swal.close();
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);



// // components/LoadingSpinner.js
// import React from 'react';

// const LoadingSpinner = ({ size = 'medium' }) => {
//   const sizes = {
//     small: 'w-4 h-4',
//     medium: 'w-8 h-8',
//     large: 'w-12 h-12'
//   };

//   return (
//     <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`}></div>
//   );
// };

// export default LoadingSpinner;