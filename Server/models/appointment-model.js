const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
      service: { // Add service information
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    },
  ],
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
  totalAmount: { type: Number, required: true } // Add total amount
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;