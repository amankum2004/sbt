const express = require('express');
// const { createTimeSlot, getAvailableTimeSlots } = require('../controllers/timeSlot-controller');
const timeSlotController = require("@/controllers/timeSlot-controller")
const router = express.Router();
const TimeSlot = require('../models/timeSlot-model');

router.route('/timeslots').post(timeSlotController.createTimeSlot)

// router.get('/timeslots/available', timeSlotController.getAvailableTimeSlots);
router.route('/shops/:shopOwnerId/available').get(timeSlotController.getTimeSlots)
// router.route('/book-showtime').get(timeSlotController.bookShowtime)

// automatic timeSlot creation
router.post("/template/create", timeSlotController.createTemplate);
router.put("/template/:id", timeSlotController.updateTemplate); // Add this line
router.get("/template/:shopId", timeSlotController.getTemplateByShopId);

router.get("/timeslots/:shopId", async (req, res) => {
  const slots = await TimeSlot.find({ shop_owner_id: req.params.shopId });
  res.json(slots);
});

router.patch("/timeslots/:id/toggle/:showtimeId", async (req, res) => {
  const slot = await TimeSlot.findById(req.params.id);
  const st = slot.showtimes.id(req.params.showtimeId);
  st.is_booked = !st.is_booked;
  await slot.save();
  res.json({ success: true });
});

module.exports = router;
