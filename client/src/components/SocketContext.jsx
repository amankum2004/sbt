// import React, { createContext, useContext, useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import { useLogin } from './LoginContext';

// const SocketContext = createContext();

// export const useSocket = () => {
//   return useContext(SocketContext);
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useLogin();

//   useEffect(() => {
//         console.log('SocketProvider: User changed', { user: user?.email, userId: user?._id });
//     // Determine the server URL based on environment
    
//     if (user && user._id) {
//       const serverUrl = process.env.NODE_ENV === 'production' 
//         ? 'https://www.salonhub.co.in'
//         : 'http://localhost:8000';


//       console.log('Initializing socket connection for user:', user._id, 'to server:', serverUrl);
      
//       const newSocket = io(serverUrl, {
//         withCredentials: true,
//         transports: ['websocket', 'polling']
//       });

      
//       // Join with user ID
//       newSocket.emit('user_join', user._id);
//       console.log('Emitted user_join for:', user._id);

      

//       // Listen for shop status notifications
//       newSocket.on('shop_status_notification', (data) => {
//         console.log('Received shop status notification:', data);
//         setNotifications(prev => [data, ...prev.slice(0, 4)]); // Keep only last 5 notifications
        
//         // Show browser notification if permission is granted
//         if ('Notification' in window && Notification.permission === 'granted') {
//           new Notification('Shop Status Update', {
//             body: data.message,
//             icon: '/favicon.ico'
//           });
//         }

//         // Auto-remove notification after 10 seconds
//         setTimeout(() => {
//           setNotifications(prev => prev.filter(n => n.timestamp !== data.timestamp));
//         }, 10000);
//       });

//       // Listen for appointment updates
//       newSocket.on('appointment_status_changed', (data) => {
//         console.log('Appointment status changed:', data);
//         // Handle appointment status changes if needed
//       });

//       newSocket.on('connect', () => {
//         console.log('Connected to server with socket ID:', newSocket.id);
//       });

//       newSocket.on('disconnect', () => {
//         console.log('Disconnected from server');
//       });

//       newSocket.on('error', (error) => {
//         console.error('Socket error:', error);
//       });

//       setSocket(newSocket);

//       return () => {
//         newSocket.close();
//       };
//     }
//   }, [user]);

//   const clearNotification = (timestamp) => {
//     setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
//   };

//   const clearAllNotifications = () => {
//     setNotifications([]);
//   };

//   return (
//     <SocketContext.Provider value={{ 
//       socket, 
//       notifications, 
//       clearNotification,
//       clearAllNotifications
//     }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };