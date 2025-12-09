const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  service: {
    type: String,
    required: [true, "Service name is required"],
    trim: true
  },
  price: {
    type: String,
    required: [true, "Service price is required"],
    trim: true
  }
}, { _id: true });

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Owner name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  password: {
    type: String,
    required: false // Only for shop owner registrations, not admin-created shops
  },
  shopname: {
    type: String,
    required: [true, "Shop name is required"],
    trim: true
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true
  },
  district: {
    type: String,
    required: [true, "District is required"],
    trim: true
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true
  },
  street: {
    type: String,
    required: [true, "Street address is required"],
    trim: true
  },
  pin: {
    type: String,
    required: [true, "PIN code is required"],
    trim: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit PIN code"]
  },
  services: [serviceSchema],
  
  // Location coordinates - numeric for calculations
  lat: {
    type: Number,
    required: [true, "Latitude is required"],
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: [true, "Longitude is required"],
    min: -180,
    max: 180
  },
  
  // Location coordinates - string for full precision
  latString: {
    type: String,
    required: [true, "Latitude string is required"],
    match: [/^-?\d{1,3}(\.\d+)?$/, "Invalid latitude format"]
  },
  lngString: {
    type: String,
    required: [true, "Longitude string is required"],
    match: [/^-?\d{1,3}(\.\d+)?$/, "Invalid longitude format"]
  },
  
  // Track coordinate source
  coordinatesSource: {
    type: String,
    enum: ['client_provided', 'mapmyindia', 'manual_update', 'fallback'],
    default: 'client_provided'
  },
  
  // Approval status
  isApproved: {
    type: Boolean,
    default: false
  },
  
  // Current shop status
  status: {
    type: String,
    enum: ['open', 'closed', 'break'],
    default: 'open'
  },
  
  // Track when status was last updated
  statusLastUpdated: {
    type: Date,
    default: Date.now
  },

    // Ratings fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingBreakdown: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  
}, { timestamps: true });

// Index for location-based queries
shopSchema.index({ lat: 1, lng: 1 });
shopSchema.index({ state: 1, district: 1, city: 1 });
shopSchema.index({ isApproved: 1 });

module.exports = mongoose.model("Shop", shopSchema);







// const mongoose = require('mongoose');

// // In your shop model file
// const shopSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   password: { type: String },
//   shopname: { type: String, required: true },
//   state: { type: String, required: true },
//   district: { type: String, required: true },
//   city: { type: String, required: true },
//   street: { type: String, required: true },
//   pin: { type: String, required: true },
//   services: [{
//     service: { type: String, required: true },
//     price: { type: String, required: true }
//   }],
//   // Store as numbers for backward compatibility
//   lat: Number,
//   lng: Number,
//   // Store as strings for full precision
//   latString: {
//     type: String,
//     required: true
//   },
//   lngString: {
//     type: String,
//     required: true
//   },
//   isApproved: { type: Boolean, default: false },
//   // Add shop status field
//   status: {
//     type: String,
//     enum: ['open', 'closed', 'break'],
//     default: 'open'
//   },
//   statusLastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Shop', shopSchema);