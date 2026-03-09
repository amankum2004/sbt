const express = require("express");
const timeSlotController = require("../controllers/timeSlot-controller");
const router = express.Router();

router.route("/timeslots").post(timeSlotController.createTimeSlot);

router.route("/shops/:shopOwnerId/available").get(timeSlotController.getTimeSlots);

// automatic timeSlot creation
router.post("/template/create", timeSlotController.createTemplate);
router.put("/template/:id", timeSlotController.updateTemplate);
router.get("/template/:shopId", timeSlotController.getTemplateByShopId);

router.get("/timeslots/:shopId", timeSlotController.getTimeSlotsByShop);

router.patch("/timeslots/:id/toggle/:showtimeId", timeSlotController.toggleShowtime);

module.exports = router;
