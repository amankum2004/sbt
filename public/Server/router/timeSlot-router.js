const express = require('express');
// const { createTimeSlot, getAvailableTimeSlots } = require('../controllers/timeSlot-controller');
const timeSlotController = require("../controllers/timeSlot-controller")
const router = express.Router();

// router.post('/timeslots', timeSlotController.createTimeSlot);
router.route('/timeslots').post(timeSlotController.createTimeSlot)

// router.get('/timeslots/available', timeSlotController.getAvailableTimeSlots);
router.route('/timeslots/available').get(timeSlotController.getAvailableTimeSlots)

module.exports = router;
