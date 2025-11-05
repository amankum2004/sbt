import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Swal from 'sweetalert2';
import { useLogin } from '../components/LoginContext'; // Import the context

const ShopStatusButton = ({ shopId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const { refreshShopData } = useLogin(); // Get refresh function from context

  const statusConfig = {
    open: {
      label: 'Open',
      color: 'bg-green-500 hover:bg-green-600',
      text: 'text-white',
      icon: '✅',
      confirmColor: '#10B981' // Green
    },
    break: {
      label: 'On Break',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      text: 'text-white',
      icon: '⏸️',
      confirmColor: '#F59E0B' // Yellow
    },
    closed: {
      label: 'Closed',
      color: 'bg-red-500 hover:bg-red-600',
      text: 'text-white',
      icon: '❌',
      confirmColor: '#EF4444' // Red
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);

      const config = statusConfig[newStatus];
      
      const result = await Swal.fire({
        title: 'Change Shop Status?',
        text: `Are you sure you want to set your shop status to "${newStatus}"? This will notify customers with upcoming appointments.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: config.confirmColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, set to ${newStatus}`,
        cancelButtonText: 'Cancel',
         reverseButtons: true // Add this line to swap button positions
      });

      if (result.isConfirmed) {
        const response = await api.put(`/shop/${shopId}/status`, { status: newStatus });
        
        if (response.data.success) {
          // Update local state
          setStatus(newStatus);
          
          // Refresh shop data in context to get updated status
          await refreshShopData();
          
          Swal.fire({
            title: 'Success!',
            text: `Shop status updated to ${newStatus}`,
            icon: 'success',
            confirmButtonText: 'OK',
            reverseButtons: true // Also add to success popup for consistency
          });
        }
      }
    } catch (error) {
      console.error('Error updating shop status:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update status',
        icon: 'error',
        confirmButtonText: 'OK',
        reverseButtons: true // Also add to success popup for consistency
      });
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = statusConfig[status] || statusConfig.closed;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">Shop Status</h3> */}
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusConfig).map(([statusKey, config]) => (
          <button
            key={statusKey}
            onClick={() => updateStatus(statusKey)}
            disabled={loading || status === statusKey}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              status === statusKey 
                ? `${config.color} ${config.text} ring-2 ring-offset-2 ring-opacity-50`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="mr-2">{config.icon}</span>
            {config.label}
            {status === statusKey && (
              <span className="ml-2 text-sm">✓</span>
            )}
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Current status: <span className="font-medium capitalize">{status}</span>
      </p>
      
      {loading && (
        <p className="text-sm text-blue-500 mt-2">Updating status...</p>
      )}
    </div>
  );
};

export default ShopStatusButton;





// import React, { useState, useEffect } from 'react';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';

// const ShopStatusButton = ({ shopId, currentStatus }) => {
//   const [status, setStatus] = useState(currentStatus);
//   const [loading, setLoading] = useState(false);

//   const statusConfig = {
//     open: {
//       label: 'Open',
//       color: 'bg-green-500 hover:bg-green-600',
//       text: 'text-white',
//       icon: '✅',
//       confirmColor: '#10B981' // Green
//     },
//     closed: {
//       label: 'Closed',
//       color: 'bg-red-500 hover:bg-red-600',
//       text: 'text-white',
//       icon: '❌',
//       confirmColor: '#EF4444' // Red
//     },
//     break: {
//       label: 'On Break',
//       color: 'bg-yellow-500 hover:bg-yellow-600',
//       text: 'text-white',
//       icon: '⏸️',
//       confirmColor: '#F59E0B' // Yellow
//     }
//   };

//   const updateStatus = async (newStatus) => {
//     try {
//       setLoading(true);
      
//       const config = statusConfig[newStatus];
      
//       const result = await Swal.fire({
//         title: 'Change Shop Status?',
//         html: `
//           <div class="text-center">
//             <div class="text-4xl mb-3">${config.icon}</div>
//             <p class="text-gray-700 text-lg font-semibold mb-2">Set shop status to "${config.label}"?</p>
//             <p class="text-gray-600 text-sm">This will notify customers with upcoming appointments about your shop's availability.</p>
//           </div>
//         `,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: config.confirmColor,
//         cancelButtonColor: '#6B7280',
//         confirmButtonText: `Yes, set to ${config.label}`,
//         cancelButtonText: 'Cancel',
//         reverseButtons: true,
//         customClass: {
//           popup: 'rounded-2xl',
//           confirmButton: 'px-6 py-3 rounded-xl font-medium',
//           cancelButton: 'px-6 py-3 rounded-xl font-medium'
//         },
//         buttonsStyling: false,
//         showClass: {
//           popup: 'animate__animated animate__fadeInDown'
//         },
//         hideClass: {
//           popup: 'animate__animated animate__fadeOutUp'
//         }
//       });

//       if (result.isConfirmed) {
//         const response = await api.put(`/shop/${shopId}/status`, { status: newStatus });
        
//         if (response.data.success) {
//           setStatus(newStatus);
//           Swal.fire({
//             title: 'Success!',
//             text: `Shop status updated to ${newStatus}`,
//             icon: 'success',
//             confirmButtonColor: config.confirmColor,
//             confirmButtonText: 'OK',
//             customClass: {
//               popup: 'rounded-2xl',
//               confirmButton: 'px-6 py-3 rounded-xl font-medium'
//             },
//             buttonsStyling: false
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error updating shop status:', error);
//       Swal.fire({
//         title: 'Error!',
//         text: error.response?.data?.message || 'Failed to update status. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#EF4444',
//         confirmButtonText: 'OK',
//         customClass: {
//           popup: 'rounded-2xl',
//           confirmButton: 'px-6 py-3 rounded-xl font-medium'
//         },
//         buttonsStyling: false
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const currentConfig = statusConfig[status] || statusConfig.closed;

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//         <span className="text-xl">🏪</span>
//         Shop Status
//       </h3>
      
//       <div className="flex flex-wrap gap-3 mb-4">
//         {Object.entries(statusConfig).map(([statusKey, config]) => (
//           <button
//             key={statusKey}
//             onClick={() => updateStatus(statusKey)}
//             disabled={loading || status === statusKey}
//             className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
//               status === statusKey 
//                 ? `${config.color} ${config.text} ring-2 ring-offset-2 ring-opacity-50 shadow-lg transform scale-105`
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:-translate-y-1'
//             } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} min-w-[120px] justify-center`}
//           >
//             <span className="mr-2 text-lg">{config.icon}</span>
//             {config.label}
//             {status === statusKey && (
//               <span className="ml-2 text-sm">✓</span>
//             )}
//           </button>
//         ))}
//       </div>
      
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-600">
//           Current status: <span className="font-semibold capitalize text-gray-800">{status}</span>
//         </p>
        
//         {loading && (
//           <div className="flex items-center gap-2 text-blue-500 text-sm">
//             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             Updating...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ShopStatusButton;



// import React, { useState } from 'react';
// import { api } from '../utils/api';
// import Swal from 'sweetalert2';

// const ShopStatusButton = ({ shopId, currentStatus, onStatusUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState(currentStatus);

//   const getStatusConfig = (status) => {
//     const config = {
//       open: {
//         text: 'Open',
//         color: 'bg-green-500 hover:bg-green-600',
//         nextStatus: 'closed',
//         nextText: 'Close Shop'
//       },
//       closed: {
//         text: 'Closed',
//         color: 'bg-red-500 hover:bg-red-600',
//         nextStatus: 'open',
//         nextText: 'Open Shop'
//       },
//       busy: {
//         text: 'Busy',
//         color: 'bg-yellow-500 hover:bg-yellow-600',
//         nextStatus: 'open',
//         nextText: 'Mark as Open'
//       },
//       break: {
//         text: 'On Break',
//         color: 'bg-blue-500 hover:bg-blue-600',
//         nextStatus: 'open',
//         nextText: 'Back to Work'
//       }
//     };
//     return config[status] || config.closed;
//   };

//   const updateShopStatus = async (newStatus) => {
//     if (loading) return;

//     try {
//       setLoading(true);
      
//       // Show confirmation dialog with BOTH buttons
//       const result = await Swal.fire({
//         title: `Change shop status?`,
//         html: `
//           <div class="text-center">
//             <div class="text-4xl mb-4">🔄</div>
//             <p class="text-gray-700 mb-2">Are you sure you want to change your shop status?</p>
//             <div class="flex justify-center items-center gap-2 mb-4">
//               <span class="px-3 py-1 rounded-full bg-gray-200 text-gray-800 font-medium">${status}</span>
//               <span class="text-gray-500">→</span>
//               <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">${newStatus}</span>
//             </div>
//           </div>
//         `,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonText: `Yes, change to ${newStatus}`,
//         cancelButtonText: 'Cancel',
//         confirmButtonColor: '#10B981',
//         cancelButtonColor: '#6B7280',
//         reverseButtons: true,
//         customClass: {
//           popup: 'rounded-2xl',
//           confirmButton: 'px-6 py-3 rounded-xl font-medium text-sm',
//           cancelButton: 'px-6 py-3 rounded-xl font-medium text-sm'
//         },
//         buttonsStyling: false,
//         showClass: {
//           popup: 'animate__animated animate__fadeInDown'
//         },
//         hideClass: {
//           popup: 'animate__animated animate__fadeOutUp'
//         }
//       });

//       if (result.isConfirmed) {
//         const response = await api.put(`/shop/update-status/${shopId}`, {
//           status: newStatus
//         });

//         if (response.data.success) {
//           setStatus(newStatus);
//           if (onStatusUpdate) {
//             onStatusUpdate(newStatus);
//           }
          
//           Swal.fire({
//             title: 'Status Updated!',
//             text: `Your shop status has been changed to ${newStatus}`,
//             icon: 'success',
//             confirmButtonColor: '#10B981',
//             timer: 2000,
//             showConfirmButton: false,
//             customClass: {
//               popup: 'rounded-2xl'
//             }
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Failed to update shop status:', error);
//       Swal.fire({
//         title: 'Update Failed!',
//         text: 'Failed to update shop status. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#EF4444',
//         customClass: {
//           popup: 'rounded-2xl',
//           confirmButton: 'px-6 py-3 rounded-xl font-medium text-sm'
//         },
//         buttonsStyling: false
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getNextStatus = (currentStatus) => {
//     const config = getStatusConfig(currentStatus);
//     return config.nextStatus;
//   };

//   const getNextStatusText = (currentStatus) => {
//     const config = getStatusConfig(currentStatus);
//     return config.nextText;
//   };

//   const config = getStatusConfig(status);

//   return (
//     <div className="flex flex-col sm:flex-row items-center gap-3">
//       {/* Current Status Badge */}
//       <div className={`px-4 py-2 rounded-full text-white font-semibold text-sm ${config.color} transition-colors duration-200 min-w-[100px] text-center`}>
//         {loading ? (
//           <div className="flex items-center justify-center gap-2">
//             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//             Updating...
//           </div>
//         ) : (
//           config.text
//         )}
//       </div>

//       {/* Toggle Button */}
//       <button
//         onClick={() => updateShopStatus(getNextStatus(status))}
//         disabled={loading}
//         className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none min-w-[120px] justify-center"
//       >
//         {loading ? (
//           <>
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             Updating...
//           </>
//         ) : (
//           getNextStatusText(status)
//         )}
//       </button>
//     </div>
//   );
// };

// export default ShopStatusButton;











