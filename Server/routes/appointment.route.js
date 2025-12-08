const express = require('express');
const { bookAppointment } = require('../controllers/appointment-controller');
const router = express.Router();
const Appointment = require('../models/appointment-model');
const customerController = require('../controllers/customerAppointmentController');
const barberController = require('../controllers/barberAppointmentController');

router.route('/appointment').post(bookAppointment)

// @desc    Get customer appointments
// @route   GET /api/customer/appointments/:customerEmail
// @access  Private
router.get('/appointments/:customerEmail', customerController.getCustomerAppointments);

// @desc    Get appointment statistics
// @route   GET /api/customer/stats/:customerEmail
// @access  Private
router.get('/stats/:customerEmail', customerController.getAppointmentStats);

// @desc    Get appointment details
// @route   GET /api/customer/appointments/details/:appointmentId
// @access  Private
router.get('/appointments/details/:appointmentId', customerController.getAppointmentDetails);

// @desc    Cancel appointment
// @route   PUT /api/customer/appointments/:appointmentId/cancel
// @access  Private
router.put('/appointments/:appointmentId/cancel', customerController.cancelAppointment);


// For BARBER
// Add middleware to log all requests
router.use((req, res, next) => {
  console.log('=== BARBER ROUTES HIT ===');
  console.log('Method:', req.method);
  console.log('Original URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Base URL:', req.baseUrl);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('========================');
  next();
});
// @desc    Get all appointments for barber's shop
// @desc    Get all appointments for barber's shop
// Make this route more specific by putting it BEFORE the /today route
router.get('/barber-appointments/:shopId', (req, res, next) => {
  console.log('MAIN APPOINTMENTS ROUTE HIT!');
  console.log('ShopId param:', req.params.shopId);
  next();
}, barberController.getBarberAppointments);
// router.get('/appointments/:shopId', barberController.getBarberAppointments);

// @desc    Get today's appointments
// @desc    Get today's appointments  
// This should come AFTER the main appointments route
router.get('/barber-appointments/:shopId/today', (req, res, next) => {
  console.log('TODAYS APPOINTMENTS ROUTE HIT!');
  console.log('ShopId param:', req.params.shopId);
  next();
}, barberController.getTodaysAppointments);
// router.get('/appointments/:shopId/today', barberController.getTodaysAppointments);

// @desc    Get appointment details
// @route   GET /api/barber/appointments/details/:appointmentId
// @access  Private
router.get('/barber-appointments/details/:appointmentId', barberController.getAppointmentDetails);

// @desc    Update appointment status
// @route   PUT /api/barber/appointments/:appointmentId/status
// @access  Private
router.put('/barber-appointments/:appointmentId/status', barberController.updateAppointmentStatus);

// @desc    Get appointment analytics
// @route   GET /api/barber/analytics/:shopId
// @access  Private
router.get('/analytics/:shopId', barberController.getAppointmentAnalytics);

// Add this at the END of your barberRoutes.js to catch undefined routes
router.get('/barber-appointments/:shopId', (req, res) => {
  console.log('=== CATCH-ALL APPOINTMENTS ROUTE HIT ===');
  console.log('This means the specific route was not matched');
  console.log('Params:', req.params);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path,
    params: req.params
  });
});


// // Get appointments by user ID
// router.get('/user/:userId', async (req, res) => {
//      try {
//         const appointments = await Appointment.find({})
//             .populate('shopId', 'name address phone email') // Populate shop details
//             .populate('timeSlot', 'date startTime endTime is_booked') // Populate main time slot
//             .populate('showtimes.showtimeId', 'date is_booked') // Populate individual showtimes
//             .sort({ bookedAt: -1 });
//         console.log("appointments : ",appointments);
//         res.json(appointments);
//     } catch (error) {
//         console.error('Error fetching appointments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Alternative: If you need to find appointments by customer email or other identifier
// router.get('/customer/:email', async (req, res) => {
//     try {
//         const appointments = await Appointment.find({})
//             .populate('shopId', 'name address phone email')
//             .populate('timeSlot', 'date startTime endTime is_booked')
//             .populate('showtimes.showtimeId', 'date is_booked')
//             .sort({ bookedAt: -1 });

//         // Filter or modify based on your business logic
//         console.log("appointments : ",appointments);
//         res.json(appointments);
//     } catch (error) {
//         console.error('Error fetching appointments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

module.exports = router;
