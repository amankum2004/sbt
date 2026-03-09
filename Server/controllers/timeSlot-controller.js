const prisma = require("../utils/prisma");
const moment = require("moment-timezone");
const { mapTimeSlot, mapTemplate } = require("../utils/legacy-mappers");

const timezone = "Asia/Kolkata";

const normalizeWorkingDay = (day) =>
  day ? day.charAt(0).toUpperCase() + day.slice(1) : day;

exports.createTimeSlot = async (req, res) => {
  try {
    const { shop_owner_id, name, email, phone, date, showtimes } = req.body;

    const showtimePayload = Array.isArray(showtimes)
      ? showtimes.map((showtime) => ({
          date: new Date(showtime.date),
          isBooked: !!showtime.is_booked,
        }))
      : [];

    const savedTimeSlot = await prisma.timeSlot.create({
      data: {
        shopOwnerId: shop_owner_id,
        name,
        email,
        phone,
        date: new Date(date),
        showtimes: showtimePayload.length
          ? {
              create: showtimePayload,
            }
          : undefined,
      },
      include: { showtimes: true },
    });

    res.status(201).json(mapTimeSlot(savedTimeSlot));
  } catch (error) {
    res.status(500).json({ message: "Failed to create time slot", error });
  }
};

exports.getTimeSlots = async (req, res) => {
  try {
    const { shopOwnerId } = req.params;

    if (!shopOwnerId) {
      return res.status(400).json({ message: "shopOwnerId is required" });
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: { shopOwnerId },
      include: { showtimes: { orderBy: { date: "asc" } } },
      orderBy: { date: "asc" },
    });

    if (!timeSlots || timeSlots.length === 0) {
      return res.status(404).json({ message: "No time slots found for this shop" });
    }

    res.status(200).json(timeSlots.map(mapTimeSlot));
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ message: "Failed to fetch time slots", error: error.message });
  }
};

exports.getTimeSlotsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const slots = await prisma.timeSlot.findMany({
      where: { shopOwnerId: shopId },
      include: { showtimes: { orderBy: { date: "asc" } } },
      orderBy: { date: "asc" },
    });

    res.json(Array.isArray(slots) ? slots.map(mapTimeSlot) : []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch time slots", error: error.message });
  }
};

// Template CRUD Operations
exports.createTemplate = async (req, res) => {
  try {
    const template = await prisma.template.create({
      data: {
        shopOwnerId: req.body.shop_owner_id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        workingDays: req.body.workingDays || [],
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        slotInterval: req.body.slotInterval,
      },
    });

    await exports.generateSlotsFor7Days(template);

    res.status(201).json({
      success: true,
      data: mapTemplate(template),
      message: "Template created successfully and time slots generated",
    });
  } catch (err) {
    console.error("Template creation failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create template",
    });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("🔄 Updating template with ID:", id);
    console.log("📝 Update data:", updateData);

    const oldTemplate = await prisma.template.findUnique({ where: { id } });
    if (!oldTemplate) {
      return res.status(200).json({
        success: false,
        message: "Template not found",
      });
    }

    const workingDaysChanged =
      JSON.stringify([...oldTemplate.workingDays].sort()) !==
      JSON.stringify([...(updateData.workingDays || oldTemplate.workingDays)].sort());

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        workingDays: updateData.workingDays || oldTemplate.workingDays,
        startTime: updateData.startTime || oldTemplate.startTime,
        endTime: updateData.endTime || oldTemplate.endTime,
        slotInterval: updateData.slotInterval || oldTemplate.slotInterval,
        name: updateData.name || oldTemplate.name,
        email: updateData.email || oldTemplate.email,
        phone: updateData.phone || oldTemplate.phone,
      },
    });

    console.log("✅ Template updated successfully");

    const regenerationResult = await exports.generateSlotsFor7Days(updatedTemplate);

    let message = "Template updated successfully";
    if (workingDaysChanged) {
      const oldDaysCount = oldTemplate.workingDays.length;
      const newDaysCount = updatedTemplate.workingDays.length;
      message += `. Working days changed from ${oldDaysCount} to ${newDaysCount} days.`;

      if (regenerationResult.deletedSlotsForNonWorkingDays > 0) {
        message += ` Removed ${regenerationResult.deletedSlotsForNonWorkingDays} slots for non-working days.`;
      }
    }

    message += ` Generated ${regenerationResult.totalSlotsCreated} new time slots.`;

    res.status(200).json({
      success: true,
      data: mapTemplate(updatedTemplate),
      regenerationResult: regenerationResult,
      workingDaysChanged: workingDaysChanged,
      message: message,
    });
  } catch (error) {
    console.error("❌ Error updating template:", error);
    res.status(500).json({
      success: false,
      message: "Error updating template",
      error: error.message,
    });
  }
};

exports.getTemplateByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;

    console.log("🔍 Searching for template with shop ID:", shopId);

    const template = await prisma.template.findFirst({
      where: { shopOwnerId: shopId },
    });

    if (!template) {
      console.log("❌ No template found for shop ID:", shopId);
      return res.status(200).json({
        success: false,
        message: "No template found for this shop",
      });
    }

    console.log("✅ Template found:", {
      _id: template.id,
      shop_owner_id: template.shopOwnerId,
      workingDays: template.workingDays,
      startTime: template.startTime,
      endTime: template.endTime,
      slotInterval: template.slotInterval,
    });

    res.status(200).json({
      success: true,
      data: mapTemplate(template),
      message: "Template found successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching template by shop ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching template",
      error: error.message,
    });
  }
};

const generateShowtimes = (date, startTime, endTime, interval, tz) => {
  try {
    const showtimes = [];
    const start = moment.tz(`${date} ${startTime}`, "YYYY-MM-DD HH:mm", tz);
    const end = moment.tz(`${date} ${endTime}`, "YYYY-MM-DD HH:mm", tz);

    if (start.isAfter(end)) {
      end.add(1, "day");
    }

    let current = start.clone();

    while (current.isBefore(end)) {
      showtimes.push({
        date: current.utc().toDate(),
        isBooked: false,
      });

      current.add(interval, "minutes");
    }

    console.log(
      `Generated ${showtimes.length} showtimes for ${date} from ${startTime} to ${endTime}`
    );
    return showtimes;
  } catch (error) {
    console.error("Error generating showtimes:", error);
    throw error;
  }
};

exports.generateSlotsFor7Days = async (singleTemplate = null) => {
  try {
    const templates = singleTemplate
      ? [singleTemplate]
      : await prisma.template.findMany();
    const today = moment().tz(timezone).startOf("day");
    const cutoffFuture = today.clone().add(7, "days").endOf("day");

    console.log("🔍 Starting slot regeneration process...");
    console.log(
      "📅 Date range:",
      today.format("YYYY-MM-DD"),
      "to",
      cutoffFuture.format("YYYY-MM-DD")
    );
    console.log("🏪 Templates to process:", templates.length);

    let totalSlotsCreated = 0;
    let totalDaysProcessed = 0;
    let deletedSlotsCount = 0;
    let slotsPreserved = 0;

    for (let template of templates) {
      console.log(`\n🔄 Processing template for shop: ${template.shopOwnerId}`);
      console.log("📋 Template working days:", template.workingDays);

      const futureSlots = await prisma.timeSlot.findMany({
        where: {
          shopOwnerId: template.shopOwnerId,
          date: {
            gte: today.utc().toDate(),
            lte: cutoffFuture.utc().toDate(),
          },
        },
        include: { showtimes: true },
      });

      console.log(`🔍 Found ${futureSlots.length} existing future slots`);

      const slotsToDelete = [];
      for (let slot of futureSlots) {
        const slotDate = moment(slot.date).tz(timezone);
        const dayName = normalizeWorkingDay(slotDate.format("dddd"));

        if (!template.workingDays.includes(dayName)) {
          const hasBooked = Array.isArray(slot.showtimes)
            ? slot.showtimes.some((showtime) => showtime.isBooked)
            : false;

          if (hasBooked) {
            console.log(
              `⚠️ Skipping deletion for ${slotDate.format(
                "YYYY-MM-DD"
              )} because it has booked showtimes`
            );
            continue;
          }

          slotsToDelete.push(slot.id);
          console.log(
            `🗑️ Marking slot for deletion: ${slotDate.format(
              "YYYY-MM-DD"
            )} (${dayName}) - no longer a working day`
          );
        }
      }

      if (slotsToDelete.length > 0) {
        const deleteResult = await prisma.timeSlot.deleteMany({
          where: { id: { in: slotsToDelete } },
        });
        deletedSlotsCount += deleteResult.count;
        console.log(`✅ Deleted ${deleteResult.count} slots for non-working days`);
      }

      for (let i = 0; i < 7; i++) {
        const targetDate = today.clone().add(i, "days");
        const dayName = normalizeWorkingDay(targetDate.format("dddd"));
        const dateString = targetDate.format("YYYY-MM-DD");

        console.log(`\n📅 Checking ${dateString} (${dayName})`);

        if (!template.workingDays.includes(dayName)) {
          console.log(
            `⏭️ Skipping ${dateString} (${dayName}) - not a working day`
          );
          continue;
        }

        console.log(`✅ ${dateString} (${dayName}) is a working day! Processing...`);

        const dateISO = targetDate.format("YYYY-MM-DD");
        const utcDate = targetDate.utc().startOf("day").toDate();

        let timeslotDoc = await prisma.timeSlot.findFirst({
          where: {
            shopOwnerId: template.shopOwnerId,
            date: utcDate,
          },
          include: { showtimes: true },
        });

        console.log(
          "🔍 Existing timeslot document:",
          timeslotDoc ? `Found (${timeslotDoc.id})` : "Not found"
        );

        const newShowtimes = generateShowtimes(
          dateISO,
          template.startTime,
          template.endTime,
          template.slotInterval,
          timezone
        );

        console.log(`🕒 Generated ${newShowtimes.length} slots for ${dateString}`);

        if (!timeslotDoc) {
          const newTimeslot = await prisma.timeSlot.create({
            data: {
              shopOwnerId: template.shopOwnerId,
              name: template.name,
              email: template.email,
              phone: template.phone,
              date: utcDate,
              showtimes: {
                create: newShowtimes.map((showtime) => ({
                  date: showtime.date,
                  isBooked: showtime.isBooked,
                })),
              },
            },
          });
          console.log("✅ Created new timeslot document:", newTimeslot.id);
          totalSlotsCreated += newShowtimes.length;
        } else {
          const existingShowtimes = timeslotDoc.showtimes || [];
          const existingByTime = new Map();

          existingShowtimes.forEach((showtime) => {
            const key = moment(showtime.date).format("HH:mm");
            existingByTime.set(key, showtime);
          });

          let slotsAdded = 0;
          let slotsPreservedThisDay = 0;
          const newTimes = newShowtimes.map((showtime) =>
            moment(showtime.date).format("HH:mm")
          );

          const updatePromises = [];
          const createPayload = [];

          for (const newShowtime of newShowtimes) {
            const newTime = moment(newShowtime.date).format("HH:mm");
            const existingShowtime = existingByTime.get(newTime);

            if (existingShowtime) {
              slotsPreservedThisDay++;
              slotsPreserved++;
              if (
                new Date(existingShowtime.date).getTime() !==
                new Date(newShowtime.date).getTime()
              ) {
                updatePromises.push(
                  prisma.timeSlotShowtime.update({
                    where: { id: existingShowtime.id },
                    data: { date: newShowtime.date },
                  })
                );
              }
            } else {
              createPayload.push({
                timeSlotId: timeslotDoc.id,
                date: newShowtime.date,
                isBooked: false,
              });
              slotsAdded++;
              totalSlotsCreated++;
            }
          }

          const deleteIds = existingShowtimes
            .filter((showtime) => {
              const time = moment(showtime.date).format("HH:mm");
              return !newTimes.includes(time) && !showtime.isBooked;
            })
            .map((showtime) => showtime.id);

          if (updatePromises.length) {
            await Promise.all(updatePromises);
          }

          if (createPayload.length) {
            await prisma.timeSlotShowtime.createMany({
              data: createPayload,
            });
          }

          if (deleteIds.length) {
            await prisma.timeSlotShowtime.deleteMany({
              where: { id: { in: deleteIds } },
            });
          }

          console.log(
            `📊 ${dateString}: Preserved ${slotsPreservedThisDay} slots, added ${slotsAdded} new slots`
          );
        }

        totalDaysProcessed++;
      }
    }

    console.log(`\n🎉 Slot regeneration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - ${totalDaysProcessed} days processed`);
    console.log(`   - ${totalSlotsCreated} new slots added`);
    console.log(`   - ${slotsPreserved} existing slots preserved`);
    console.log(`   - ${deletedSlotsCount} slots deleted for non-working days`);

    return {
      success: true,
      deletedSlotsForNonWorkingDays: deletedSlotsCount,
      templatesProcessed: templates.length,
      daysProcessed: totalDaysProcessed,
      totalSlotsCreated: totalSlotsCreated,
      slotsPreserved: slotsPreserved,
    };
  } catch (error) {
    console.error("❌ Slot generation failed:", error);
    throw error;
  }
};

// Get a specific time slot by ID
exports.getTimeSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: { showtimes: true },
    });
    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }
    res.status(200).json(mapTimeSlot(timeSlot));
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve time slot", error });
  }
};

// Update a time slot by ID
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { showtimes, ...rest } = req.body || {};

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(showtimes)) {
        await tx.timeSlotShowtime.deleteMany({ where: { timeSlotId: id } });
      }

      return tx.timeSlot.update({
        where: { id },
        data: {
          ...rest,
          ...(Array.isArray(showtimes)
            ? {
                showtimes: {
                  create: showtimes.map((showtime) => ({
                    date: new Date(showtime.date),
                    isBooked: !!showtime.is_booked,
                  })),
                },
              }
            : {}),
        },
        include: { showtimes: true },
      });
    });

    res.status(200).json(mapTimeSlot(updated));
  } catch (error) {
    res.status(500).json({ message: "Failed to update time slot", error });
  }
};

// Delete a time slot by ID
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.timeSlot.delete({ where: { id } });
    res.status(200).json({ message: "Time slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete time slot", error });
  }
};

exports.toggleShowtime = async (req, res) => {
  try {
    const { id, showtimeId } = req.params;

    const showtime = await prisma.timeSlotShowtime.findUnique({
      where: { id: showtimeId },
      include: { timeSlot: true },
    });

    if (!showtime || showtime.timeSlotId !== id) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    await prisma.timeSlotShowtime.update({
      where: { id: showtimeId },
      data: { isBooked: !showtime.isBooked },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to update showtime", error });
  }
};
