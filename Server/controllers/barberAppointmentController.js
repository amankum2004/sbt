const Appointment = require('../models/appointment-model');
const Shop = require('../models/registerShop-model');
const TimeSlot = require('../models/timeSlot-model');
const User = require('../models/user/user-model');
const mongoose = require('mongoose');

// Get all appointments for barber's shop
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

    const fullAppointments = await Appointment.find({ shopId: shopId })
      .populate('shopId', 'shopname city address phone email')
      .populate('timeSlot', 'date')
      .populate('userId', 'name email phone');

    console.log('Full population result:', fullAppointments.length);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    console.log('Time references:', {
      now: now.toLocaleString(),
      startOfToday: startOfToday.toLocaleString(),
      endOfToday: endOfToday.toLocaleString()
    });

    // Separate appointments based on STATUS first, then DATE
    const todaysAppointments = [];
    const upcomingAppointments = [];
    const pastAppointments = [];

    fullAppointments.forEach(appointment => {
      const appointmentDate = appointment.timeSlot?.date;
      
      // Use showtime date if available, otherwise use timeSlot date
      let appointmentDateTime;
      if (appointment.showtimes && appointment.showtimes.length > 0 && appointment.showtimes[0].date) {
        appointmentDateTime = new Date(appointment.showtimes[0].date);
      } else {
        appointmentDateTime = new Date(appointmentDate);
      }

      console.log('Processing appointment:', {
        customer: appointment.userId?.name,
        appointmentTime: appointmentDateTime.toLocaleString(),
        status: appointment.status,
        isToday: appointmentDateTime >= startOfToday && appointmentDateTime < endOfToday,
        isPast: appointmentDateTime < startOfToday,
        isFuture: appointmentDateTime >= endOfToday
      });

      // FIRST: Check if appointment is completed or cancelled - these always go to history
      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        pastAppointments.push(appointment);
        console.log('-> Added to HISTORY (completed/cancelled status)');
        return;
      }

      // SECOND: For active appointments (pending/confirmed), categorize by DATE
      const isToday = appointmentDateTime >= startOfToday && appointmentDateTime < endOfToday;
      const isPast = appointmentDateTime < startOfToday;
      const isFuture = appointmentDateTime >= endOfToday;

      if (isToday) {
        // Today's appointments - show only if not completed/cancelled
        todaysAppointments.push(appointment);
        console.log('-> Added to TODAY (today date, active status)');
      } else if (isPast) {
        // Past appointments with active status - move to history
        pastAppointments.push(appointment);
        console.log('-> Added to HISTORY (past date, active status)');
      } else if (isFuture) {
        // Future appointments - show in upcoming
        upcomingAppointments.push(appointment);
        console.log('-> Added to UPCOMING (future date, active status)');
      }
    });

    // Sort Today appointments chronologically (earliest first)
    todaysAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateA - dateB; // Ascending order (earliest first)
    });

    // Sort Upcoming appointments chronologically (earliest first)
    upcomingAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateA - dateB; // Ascending order (earliest first)
    });

    // Sort History appointments in reverse chronological order (most recent first)
    pastAppointments.sort((a, b) => {
      const getAppointmentDate = (appointment) => {
        return appointment.showtimes && appointment.showtimes.length > 0 
          ? appointment.showtimes[0].date 
          : appointment.timeSlot?.date;
      };
      
      const dateA = new Date(getAppointmentDate(a) || 0);
      const dateB = new Date(getAppointmentDate(b) || 0);
      return dateB - dateA; // Descending order (most recent first)
    });

    console.log('Final categorized appointments:', {
      today: todaysAppointments.length,
      upcoming: upcomingAppointments.length,
      past: pastAppointments.length,
      todayDetails: todaysAppointments.map(apt => ({
        customer: apt.userId?.name,
        date: apt.showtimes?.[0]?.date || apt.timeSlot?.date,
        status: apt.status
      })),
      pastDetails: pastAppointments.map(apt => ({
        customer: apt.userId?.name,
        date: apt.showtimes?.[0]?.date || apt.timeSlot?.date,
        status: apt.status
      }))
    });

    // Calculate statistics
    const stats = {
      total: fullAppointments.length,
      today: todaysAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: pastAppointments.filter(apt => apt.status === 'completed').length,
      cancelled: pastAppointments.filter(apt => apt.status === 'cancelled').length,
      pending: todaysAppointments.filter(apt => apt.status === 'pending').length + 
               upcomingAppointments.filter(apt => apt.status === 'pending').length,
      confirmed: todaysAppointments.filter(apt => apt.status === 'confirmed').length + 
                 upcomingAppointments.filter(apt => apt.status === 'confirmed').length
    };

    res.status(200).json({
      success: true,
      todaysAppointments,
      upcomingAppointments,
      pastAppointments,
      stats,
      shop: await Shop.findById(shopId).select('name city address shopname')
    });
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments',
      details: error.message 
    });
  }
};


// Get today's appointments only
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
      $or: [
        { 'timeSlot.date': { $gte: today, $lt: tomorrow } },
        { 'showtimes.date': { $gte: today, $lt: tomorrow } }
      ]
    })
    .populate('shopId', 'shopname city address')
    .populate('timeSlot', 'date')
    .populate('userId', 'name email phone')
    .sort({ 'showtimes.date': 1 }); // Sort chronologically

    res.status(200).json({
      success: true,
      todaysAppointments: appointments,
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

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
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
      return res.status(200).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
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
      return res.status(200).json({ 
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