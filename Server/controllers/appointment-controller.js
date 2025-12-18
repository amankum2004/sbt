// const Appointment = require('../models/appointment-model');
// const TimeSlot = require('../models/timeSlot-model');
// const mongoose = require('mongoose');

// exports.bookAppointment = async (shopId, timeSlotId, showtimeId, date, customerEmail, userId, serviceInfo, totalAmount) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const timeSlot = await TimeSlot.findById(timeSlotId).session(session);
//     console.log('Found TimeSlot:', timeSlot);
    
//     if (!timeSlot) {
//       throw new Error("Invalid TimeSlot ID");
//     }

//     const showtime = timeSlot.showtimes.id(showtimeId);
//     if (!showtime || showtime.is_booked) {
//       throw new Error("Showtime is either booked or invalid");
//     }

//     // Extract service information
//     console.log('Service Info received:', serviceInfo);
    
//     let serviceName = 'General Service';
//     let servicePrice = totalAmount || 0;

//     if (serviceInfo && typeof serviceInfo === 'object') {
//       if (serviceInfo.service) {
//         serviceName = serviceInfo.service;
//       }
//       if (serviceInfo.price) {
//         servicePrice = parseInt(serviceInfo.price);
//       } else if (serviceInfo.service && serviceInfo.service !== 'General Service') {
//         // Try to extract price from the service string if it exists
//         const priceMatch = String(serviceInfo.service).match(/\d+/);
//         if (priceMatch) {
//           servicePrice = parseInt(priceMatch[0]);
//         }
//       }
//     }

//     console.log('Final service details:', { serviceName, servicePrice });

//     // Create Appointment
//     const appointment = new Appointment({
//       customerEmail,
//       userId,
//       shopId,
//       timeSlot: timeSlotId,
//       showtimes: [{ 
//         date: new Date(date), 
//         showtimeId: showtimeId,
//         service: {
//           name: serviceName,
//           price: servicePrice
//         }
//       }],
//       totalAmount: servicePrice,
//       bookedAt: new Date()
//     });

//     // Validate before saving
//     const validationError = appointment.validateSync();
//     if (validationError) {
//       throw new Error(`Appointment validation failed: ${validationError.message}`);
//     }

//     // Mark showtime as booked
//     showtime.is_booked = true;
    
//     // Save both within transaction
//     await timeSlot.save({ session });
//     await appointment.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     console.log('Appointment created successfully:', appointment);
//     return appointment;

//   } catch (error) {
//     // Abort transaction on error
//     await session.abortTransaction();
//     session.endSession();
    
//     console.error("Error in bookAppointment:", error);
//     throw error;
//   }
// };

const Appointment = require('../models/appointment-model');
const TimeSlot = require('../models/timeSlot-model');
const mongoose = require('mongoose');

exports.bookAppointment = async (shopId, timeSlotId, showtimeId, date, customerEmail, userId, serviceInfo, totalAmount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Booking parameters:', {
      timeSlotId,
      showtimeId,
      date,
      customerEmail,
      userId,
      serviceInfo,
      totalAmount
    });

    // Find the time slot
    const timeSlot = await TimeSlot.findById(timeSlotId).session(session);
    console.log('Found TimeSlot ID:', timeSlot?._id);
    console.log('TimeSlot showtimes count:', timeSlot?.showtimes?.length);
    
    if (!timeSlot) {
      throw new Error("Invalid TimeSlot ID");
    }

    // Debug: Log all showtime IDs
    if (timeSlot.showtimes) {
      console.log('Available showtime IDs in TimeSlot:');
      timeSlot.showtimes.forEach((st, index) => {
        console.log(`  [${index}] ID: ${st._id}, Date: ${st.date}, Booked: ${st.is_booked}`);
      });
    }

    // Find the specific showtime
    const showtime = timeSlot.showtimes.find(st => 
      st._id && st._id.toString() === showtimeId.toString()
    );

    console.log('Looking for showtimeId:', showtimeId);
    console.log('Found showtime:', showtime);
    
    if (!showtime) {
      throw new Error(`Showtime not found. Looking for ID: ${showtimeId}`);
    }

    if (showtime.is_booked) {
      throw new Error("Showtime is already booked");
    }

    // Extract service information
    console.log('Service Info received:', serviceInfo);
    
    let serviceName = 'General Service';
    let servicePrice = totalAmount || 0;

    if (serviceInfo && typeof serviceInfo === 'object') {
      if (serviceInfo.service) {
        serviceName = serviceInfo.service;
      }
      if (serviceInfo.price) {
        servicePrice = parseInt(serviceInfo.price);
      } else if (serviceInfo.service && serviceInfo.service !== 'General Service') {
        // Try to extract price from the service string if it exists
        const priceMatch = String(serviceInfo.service).match(/\d+/);
        if (priceMatch) {
          servicePrice = parseInt(priceMatch[0]);
        }
      }
    }

    console.log('Final service details:', { serviceName, servicePrice });

    // Create Appointment
    const appointment = new Appointment({
      customerEmail,
      userId,
      shopId,
      timeSlot: timeSlotId,
      showtimes: [{ 
        date: new Date(date), 
        showtimeId: showtime._id, // Use the actual showtime ID from the document
        service: {
          name: serviceName,
          price: servicePrice
        }
      }],
      totalAmount: servicePrice,
      bookedAt: new Date()
    });

    // Validate before saving
    const validationError = appointment.validateSync();
    if (validationError) {
      throw new Error(`Appointment validation failed: ${validationError.message}`);
    }

    // Mark showtime as booked
    console.log('Before marking as booked:', showtime.is_booked);
    showtime.is_booked = true;
    console.log('After marking as booked:', showtime.is_booked);
    
    // Mark the time slot as modified
    timeSlot.markModified('showtimes');
    
    // Save both within transaction
    await timeSlot.save({ session });
    await appointment.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    console.log('Appointment created successfully:', appointment._id);
    console.log('TimeSlot updated successfully. Showtimes status:');
    const updatedTimeSlot = await TimeSlot.findById(timeSlotId);
    updatedTimeSlot.showtimes.forEach((st, index) => {
      console.log(`  [${index}] ID: ${st._id}, Booked: ${st.is_booked}`);
    });
    
    return appointment;

  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error in bookAppointment:", error);
    throw error;
  }
};


