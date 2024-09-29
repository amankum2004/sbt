const mongoose = require("mongoose")

const timeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  date: { type: Date, required: true },
  is_booked: { type: Boolean, default: false,
  },
})

const timeSlotSchema = new mongoose.Schema({
    shop_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Shop'
    },
    name: {
      type:String,
      required: true,
    },
    email: {
      type:String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date: { type: Date, required: true },
    showtimes: {
      type: [timeSchema]
    }

  });
  
  const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
  
  module.exports = TimeSlot;


