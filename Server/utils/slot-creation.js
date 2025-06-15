// backend/cron/cronJob.js
// const cron = require("node-cron");
// const { generateSlotsFor7Days } = require("../controllers/timeSlot-controller");

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running daily slot generation at midnight...");
//   await generateSlotsFor7Days();
// });


// cron.schedule("0 0 * * *", async () => {
//   console.log("Generating next 7 days' timeslots...");
//   const owners = await ShopOwner.find({});
//   for (let owner of owners) {
//     await generateSlotsFor7Days(owner._id);
//   }
// });

// const cron = require("node-cron");
// const TimeSlot = require('../models/timeSlot-model');
// const Template = require('../models/timeSlotTemplate-model');
// const moment = require('moment');

// const generateTimeSlotsForNext7Days = async () => {
//   const templates = await Template.find();

//   for (const template of templates) {
//     for (let i = 0; i < 7; i++) {
//       const targetDate = moment().add(i, 'days');
//       const dayName = targetDate.format('ddd'); // Mon, Tue...

//       if (!template.daysOfWeek.includes(dayName)) continue;

//       const existing = await TimeSlot.findOne({
//         shopOwnerId: template.shopOwnerId,
//         date: targetDate.format("YYYY-MM-DD"),
//       });

//       if (existing) continue;

//       const start = moment(template.startTime, "HH:mm");
//       const end = moment(template.endTime, "HH:mm");
//       const slots = [];

//       while (start < end) {
//         slots.push({
//           shopOwnerId: template.shopOwnerId,
//           date: targetDate.format("YYYY-MM-DD"),
//           time: start.format("HH:mm"),
//         });
//         start.add(template.slotDuration, 'minutes');
//       }

//       await TimeSlot.insertMany(slots);
//     }
//   }
// };


// cron.schedule("0 2 * * *", async () => {
//   console.log("Generating slots for next 7 days...");

//   const templates = await Template.find();

//   for (const template of templates) {
//     for (let i = 0; i < 7; i++) {
//       const targetDate = moment().add(i, "days");
//       const dayName = targetDate.format("ddd");

//       if (!template.daysOfWeek.includes(dayName)) continue;

//       const existingSlots = await TimeSlot.find({
//         shopOwnerId: template.shopOwnerId,
//         date: targetDate.format("YYYY-MM-DD"),
//       });

//       if (existingSlots.length > 0) continue;

//       const slots = [];
//       const start = moment(template.startTime, "HH:mm");
//       const end = moment(template.endTime, "HH:mm");

//       while (start < end) {
//         slots.push({
//           shopOwnerId: template.shopOwnerId,
//           date: targetDate.format("YYYY-MM-DD"),
//           time: start.format("HH:mm"),
//         });
//         start.add(template.slotDuration, "minutes");
//       }

//       await TimeSlot.insertMany(slots);
//     }
//   }

//   console.log("Slot generation completed.");
// });
