const Appointment = require('../models/appointment-model');
const TimeSlot = require('../models/timeSlot-model');

// exports.bookAppointment = async (req, res) => {
//   const {  shopId, timeSlotId, showtimeId, date } = req.body;

//   try {
//     // Verify TimeSlot and Showtime
//     const timeSlot = await TimeSlot.findById(timeSlotId);
//     if (!timeSlot) {
//       return res.status(400).json({ message: "Invalid TimeSlot ID" });
//     }

//     const showtime = timeSlot.showtimes.id(showtimeId);
//     if (!showtime || showtime.is_booked) {
//       return res
//         .status(400)
//         .json({ message: "Showtime is either booked or invalid" });
//     }

//     // Create Appointment
//     const appointment = new Appointment({
//       shopId,
//       timeSlot: timeSlotId,
//       showtimes: [{ date, showtimeId }],
//     });

//     // Mark showtime as booked
//     showtime.is_booked = true;
//     await timeSlot.save();
//     await appointment.save();

//     res.status(201).json({ message: "Appointment booked successfully", appointment });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.bookAppointment = async (shopId, timeSlotId, showtimeId, date) => {
  try {
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      throw new Error("Invalid TimeSlot ID");
    }

    const showtime = timeSlot.showtimes.id(showtimeId);
    if (!showtime || showtime.is_booked) {
      throw new Error("Showtime is either booked or invalid");
    }

    // Create Appointment
    const appointment = new Appointment({
      shopId,
      timeSlot: timeSlotId,
      showtimes: [{ date, showtimeId }],
    });

    // Mark showtime as booked
    showtime.is_booked = true;
    await timeSlot.save();
    await appointment.save();

    return appointment;
  } catch (error) {
    throw error;
  }
};


