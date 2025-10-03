const Appointment = require('../models/appointment-model');
const Shop = require('../models/registerShop-model');
const TimeSlot = require('../models/timeSlot-model');
const User = require('../models/user/user-model');
const mongoose = require('mongoose');

// Get all appointments for barber's shop
// exports.getBarberAppointments = async (req, res) => {
//   try {
//     const { shopId } = req.params;
    
//     console.log('=== SIMPLE QUERY ===');
//     console.log('ShopId:', shopId);

//     // Simple query without complex population that might fail
//     const appointments = await Appointment.find({ shopId: shopId })
//       .populate('shopId', 'shopname city address')
//       .populate('userId', 'name email phone')
//       .lean(); // Use lean() for better performance

//     console.log('Found appointments:', appointments.length);

//     // If we have appointments but no timeSlot data, fetch it separately
//     const appointmentsWithTimeSlots = await Promise.all(
//       appointments.map(async (apt) => {
//         if (apt.timeSlot) {
//           const timeSlot = await TimeSlot.findById(apt.timeSlot).select('date').lean();
//           return {
//             ...apt,
//             timeSlot: timeSlot
//           };
//         }
//         return apt;
//       })
//     );

//     // Separate current and past appointments
//     const now = new Date();
//     const currentAppointments = [];
//     const pastAppointments = [];

//     appointmentsWithTimeSlots.forEach(appointment => {
//       const appointmentDate = appointment.timeSlot?.date;
      
//       if (appointmentDate && new Date(appointmentDate) >= now && appointment.status !== 'cancelled') {
//         currentAppointments.push(appointment);
//       } else {
//         pastAppointments.push(appointment);
//       }
//     });

//     // Sort by date
//     currentAppointments.sort((a, b) => new Date(a.timeSlot?.date) - new Date(b.timeSlot?.date));
//     pastAppointments.sort((a, b) => new Date(b.timeSlot?.date) - new Date(a.timeSlot?.date));

//     const stats = {
//       total: appointments.length,
//       upcoming: currentAppointments.length,
//       completed: pastAppointments.filter(apt => apt.status !== 'cancelled').length,
//       cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
//       today: appointments.filter(apt => {
//         const aptDate = apt.timeSlot?.date;
//         return aptDate && 
//                new Date(aptDate).toDateString() === now.toDateString() && 
//                apt.status !== 'cancelled';
//       }).length
//     };

//     const shop = await Shop.findById(shopId);

//     res.status(200).json({
//       success: true,
//       currentAppointments,
//       pastAppointments,
//       stats,
//       shop: shop ? {
//         name: shop.shopname,
//         city: shop.city,
//         address: shop.address
//       } : {}
//     });

//   } catch (error) {
//     console.error('Error in simple query:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch appointments',
//       details: error.message 
//     });
//   }
// };

exports.getBarberAppointments = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    console.log('=== DEBUGGING BARBER APPOINTMENTS ===');
    console.log('Requested shopId:', shopId);

    if (!shopId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shop ID is required' 
      });
    }

    // First, let's do a simple query without population to verify we find the appointments
    const simpleAppointments = await Appointment.find({ shopId: shopId });
    console.log('Simple query result (no population):', simpleAppointments.length);
    console.log('Simple appointments:', simpleAppointments.map(apt => ({
      _id: apt._id,
      shopId: apt.shopId,
      customerEmail: apt.customerEmail,
      status: apt.status
    })));

    // If simple query works but populated query doesn't, the issue is with population
    if (simpleAppointments.length > 0) {
      console.log('Simple query found appointments. Now trying with population...');
      
      // Try population step by step
      const appointmentsWithShop = await Appointment.find({ shopId: shopId })
        .populate('shopId', 'shopname city address phone email');
      console.log('With shop population:', appointmentsWithShop.length);

      const appointmentsWithShopAndTimeSlot = await Appointment.find({ shopId: shopId })
        .populate('shopId', 'shopname city address phone email')
        .populate('timeSlot', 'date');
      console.log('With shop and timeslot population:', appointmentsWithShopAndTimeSlot.length);

      const fullAppointments = await Appointment.find({ shopId: shopId })
        .populate('shopId', 'shopname city address phone email')
        .populate('timeSlot', 'date')
        .populate('userId', 'name email phone')
        .sort({ 'timeSlot.date': 1, 'showtimes.date': 1 });
        // .sort({ bookedAt: -1 });

      console.log('Full population result:', fullAppointments.length);

      // Use the fully populated appointments
      var appointments = fullAppointments;
    } else {
      console.log('No appointments found even with simple query');
      var appointments = [];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Separate current and past appointments
    const currentAppointments = [];
    const pastAppointments = [];
    const todaysAppointments = [];

    // const now = new Date();
    console.log('Current date:', now);

    appointments.forEach(appointment => {
      const appointmentDate = appointment.timeSlot?.date;
      if (!appointmentDate) {
        pastAppointments.push(appointment);
        return;
      }

      // Use showtime date if available
      let appointmentDateTime;
      if (appointment.showtimes && appointment.showtimes.length > 0 && appointment.showtimes[0].date) {
        appointmentDateTime = new Date(appointment.showtimes[0].date);
      } else {
        appointmentDateTime = new Date(appointmentDate);
      }

      // Check if appointment is today
      const isToday = appointmentDateTime >= startOfToday && appointmentDateTime < endOfToday;

      if (appointmentDateTime >= now && appointment.status !== 'cancelled') {
        currentAppointments.push(appointment);
      } else {
        pastAppointments.push(appointment);
      }

      if (isToday) {
        todaysAppointments.push(appointment);
      }
    });
    
    // appointments.forEach(appointment => {
    //   const appointmentDate = appointment.timeSlot?.date;
    //   console.log('Processing appointment:', {
    //     _id: appointment._id,
    //     appointmentDate: appointmentDate,
    //     status: appointment.status
    //   });
      
    //   if (appointmentDate) {
    //     const aptDate = new Date(appointmentDate);
    //     console.log('Appointment date object:', aptDate);
    //     console.log('Is future?', aptDate >= now);
        
    //     if (aptDate >= now && appointment.status !== 'cancelled') {
    //       currentAppointments.push(appointment);
    //     } else {
    //       pastAppointments.push(appointment);
    //     }
    //   } else {
    //     // If no date, consider it past
    //     pastAppointments.push(appointment);
    //   }
    // });

    console.log('Current appointments count:', currentAppointments.length);
    console.log('Past appointments count:', pastAppointments.length);

    // Calculate statistics
    const stats = {
      total: appointments.length,
      upcoming: currentAppointments.length,
      completed: pastAppointments.filter(apt => apt.status !== 'cancelled').length,
      cancelled: pastAppointments.filter(apt => apt.status === 'cancelled').length,
      today: todaysAppointments.length
    };

    res.status(200).json({
      success: true,
      currentAppointments,
      pastAppointments,
      todaysAppointments, // Add this field
      stats,
      shop: await Shop.findById(shopId).select('name city address shopname')
    });
    // const stats = {
    //   total: appointments.length,
    //   upcoming: currentAppointments.length,
    //   completed: pastAppointments.filter(apt => apt.status !== 'cancelled').length,
    //   cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    //   today: appointments.filter(apt => {
    //     const aptDate = apt.timeSlot?.date;
    //     if (!aptDate) return false;
    //     const appointmentDate = new Date(aptDate);
    //     const today = new Date();
    //     return appointmentDate.toDateString() === today.toDateString() && 
    //            apt.status !== 'cancelled';
    //   }).length
    // };

    // console.log('Final stats:', stats);
    // console.log('================================');

    // // Get shop details
    // const shop = await Shop.findById(shopId);

    // res.status(200).json({
    //   success: true,
    //   currentAppointments,
    //   pastAppointments,
    //   stats,
    //   shop: shop ? {
    //     name: shop.shopname,
    //     city: shop.city,
    //     address: shop.address
    //   } : {},
    //   debug: {
    //     simpleQueryCount: simpleAppointments.length,
    //     fullQueryCount: appointments.length
    //   }
    // });

  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments',
      details: error.message 
    });
  }
};

// Get today's appointments
exports.getTodaysAppointments = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    if (!shopId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shop ID is required' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({ 
      shopId,
      'timeSlot.date': {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('shopId', 'shopname city address')
    .populate('timeSlot', 'date')
    .populate('userId', 'name email phone')
    .sort({ 'showtimes.date': 1 });

    res.status(200).json({
      success: true,
      appointments,
      date: today.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch today\'s appointments' 
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({ 
        success: false,
        error: 'Appointment ID and status are required' 
      });
    }

    const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status. Must be: confirmed, pending, cancelled, or completed' 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    )
    .populate('shopId', 'shopname city address')
    .populate('timeSlot', 'date')
    .populate('userId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update appointment status' 
    });
  }
};

// Get appointment analytics
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { period = 'month' } = req.query; // week, month, year

    if (!shopId) {
      return res.status(400).json({ 
        success: false,
        error: 'Shop ID is required' 
      });
    }

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const analytics = await Appointment.aggregate([
      {
        $match: {
          shopId: mongoose.Types.ObjectId(shopId),
          bookedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$bookedAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate summary
    const totalAppointments = await Appointment.countDocuments({ 
      shopId: mongoose.Types.ObjectId(shopId),
      bookedAt: { $gte: startDate }
    });

    const confirmedAppointments = await Appointment.countDocuments({ 
      shopId: mongoose.Types.ObjectId(shopId),
      status: 'confirmed',
      bookedAt: { $gte: startDate }
    });

    const cancelledAppointments = await Appointment.countDocuments({ 
      shopId: mongoose.Types.ObjectId(shopId),
      status: 'cancelled',
      bookedAt: { $gte: startDate }
    });

    res.status(200).json({
      success: true,
      analytics,
      summary: {
        total: totalAppointments,
        confirmed: confirmedAppointments,
        cancelled: cancelledAppointments,
        completionRate: totalAppointments > 0 ? 
          ((totalAppointments - cancelledAppointments) / totalAppointments * 100).toFixed(2) : 0
      },
      period,
      startDate: startDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error fetching appointment analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment analytics' 
    });
  }
};

// Get appointment by ID
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Appointment ID is required' 
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('shopId', 'shopname city address phone email services')
      .populate('timeSlot', 'date')
      .populate('userId', 'name email phone')
      .populate({
        path: 'timeSlot',
        populate: {
          path: 'showtimes',
          match: { _id: { $in: appointment?.showtimes?.map(st => st.showtimeId) } }
        }
      });

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment details' 
    });
  }
};