const Appointment = require('../models/appointment-model');
const TimeSlot = require('../models/timeSlot-model');

exports.bookAppointment = async (shopId, timeSlotId, showtimeId, date) => {
  try {
    const timeSlot = await TimeSlot.findById(timeSlotId);
    // console.log("TimeSlot found:", timeSlot);
    if (!timeSlot) {
      throw new Error("Invalid TimeSlot ID");
    }

    const showtime = timeSlot.showtimes.id(showtimeId);
    // console.log("Showtime found:", showtime);
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
    console.error("Error in bookAppointment:", error); // Log the error
    throw error;
  }
};


