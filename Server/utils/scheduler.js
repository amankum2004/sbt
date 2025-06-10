const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/timeSlot-model');
const Appointment = require('../models/appointment-model');

router.post('/cleanup', async (req, res) => {
  try {
    if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const now = new Date();

    const timeSlotResult = await TimeSlot.deleteMany({ date: { $lt: now } });

    const appointmentResult = await Appointment.deleteMany({
      showtimes: {
        $not: {
          $elemMatch: {
            date: { $gte: now },
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
    return res.status(500).json({ message: 'Cleanup failed', error });
  }
});

module.exports = router;



// const cron = require("node-cron");
// const TimeSlot = require("../models/timeSlot-model"); // Adjust the path as needed
// const Appointment = require("../models/appointment-model")

//   // Every Hour: 0 * * * *
//   // Every 30 Minutes: */30 * * * *
//   // Every 15 Minutes: */15 * * * *
//   // Every Minute: * * * * *
// cron.schedule('0 0 * * *', async () => {
//   try {
//     const now = new Date();
//     const result = await TimeSlot.deleteMany({ date: { $lt: now } });

//     if (result.deletedCount > 0) {
//       console.log(`${result.deletedCount} expired time slot(s) deleted.`);
//     } else {
//       console.log('No expired time slots found to delete.');
//     }
//   } catch (error) {
//     console.error('Error deleting expired time slots:', error);
//   }
// });

// // Schedule the cron job to run every day at midnight (or adjust as needed)
// cron.schedule('0 0 * * *', async () => {
//     try {
//       const now = new Date();
  
//       // Find and delete appointments where all showtimes have expired
//       const expiredAppointments = await Appointment.deleteMany({
//         showtimes: {
//           $not: {
//             $elemMatch: {
//               date: { $gte: now },
//             },
//           },
//         },
//       });
  
//       if (expiredAppointments.deletedCount > 0) {
//         console.log(`${expiredAppointments.deletedCount} expired appointment(s) deleted.`);
//       } else {
//         console.log('No expired appointments found to delete.');
//       }
//     } catch (error) {
//       console.error('Error deleting expired appointments:', error);
//     }
//   });
