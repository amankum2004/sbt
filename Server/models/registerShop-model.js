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
  bankname: { type: String, required: true },
  bankbranch: { type: String, required: true },
  ifsc: { type: String, required: true },
  micr: { type: String, required: true },
  account: { type: String, required: true },
  services: [{
    service: { type: String, required: true },
    price: { type: String, required: true }
  }],
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);