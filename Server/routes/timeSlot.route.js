const express = require('express');
// const { createTimeSlot, getAvailableTimeSlots } = require('../controllers/timeSlot-controller');
const timeSlotController = require("@/controllers/timeSlot-controller")
const router = express.Router();

// router.post('/timeslots', timeSlotController.createTimeSlot);
router.route('/timeslots').post(timeSlotController.createTimeSlot)

// router.get('/timeslots/available', timeSlotController.getAvailableTimeSlots);
router.route('/shops/:shopOwnerId/available').get(timeSlotController.getTimeSlots)
// router.route('/book-showtime').get(timeSlotController.bookShowtime)

module.exports = router;
