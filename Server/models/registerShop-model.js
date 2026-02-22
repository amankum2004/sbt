const mongoose = require("mongoose");

const toCoordinateNumber = (value) => {
  if (value === null || value === undefined || value === "") return value;

  if (typeof value === "object" && value.$numberDecimal) {
    const decimalValue = Number(value.$numberDecimal);
    return Number.isFinite(decimalValue) ? decimalValue : value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

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
  
  // Location coordinates
  lat: {
    type: Number,
    required: [true, "Latitude is required"],
    set: toCoordinateNumber,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: [true, "Longitude is required"],
    set: toCoordinateNumber,
    min: -180,
    max: 180
  },

  // Track coordinate source
  coordinatesSource: {
    type: String,
    enum: ['device_gps', 'google_geocode', 'manual_update', 'fallback'],
    default: 'device_gps'
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
