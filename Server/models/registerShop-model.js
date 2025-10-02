const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String },
  shopname: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  pin: { type: String, required: true },
  bankname: { type: String, required: false },
  bankbranch: { type: String, required: false},
  ifsc: { type: String, required: false },
  micr: { type: String, required: false },
  account: { type: String, required: false },
  services: [{
    service: { type: String, required: true },
    price: { type: String, required: true }
  }],
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);