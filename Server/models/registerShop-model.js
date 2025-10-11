const mongoose = require('mongoose');

// In your shop model file
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
  services: [{
    service: { type: String, required: true },
    price: { type: String, required: true }
  }],
  // Store as numbers for backward compatibility
  lat: Number,
  lng: Number,
  // Store as strings for full precision
  latString: {
    type: String,
    required: true
  },
  lngString: {
    type: String,
    required: true
  },
  isApproved: { type: Boolean, default: false },
  // Add shop status field
  status: {
    type: String,
    enum: ['open', 'closed', 'break'],
    default: 'open'
  },
  statusLastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);