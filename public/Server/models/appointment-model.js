const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  shop_owner_id: {
    type: String,
    ref: 'ShopOwner',
    required: true,
  },
  // shopname: {
  //   type: String,
  //   required: true,
  // },
  // time_slot_id: {
  //   type: String,
  //   ref: 'TimeSlot',
  //   required: true,
  // }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
