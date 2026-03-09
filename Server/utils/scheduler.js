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

    const timeSlotResult = await prisma.timeSlot.deleteMany({
      where: { date: { lt: todayLocalMidnightUtc } },
    });

    const appointmentsToDelete = await prisma.appointment.findMany({
      where: {
        showtimes: {
          none: {
            date: { gte: todayLocalMidnightUtc },
          },
        },
      },
      select: { id: true },
    });

    const appointmentIds = appointmentsToDelete.map((appointment) => appointment.id);
    const appointmentResult = await prisma.appointment.deleteMany({
      where: { id: { in: appointmentIds } },
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
