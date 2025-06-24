const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/timeSlot-model');
const Appointment = require('../models/appointment-model');
const moment = require('moment-timezone');
const { generateSlotsFor7Days } = require("../controllers/timeSlot-controller");

router.post('/cleanup', async (req, res) => {
  try {
    if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Security check for cron

    // Set timezone explicitly (e.g., Asia/Kolkata for IST)
    const TIMEZONE = 'Asia/Kolkata';

    // ✅ Get today's local midnight in UTC (e.g., IST → UTC)
    const todayLocalMidnightUtc = moment.tz(TIMEZONE).startOf('day').utc().toDate();

    // ✅ Delete TimeSlots where `date` is before today's local midnight (in UTC)
    const timeSlotResult = await TimeSlot.deleteMany({
      date: { $lt: todayLocalMidnightUtc }
    });

    // ✅ Delete Appointments where all showtimes are before today's local midnight
    const appointmentResult = await Appointment.deleteMany({
      showtimes: {
        $not: {
          $elemMatch: {
            date: { $gte: todayLocalMidnightUtc },
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Cleanup completed',
      timeSlotsDeleted: timeSlotResult.deletedCount,
      appointmentsDeleted: appointmentResult.deletedCount,
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ message: 'Cleanup failed', error });
  }
});


router.post('/generate-timeslots', async (req, res) => {
  try {
    if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await generateSlotsFor7Days();
    res.status(200).json({
      message: 'Time slots generated for 7 days.',
      deletedOldOrExtraSlots: result.deletedOldOrExtraSlots
    });
  } catch (error) {
    console.error('Time slot generation error from scheduler:', error);
    res.status(500).json({
      message: 'Slot generation failed from scheduler',
      error: error.message || "Unknown error",
      stack: error.stack || null
    });
  }
});




module.exports = router;





