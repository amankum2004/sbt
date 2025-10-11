// import React from 'react';
// import { useSocket } from './SocketContext';

// const CustomerNotifications = () => {
//   const { notifications, clearNotification, isConnected } = useSocket();

//   console.log('CustomerNotifications Debug:', {
//     isConnected,
//     notificationCount: notifications?.length,
//     notifications
//   });

//   if (!notifications || notifications.length === 0) {
//     return null;
//   }

//   return (
//     <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
//       {notifications.map((notification) => (
//         <div
//           key={notification.id || notification.timestamp}
//           className="bg-white border-l-4 border-blue-500 shadow-lg rounded-lg p-4 animate-fade-in"
//         >
//           <div className="flex items-start justify-between">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 text-lg mr-3">
//                 {notification.status === 'open' && '🎉'}
//                 {notification.status === 'closed' && '⚠️'}
//                 {notification.status === 'busy' && '⏳'}
//                 {notification.status === 'break' && '☕'}
//                 {!notification.status && '📢'}
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-900">
//                   {notification.shopName || 'Shop'} Status Update
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {notification.message}
//                 </p>
//                 <p className="text-xs text-gray-400 mt-2">
//                   {new Date(notification.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => clearNotification(notification.id || notification.timestamp)}
//               className="ml-4 text-gray-400 hover:text-gray-600 text-lg"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CustomerNotifications;