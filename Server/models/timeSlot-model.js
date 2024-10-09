const mongoose = require("mongoose")
const cron = require("node-cron")

const timeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  date: { type: Date, required: true },
  is_booked: { type: Boolean, default: false},
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

  // Scheduling job to run every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task to delete past time slots...");
  try {
    // Get current date
    const currentDate = new Date();

    // Delete time slots where the date is less than the current date
    const result = await TimeSlot.deleteMany({
      date: { $lt: currentDate },
    });

    console.log(`Deleted ${result.deletedCount} expired time slots.`);
  } catch (error) {
    console.error("Error deleting expired time slots:", error);
  }
});
  
  module.exports = TimeSlot;


