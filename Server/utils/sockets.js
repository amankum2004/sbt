// // utils/socket.js
// const socketIo = require('socket.io');
// const mongoose = require('mongoose');

// // Store connected users
// const connectedUsers = new Map();

// const initializeSocket = (server) => {
//   const io = socketIo(server, {
//     cors: {
//       origin: process.env.NODE_ENV === 'production' 
//         ? ['https://salonbookingtime.vercel.app', 'https://www.salonhub.co.in']
//         : ['http://localhost:5173', 'http://localhost:8000'],
//       methods: ["GET", "POST"],
//       credentials: true
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     // User joins with their user ID
//     socket.on('user_join', (userId) => {
//       if (userId) {
//         connectedUsers.set(userId, socket.id);
//         console.log(`User ${userId} connected with socket ${socket.id}`);
//       }
//     });

//     // Shop owner sends status update
//     socket.on('shop_status_update', async (data) => {
//       try {
//         const { shopId, status, message, shopOwnerId } = data;
//         console.log('Shop status update received:', { shopId, status });
        
//         // Broadcast to all customers of this shop
//         const customers = await getShopCustomers(shopId);
        
//         customers.forEach(customer => {
//           const customerSocketId = connectedUsers.get(customer.userId);
//           if (customerSocketId) {
//             io.to(customerSocketId).emit('shop_status_notification', {
//               shopId,
//               status,
//               message,
//               shopName: data.shopName,
//               timestamp: new Date()
//             });
//           }
//         });

//         console.log(`Shop status updated: ${status} for shop ${shopId}. Notified ${customers.length} customers.`);
//       } catch (error) {
//         console.error('Error sending shop status update:', error);
//       }
//     });

//     // Handle appointment updates
//     socket.on('appointment_update', (data) => {
//       const { customerId, appointmentId, status } = data;
//       const customerSocketId = connectedUsers.get(customerId);
      
//       if (customerSocketId) {
//         io.to(customerSocketId).emit('appointment_status_changed', {
//           appointmentId,
//           status,
//           timestamp: new Date()
//         });
//       }
//     });

//     socket.on('disconnect', () => {
//       // Remove user from connected users
//       for (let [userId, socketId] of connectedUsers.entries()) {
//         if (socketId === socket.id) {
//           connectedUsers.delete(userId);
//           console.log(`User ${userId} disconnected`);
//           break;
//         }
//       }
//       console.log('User disconnected:', socket.id);
//     });
//   });

//   return io;
// };

// // Function to get all customers with future appointments for a shop
// async function getShopCustomers(shopId) {
//   try {
//     const Appointment = mongoose.model('Appointment');
//     const appointments = await Appointment.find({
//       shopId: shopId,
//       status: { $in: ['confirmed', 'pending'] },
//       'timeSlot.date': { $gte: new Date() }
//     }).populate('userId', '_id email name');

//     // Get unique customers
//     const uniqueCustomers = [];
//     const customerIds = new Set();

//     appointments.forEach(appointment => {
//       if (appointment.userId && !customerIds.has(appointment.userId._id.toString())) {
//         customerIds.add(appointment.userId._id.toString());
//         uniqueCustomers.push({
//           userId: appointment.userId._id.toString(),
//           email: appointment.userId.email,
//           name: appointment.userId.name
//         });
//       }
//     });

//     return uniqueCustomers;
//   } catch (error) {
//     console.error('Error getting shop customers:', error);
//     return [];
//   }
// }

// module.exports = { initializeSocket, connectedUsers };