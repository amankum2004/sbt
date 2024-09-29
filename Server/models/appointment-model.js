const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true,
  },
  showtimes: [
    {
      date: { type: Date, required: true },
      showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeSlot.showtimes",
        required: true,
      },
    },
  ],
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

