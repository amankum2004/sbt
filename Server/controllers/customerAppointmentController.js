const prisma = require("../utils/prisma");
const { mapAppointment, mapShop } = require("../utils/legacy-mappers");

const buildFullAddress = (shop) => {
  if (!shop) return "";
  const parts = [];
  if (shop.street) parts.push(shop.street);
  if (shop.city) parts.push(shop.city);
  if (shop.district && shop.district !== shop.city) parts.push(shop.district);
  if (shop.state) parts.push(shop.state);
  const pin = shop.pin ? ` - ${shop.pin}` : "";
  return `${parts.join(", ")}${pin}`.trim();
};

// Get customer appointments
exports.getCustomerAppointments = async (req, res) => {
  try {
    const { customerEmail } = req.params;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: "Customer email is required",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: { customerEmail },
      include: {
        shop: { include: { services: true } },
        timeSlot: { include: { showtimes: true } },
        showtimes: { include: { showtime: true } },
      },
      orderBy: { bookedAt: "desc" },
    });

    const allAppointments = appointments.map((appointment) => {
      const mapped = mapAppointment(appointment);
      if (mapped.shopId && typeof mapped.shopId === "object") {
        mapped.shopId.fullAddress = buildFullAddress(mapped.shopId);
      }
      return mapped;
    });

    const currentAppointments = [];
    const pastAppointments = [];
    const now = new Date();

    allAppointments.forEach((appointment) => {
      const appointmentShowtime = appointment.showtimes && appointment.showtimes[0];
      const appointmentDate = appointmentShowtime?.date || appointment.timeSlot?.date;

      if (!appointmentDate || appointment.status === "cancelled") {
        pastAppointments.push(appointment);
        return;
      }

      const appointmentDateTime = new Date(appointmentDate);
      if (appointmentDateTime > now) {
        currentAppointments.push(appointment);
      } else {
        pastAppointments.push(appointment);
      }
    });

    res.status(200).json({
      success: true,
      currentAppointments,
      pastAppointments,
      totalAppointments: allAppointments.length,
    });
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointments",
    });
  }
};

// Get detailed appointment information
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: "Appointment ID is required",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        shop: { include: { services: true } },
        timeSlot: { include: { showtimes: true } },
        showtimes: { include: { showtime: true } },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    const appointmentObj = mapAppointment(appointment);

    if (appointmentObj.timeSlot && appointmentObj.timeSlot.showtimes) {
      appointmentObj.showtimes = appointmentObj.showtimes.map((showtime) => {
        const matchedShowtime = appointmentObj.timeSlot.showtimes.find(
          (st) => String(st._id) === String(showtime.showtimeId?._id || showtime.showtimeId)
        );

        return {
          ...showtime,
          showtimeData: matchedShowtime || null,
        };
      });
    }

    res.status(200).json({
      success: true,
      appointment: appointmentObj,
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointment details",
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log("=== CANCEL APPOINTMENT REQUEST ===");
    console.log("Appointment ID:", appointmentId);

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        timeSlot: { include: { showtimes: true } },
        user: { select: { name: true, email: true } },
        shop: { include: { services: true } },
        showtimes: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    let appointmentDateTime = null;

    if (appointment.showtimes && appointment.showtimes.length > 0) {
      appointmentDateTime = new Date(appointment.showtimes[0].date);
    } else if (appointment.timeSlot?.date) {
      appointmentDateTime = new Date(appointment.timeSlot.date);
    }

    if (appointmentDateTime) {
      const now = new Date();
      if (appointmentDateTime < now) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel past appointments",
        });
      }
    }

    if (appointment.showtimes && appointment.showtimes.length > 0) {
      const showtimeId = appointment.showtimes[0].showtimeId;
      if (showtimeId) {
        await prisma.timeSlotShowtime.update({
          where: { id: showtimeId },
          data: { isBooked: false },
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });

    const customerEmail = appointment.customerEmail;
    const customerName = appointment.user?.name || appointment.customerEmail.split("@")[0];
    const mappedShop = mapShop(appointment.shop);
    const shopName = mappedShop?.name || mappedShop?.shopname || "Salon";
    const shopLocation = mappedShop?.address || buildFullAddress(mappedShop) || "Unknown Location";

    try {
      const { sendCancellationEmail } = require("../utils/mail");

      const mappedShowtimes = (appointment.showtimes || []).map((showtime) => ({
        date: showtime.date,
        service: showtime.serviceName
          ? { name: showtime.serviceName, price: showtime.servicePrice }
          : null,
      }));

      const appointmentDetails = {
        appointmentId: appointment.id,
        showtimes: mappedShowtimes,
        totalAmount: appointment.totalAmount,
        services: mappedShowtimes
          .map((item) => item.service)
          .filter(Boolean),
        bookedAt: appointment.bookedAt,
      };

      sendCancellationEmail(
        customerEmail,
        customerName,
        shopName,
        shopLocation,
        appointmentDetails
      );
    } catch (emailError) {
      console.error("Failed to send cancellation emails:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: {
        _id: updatedAppointment.id,
        status: updatedAppointment.status,
        customerEmail: updatedAppointment.customerEmail,
        shopId: updatedAppointment.shopId,
        shopName: shopName,
        customerName: customerName,
      },
    });

    console.log("=== APPOINTMENT CANCELLED SUCCESSFULLY ===");
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const { customerEmail } = req.params;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: "Customer email is required",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: { customerEmail },
      include: { timeSlot: true },
    });

    const now = new Date();
    const stats = {
      total: appointments.length,
      upcoming: appointments.filter(
        (apt) => apt.timeSlot && new Date(apt.timeSlot.date) >= now && apt.status !== "cancelled"
      ).length,
      completed: appointments.filter(
        (apt) => apt.timeSlot && new Date(apt.timeSlot.date) < now && apt.status !== "cancelled"
      ).length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
      pending: appointments.filter((apt) => apt.status === "pending").length,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointment statistics",
    });
  }
};
