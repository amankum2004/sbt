const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const moment = require("moment-timezone");
const { generateSlotsFor7Days } = require("../controllers/timeSlot-controller");

router.post("/cleanup", async (req, res) => {
  try {
    if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const TIMEZONE = "Asia/Kolkata";
    const todayLocalMidnightUtc = moment.tz(TIMEZONE).startOf("day").utc().toDate();

    const { appointmentResult, timeSlotResult } = await prisma.$transaction(async (tx) => {
      // Delete dependent appointments first to satisfy FK RESTRICT on Appointment.timeSlotId
      const appointmentResult = await tx.appointment.deleteMany({
        where: {
          OR: [
            { timeSlot: { date: { lt: todayLocalMidnightUtc } } },
            {
              showtimes: {
                none: {
                  date: { gte: todayLocalMidnightUtc },
                },
              },
            },
          ],
        },
      });

      const timeSlotResult = await tx.timeSlot.deleteMany({
        where: { date: { lt: todayLocalMidnightUtc } },
      });

      return { appointmentResult, timeSlotResult };
    });

    return res.status(200).json({
      message: "Cleanup completed",
      timeSlotsDeleted: timeSlotResult.count,
      appointmentsDeleted: appointmentResult.count,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ message: "Cleanup failed", error });
  }
});

router.post("/generate-timeslots", async (req, res) => {
  try {
    if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await generateSlotsFor7Days();
    res.status(200).json({
      message: "Time slots generated for 7 days.",
      deletedOldOrExtraSlots: result.deletedSlotsForNonWorkingDays,
    });
  } catch (error) {
    console.error("Time slot generation error from scheduler:", error);
    res.status(500).json({
      message: "Slot generation failed from scheduler",
      error: error.message || "Unknown error",
      stack: error.stack || null,
    });
  }
});

module.exports = router;
