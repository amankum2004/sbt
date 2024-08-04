const mongoose = require("mongoose")

const timeSlotSchema = new mongoose.Schema({
    // shop_owner_id: {
    //   type:String,
    //   required: true,
    // },
    username: {
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
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    is_booked: {
      type: Boolean,
      default: false,
    },
  });
  
  const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
  
  module.exports = TimeSlot;


