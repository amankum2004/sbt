// backend/models/Template.js
const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  shop_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Shop",
  },
  name: { type: String, required: true },  // <-- Add these
  email: { type: String, required: true },
  phone: { type: String, required: true },
  workingDays: [String],
  startTime: String,
  endTime: String,
  slotInterval: Number,
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
