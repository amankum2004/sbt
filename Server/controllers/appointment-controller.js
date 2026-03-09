const prisma = require("../utils/prisma");
const { emitShopSlotsUpdated } = require("../utils/socket");
const { mapAppointment } = require("../utils/legacy-mappers");

exports.bookAppointment = async (
  shopId,
  timeSlotId,
  showtimeId,
  date,
  customerEmail,
  userId,
  serviceInfo,
  totalAmount
) => {
  return prisma.$transaction(async (tx) => {
    console.log("Booking parameters:", {
      timeSlotId,
      showtimeId,
      date,
      customerEmail,
      userId,
      serviceInfo,
      totalAmount,
    });

    const showtime = await tx.timeSlotShowtime.findUnique({
      where: { id: showtimeId },
      include: { timeSlot: true },
    });

    if (!showtime) {
      throw new Error(`Showtime not found. Looking for ID: ${showtimeId}`);
    }

    if (timeSlotId && showtime.timeSlotId !== timeSlotId) {
      throw new Error("Showtime does not belong to the selected time slot");
    }

    if (shopId && showtime.timeSlot?.shopOwnerId && showtime.timeSlot.shopOwnerId !== shopId) {
      throw new Error("Showtime does not belong to the selected shop");
    }

    if (showtime.isBooked) {
      throw new Error("Showtime is already booked");
    }

    const servicePayload = (() => {
      let serviceName = "General Service";
      let servicePrice = totalAmount || 0;

      if (serviceInfo && typeof serviceInfo === "object") {
        if (serviceInfo.service) {
          serviceName = serviceInfo.service;
        }
        if (serviceInfo.name) {
          serviceName = serviceInfo.name;
        }
        if (serviceInfo.price) {
          servicePrice = parseFloat(serviceInfo.price);
        } else if (serviceInfo.service && serviceInfo.service !== "General Service") {
          const priceMatch = String(serviceInfo.service).match(/\d+/);
          if (priceMatch) {
            servicePrice = parseFloat(priceMatch[0]);
          }
        }
      }

      if (!Number.isFinite(servicePrice)) {
        servicePrice = Number(totalAmount) || 0;
      }

      return { serviceName, servicePrice };
    })();

    const updateResult = await tx.timeSlotShowtime.updateMany({
      where: {
        id: showtimeId,
        isBooked: false,
      },
      data: { isBooked: true },
    });

    if (updateResult.count === 0) {
      throw new Error("Showtime is already booked");
    }

    const appointmentDate = date ? new Date(date) : showtime.date;

    const appointment = await tx.appointment.create({
      data: {
        customerEmail,
        userId,
        shopId,
        timeSlotId: showtime.timeSlotId,
        status: "confirmed",
        bookedAt: new Date(),
        totalAmount: Number(servicePayload.servicePrice) || 0,
        showtimes: {
          create: [
            {
              showtimeId: showtime.id,
              date: appointmentDate,
              serviceName: servicePayload.serviceName,
              servicePrice: Number(servicePayload.servicePrice) || 0,
            },
          ],
        },
      },
      include: {
        showtimes: {
          include: { showtime: true },
        },
      },
    });

    emitShopSlotsUpdated(shopId, {
      action: "booked",
      timeSlotId: String(showtime.timeSlotId),
      showtimeId: String(showtime.id),
      appointmentId: String(appointment.id),
    });

    return mapAppointment(appointment);
  });
};
