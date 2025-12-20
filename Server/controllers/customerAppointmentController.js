const Appointment = require('../models/appointment-model');
const Shop = require('../models/registerShop-model');
const TimeSlot = require('../models/timeSlot-model');

// Get customer appointments
exports.getCustomerAppointments = async (req, res) => {
  try {
    const { customerEmail } = req.params;
    
    if (!customerEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Customer email is required' 
      });
    }

    const aggregationPipeline = [
      {
        $match: { customerEmail: customerEmail }
      },
      {
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shopId'
        }
      },
      {
        $unwind: '$shopId'
      },
      {
        $lookup: {
          from: 'timeslots',
          localField: 'timeSlot',
          foreignField: '_id',
          as: 'timeSlot'
        }
      },
      {
        $unwind: '$timeSlot'
      },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimes.showtimeId',
          foreignField: '_id',
          as: 'populatedShowtimes'
        }
      },
      {
        $addFields: {
          // Create full address from shop details
          'shopId.fullAddress': {
            $concat: [
              { $ifNull: ['$shopId.street', ''] }, ', ',
              { $ifNull: ['$shopId.city', ''] },
              { $cond: { 
                if: { $and: ['$shopId.district', { $ne: ['$shopId.district', '$shopId.city'] }] }, 
                then: { $concat: [', ', '$shopId.district'] }, 
                else: '' 
              }},
              { $cond: { 
                if: '$shopId.state', 
                then: { $concat: [', ', '$shopId.state'] }, 
                else: '' 
              }},
              { $cond: { 
                if: '$shopId.pin', 
                then: { $concat: [' - ', '$shopId.pin'] }, 
                else: '' 
              }}
            ]
          },
          // Map showtimes with their populated data
          showtimes: {
            $map: {
              input: '$showtimes',
              as: 'st',
              in: {
                $mergeObjects: [
                  '$$st',
                  {
                    showtimeId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$populatedShowtimes',
                            as: 'pst',
                            cond: { $eq: ['$$pst._id', '$$st.showtimeId'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          populatedShowtimes: 0
        }
      },
      {
        $facet: {
          allAppointments: [
            { $sort: { bookedAt: -1 } }
          ]
        }
      }
    ];

    const result = await Appointment.aggregate(aggregationPipeline);
    const allAppointments = result[0]?.allAppointments || [];

    // Separate current and past appointments
    const currentAppointments = [];
    const pastAppointments = [];
    const now = new Date();

    allAppointments.forEach(appointment => {
      // Use the showtime date instead of timeSlot date for comparison
      const appointmentShowtime = appointment.showtimes && appointment.showtimes[0];
      const appointmentDate = appointmentShowtime?.date || appointment.timeSlot?.date;
      
      console.log('Processing appointment:', {
        timeSlotDate: appointment.timeSlot?.date,
        showtimeDate: appointmentShowtime?.date,
        appointmentDateUsed: appointmentDate,
        status: appointment.status
      });

      // If no date or cancelled, always go to past
      if (!appointmentDate || appointment.status === 'cancelled') {
        pastAppointments.push(appointment);
        return;
      }

      // Create date object for appointment date
      const appointmentDateTime = new Date(appointmentDate);
      
      console.log('Time comparison:', {
        currentTime: now.toLocaleString(),
        appointmentTime: appointmentDateTime.toLocaleString(),
        appointmentUTC: appointmentDateTime.toISOString(),
        isFuture: appointmentDateTime > now
      });

      // Simple comparison: if appointment datetime is in the future, it's current
      if (appointmentDateTime > now) {
        currentAppointments.push(appointment);
        console.log('-> Added to CURRENT appointments');
      } else {
        pastAppointments.push(appointment);
        console.log('-> Added to PAST appointments');
      }
    });

    console.log('Final Categorization:', {
      currentTime: now.toLocaleString(),
      currentCount: currentAppointments.length,
      pastCount: pastAppointments.length,
      currentAppointments: currentAppointments.map(a => ({
        date: a.showtimes?.[0]?.date || a.timeSlot?.date,
        time: a.showtimes?.[0]?.date ? new Date(a.showtimes[0].date).toLocaleTimeString() : 'N/A'
      }))
    });

    res.status(200).json({
      success: true,
      currentAppointments,
      pastAppointments,
      totalAppointments: allAppointments.length
    });

  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments' 
    });
  }
};



// Get detailed appointment information
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Appointment ID is required' 
      });
    }

    // Get basic appointment info
    const appointment = await Appointment.findById(appointmentId)
      .populate('shopId', 'shopname city address phone email services status')
      .populate('timeSlot', 'date showtimes');

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    // Enrich with showtime data
    const appointmentObj = appointment.toObject();
    
    if (appointmentObj.timeSlot && appointmentObj.timeSlot.showtimes) {
      appointmentObj.showtimes = appointmentObj.showtimes.map(showtime => {
        const matchedShowtime = appointmentObj.timeSlot.showtimes.find(
          st => st._id.toString() === showtime.showtimeId.toString()
        );
        
        return {
          ...showtime,
          showtimeData: matchedShowtime || null
        };
      });
    }

    res.status(200).json({
      success: true,
      appointment: appointmentObj
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment details' 
    });
  }
};

// Cancel appointment
const mongoose=require('mongoose');

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('=== CANCEL APPOINTMENT REQUEST ===');
    console.log('Appointment ID:', appointmentId);
    
    // Validate appointmentId format
    if (!appointmentId) {
      console.error('Error: Appointment ID is required');
      return res.status(400).json({ 
        success: false,
        message: 'Appointment ID is required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      console.error('Error: Invalid Appointment ID format:', appointmentId);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid appointment ID format' 
      });
    }

    // Find the appointment with timeSlot population
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'timeSlot',
        select: 'date showtimes'
      });

    if (!appointment) {
      console.error('Error: Appointment not found with ID:', appointmentId);
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    console.log('Appointment status:', appointment.status);
    
    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: 'Appointment is already cancelled' 
      });
    }

    // Check if appointment can be cancelled - use the ACTUAL appointment time
    let appointmentDateTime = null;
    
    if (appointment.showtimes && appointment.showtimes.length > 0) {
      // Use the actual showtime date (this is the correct appointment time)
      appointmentDateTime = new Date(appointment.showtimes[0].date);
    } else if (appointment.timeSlot?.date) {
      // Fallback to timeSlot date if showtime date not available
      appointmentDateTime = new Date(appointment.timeSlot.date);
    }
    
    console.log('Appointment date/time:', appointmentDateTime);
    
    if (appointmentDateTime) {
      const now = new Date();
      
      console.log('Current time:', now);
      console.log('Appointment time:', appointmentDateTime);
      console.log('Time difference (hours):', (appointmentDateTime - now) / (1000 * 60 * 60));
      console.log('Is appointment in past?', appointmentDateTime < now);
      
      // Allow cancellation up to 1 hour before appointment
      const timeDifference = appointmentDateTime - now;
      const oneHourInMs = 60 * 60 * 1000;
      
      if (timeDifference < oneHourInMs) {
        return res.status(400).json({ 
          success: false,
          message: `Cannot cancel appointment less than 1 hour before scheduled time`
        });
      }
      
      // Optional: Also check if it's in the past (for safety)
      if (appointmentDateTime < now) {
        return res.status(400).json({ 
          success: false,
          message: 'Cannot cancel past appointments' 
        });
      }
    }

    // Free up the showtime slot if it exists
    if (appointment.timeSlot && appointment.showtimes && appointment.showtimes.length > 0) {
      console.log('Freeing up showtime slot...');
      const showtimeId = appointment.showtimes[0].showtimeId;
      console.log('Showtime ID to free:', showtimeId);
      
      const showtime = appointment.timeSlot.showtimes.id(showtimeId);
      console.log('Found showtime:', showtime);
      
      if (showtime) {
        console.log('Previous is_booked status:', showtime.is_booked);
        showtime.is_booked = false;
        console.log('New is_booked status:', showtime.is_booked);
        
        // Mark the document as modified
        appointment.timeSlot.markModified('showtimes');
        await appointment.timeSlot.save();
        console.log('TimeSlot saved successfully');
      } else {
        console.warn('Warning: Showtime not found in timeSlot');
      }
    } else {
      console.warn('Warning: No timeSlot or showtimes found for appointment');
    }

    // Mark appointment as cancelled
    console.log('Previous appointment status:', appointment.status);
    appointment.status = 'cancelled';
    await appointment.save();
    console.log('Appointment saved with cancelled status');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        customerEmail: appointment.customerEmail,
        shopId: appointment.shopId
      }
    });

    console.log('=== APPOINTMENT CANCELLED SUCCESSFULLY ===');

  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const { customerEmail } = req.params;

    if (!customerEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Customer email is required' 
      });
    }

    const appointments = await Appointment.find({ customerEmail });

    const now = new Date();
    const stats = {
      total: appointments.length,
      upcoming: appointments.filter(apt => 
        apt.timeSlot && new Date(apt.timeSlot.date) >= now && apt.status !== 'cancelled'
      ).length,
      completed: appointments.filter(apt => 
        apt.timeSlot && new Date(apt.timeSlot.date) < now && apt.status !== 'cancelled'
      ).length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      pending: appointments.filter(apt => apt.status === 'pending').length
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment statistics' 
    });
  }
};





// // Get customer appointments
// exports.getCustomerAppointments = async (req, res) => {
//   try {
//     const { customerEmail } = req.params;
    
//     if (!customerEmail) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Customer email is required' 
//       });
//     }

//     const appointments = await Appointment.find({ customerEmail })
//       .populate('shopId', 'shopname city address phone email services')
//       .populate('timeSlot', 'date')
//       .populate('showtimes.showtimeId', 'date is_booked')
//       .sort({ bookedAt: -1 });

//     // Separate current and past appointments
//     const currentAppointments = [];
//     const pastAppointments = [];

//     const now = new Date();
    
//     appointments.forEach(appointment => {
//       const appointmentDate = appointment.timeSlot?.date;
//       if (appointmentDate && new Date(appointmentDate) >= now && appointment.status !== 'cancelled') {
//         currentAppointments.push(appointment);
//       } else {
//         pastAppointments.push(appointment);
//       }
//     });

//     res.status(200).json({
//       success: true,
//       currentAppointments,
//       pastAppointments,
//       totalAppointments: appointments.length
//     });

//   } catch (error) {
//     console.error('Error fetching customer appointments:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch appointments' 
//     });
//   }
// };

// // Cancel appointment
// exports.cancelAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.params;

//     if (!appointmentId) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Appointment ID is required' 
//       });
//     }

//     const appointment = await Appointment.findById(appointmentId)
//       .populate('timeSlot');

//     if (!appointment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Appointment not found' 
//       });
//     }

//     // Check if appointment can be cancelled (should be in future)
//     const appointmentDate = appointment.timeSlot?.date;
//     if (appointmentDate && new Date(appointmentDate) < new Date()) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Cannot cancel past appointments' 
//       });
//     }

//     // Free up the showtime slot
//     if (appointment.timeSlot && appointment.showtimes.length > 0) {
//       const showtimeId = appointment.showtimes[0].showtimeId;
//       const showtime = appointment.timeSlot.showtimes.id(showtimeId);
      
//       if (showtime) {
//         showtime.is_booked = false;
//         await appointment.timeSlot.save();
//       }
//     }

//     // Mark appointment as cancelled
//     appointment.status = 'cancelled';
//     await appointment.save();

//     res.status(200).json({
//       success: true,
//       message: 'Appointment cancelled successfully',
//       appointment
//     });

//   } catch (error) {
//     console.error('Error cancelling appointment:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to cancel appointment' 
//     });
//   }
// };

// // Get appointment details
// exports.getAppointmentDetails = async (req, res) => {
//   try {
//     const { appointmentId } = req.params;

//     if (!appointmentId) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Appointment ID is required' 
//       });
//     }

//     const appointment = await Appointment.findById(appointmentId)
//       .populate('shopId', 'shopname city address phone email services')
//       .populate('timeSlot', 'date')
//       .populate('showtimes.showtimeId', 'date is_booked');

//     if (!appointment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Appointment not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       appointment
//     });

//   } catch (error) {
//     console.error('Error fetching appointment details:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch appointment details' 
//     });
//   }
// };

// // Reschedule appointment
// exports.rescheduleAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.params;
//     const { newTimeSlotId, newShowtimeId, newDate } = req.body;

//     if (!appointmentId || !newTimeSlotId || !newShowtimeId || !newDate) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'All fields are required for rescheduling' 
//       });
//     }

//     // Find the existing appointment
//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Appointment not found' 
//       });
//     }

//     // Free up the old showtime slot
//     const oldTimeSlot = await TimeSlot.findById(appointment.timeSlot);
//     if (oldTimeSlot && appointment.showtimes.length > 0) {
//       const oldShowtimeId = appointment.showtimes[0].showtimeId;
//       const oldShowtime = oldTimeSlot.showtimes.id(oldShowtimeId);
      
//       if (oldShowtime) {
//         oldShowtime.is_booked = false;
//         await oldTimeSlot.save();
//       }
//     }

//     // Check if new showtime is available
//     const newTimeSlot = await TimeSlot.findById(newTimeSlotId);
//     if (!newTimeSlot) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'New time slot not found' 
//       });
//     }

//     const newShowtime = newTimeSlot.showtimes.id(newShowtimeId);
//     if (!newShowtime || newShowtime.is_booked) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Selected time slot is not available' 
//       });
//     }

//     // Book the new showtime
//     newShowtime.is_booked = true;
//     await newTimeSlot.save();

//     // Update appointment with new details
//     appointment.timeSlot = newTimeSlotId;
//     appointment.showtimes = [{
//       date: new Date(newDate),
//       showtimeId: newShowtimeId
//     }];
//     await appointment.save();

//     // Populate the updated appointment for response
//     const updatedAppointment = await Appointment.findById(appointmentId)
//       .populate('shopId', 'shopname city address phone email services')
//       .populate('timeSlot', 'date')
//       .populate('showtimes.showtimeId', 'date is_booked');

//     res.status(200).json({
//       success: true,
//       message: 'Appointment rescheduled successfully',
//       appointment: updatedAppointment
//     });

//   } catch (error) {
//     console.error('Error rescheduling appointment:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to reschedule appointment' 
//     });
//   }
// };

// // Get appointment statistics
// exports.getAppointmentStats = async (req, res) => {
//   try {
//     const { customerEmail } = req.params;

//     if (!customerEmail) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Customer email is required' 
//       });
//     }

//     const appointments = await Appointment.find({ customerEmail });

//     const now = new Date();
//     const stats = {
//       total: appointments.length,
//       upcoming: appointments.filter(apt => 
//         apt.timeSlot && new Date(apt.timeSlot.date) >= now && apt.status !== 'cancelled'
//       ).length,
//       completed: appointments.filter(apt => 
//         apt.timeSlot && new Date(apt.timeSlot.date) < now && apt.status !== 'cancelled'
//       ).length,
//       cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
//       pending: appointments.filter(apt => apt.status === 'pending').length
//     };

//     res.status(200).json({
//       success: true,
//       stats
//     });

//   } catch (error) {
//     console.error('Error fetching appointment stats:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch appointment statistics' 
//     });
//   }
// };

