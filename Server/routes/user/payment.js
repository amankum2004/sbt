const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../../utils/prisma");
const { bookAppointment } = require("../../controllers/appointment-controller");
const {
  sendConfirmationEmail,
  sendConfirmationSms,
  sendPaymentSuccessSms,
  sendDonationConfirmationEmail,
  sendAdminDonationNotification,
} = require("../../utils/mail");

const router = express.Router();

const logNotificationFailure = (label, result) => {
  if (result?.status === "rejected") {
    console.warn(`⚠️ ${label} failed:`, result.reason?.message || result.reason);
  }
};

router.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({
        error: "Payment gateway configuration error",
        details: "Missing Razorpay credentials",
      });
    }

    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const options = {
      amount: Math.round(amount),
      currency,
      receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Order creation failed" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error("Error in /pay/order:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.post("/donation/validate", async (req, res) => {
  const { payment_id, order_id, signature, donationDetails } = req.body;

  if (!payment_id || !order_id || !signature) {
    return res.status(400).json({
      success: false,
      error: "Missing payment information",
    });
  }

  if (!donationDetails) {
    return res.status(400).json({
      success: false,
      error: "Missing donation details",
    });
  }

  const normalizePhone = (value = "") => String(value || "").replace(/\D/g, "").slice(-10);
  const { name, phone, email, amount, message } = donationDetails;
  const normalizedPhone = normalizePhone(phone);

  if (!name || !normalizedPhone || !amount) {
    return res.status(400).json({
      success: false,
      error: "Missing required donation fields: name, phone, and amount are required",
    });
  }

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  sha.update(`${order_id}|${payment_id}`);
  const digest = sha.digest("hex");

  if (digest !== signature) {
    return res.status(400).json({
      success: false,
      error: "Transaction verification failed",
    });
  }

  try {
    const savedDonation = await prisma.donation.create({
      data: {
        donorName: name ? name.trim() : "",
        donorPhone: normalizedPhone,
        donorEmail: email ? email.toLowerCase().trim() : null,
        amount: parseFloat(amount) || 0,
        message: message ? message.trim() : "",
        paymentId: payment_id,
        orderId: order_id,
        status: "completed",
        donatedAt: new Date(),
      },
    });

    if (email) {
      sendDonationConfirmationEmail(name, email, amount, message)
        .then(() => {
          console.log("Donation confirmation email sent");
        })
        .catch((emailError) => {
          console.warn("Email sending failed:", emailError.message);
        });
    }

    sendAdminDonationNotification({
      ...savedDonation,
      payment_id,
      order_id,
    })
      .then(() => {
        console.log("Admin donation alert email sent");
      })
      .catch((adminEmailError) => {
        console.warn("Admin donation alert failed:", adminEmailError.message);
      });

    res.status(200).json({
      success: true,
      message: "Donation successful! Thank you for your contribution to the environment.",
      donationId: savedDonation.id,
      amount: amount,
      type: "donation",
    });
  } catch (error) {
    console.error("Donation processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error processing donation",
      type: "processing_error",
    });
  }
});

router.post("/order/validate", async (req, res) => {
  const {
    payment_id,
    order_id,
    signature,
    customerEmail,
    customerPhone,
    customerName,
    shopDetails,
    selectedTimeSlot,
    userId,
  } = req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  sha.update(`${order_id}|${payment_id}`);
  const digest = sha.digest("hex");

  if (!signature || digest !== signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  const paymentValid = true;

  if (paymentValid) {
    const { shopName, location } = shopDetails;

    try {
      for (const slot of selectedTimeSlot) {
        const { timeSlotId, showtimeId } = slot;
        const timeSlot = await prisma.timeSlot.findUnique({
          where: { id: timeSlotId },
          include: { showtimes: true },
        });

        if (!timeSlot) {
          throw new Error(`Invalid TimeSlot ID: ${timeSlotId}`);
        }

        const showtime = timeSlot.showtimes.find((s) => s.id === showtimeId);
        if (!showtime || showtime.isBooked) {
          throw new Error(`Showtime is either booked or invalid for ID: ${showtimeId}`);
        }

        const shopOwnerId = timeSlot.shopOwnerId;
        await bookAppointment(
          shopOwnerId,
          timeSlotId,
          showtimeId,
          timeSlot.date,
          customerEmail || null,
          customerPhone || null,
          userId || null
        );
      }

      const notificationResults = await Promise.allSettled([
        ...(customerEmail
          ? [sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlot)]
          : []),
        ...(customerPhone
          ? [
              sendConfirmationSms(customerPhone, customerName, shopName, location, selectedTimeSlot),
              sendPaymentSuccessSms(
                customerPhone,
                customerName,
                shopName,
                location,
                selectedTimeSlot,
                null
              ),
            ]
          : []),
      ]);

      notificationResults.forEach((result, index) =>
        logNotificationFailure(`Post-payment notification ${index + 1}`, result)
      );

      return res.status(200).json({ message: "Payment successful and booking confirmed!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error booking appointment" });
    }
  } else {
    res.status(400).json({ error: "Payment validation failed" });
  }
});

// NEW ROUTE: Direct booking without payment
router.post("/book-direct", async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      userId,
      shopDetails,
      selectedTimeSlots,
      totalAmount,
      showtimeServices,
    } = req.body;

    if (!shopDetails || !shopDetails.shopId) {
      return res.status(400).json({ error: "Shop ID is required" });
    }

    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return res.status(400).json({ error: "No time slots selected" });
    }

    if (!customerPhone) {
      return res.status(400).json({ error: "Customer phone is required" });
    }

    if (!showtimeServices) {
      return res.status(400).json({ error: "Service information is required" });
    }

    const shopId = shopDetails.shopId;
    const shopName = shopDetails.shopName;
    const location = shopDetails.location;

    const firstTimeSlot = selectedTimeSlots[0];
    const timeSlotId = firstTimeSlot.timeSlotId;
    const showtimeId = firstTimeSlot.showtimeId;
    const date = firstTimeSlot.showtimeDate;

    const serviceInfo = showtimeServices[showtimeId];
    if (!serviceInfo) {
      return res.status(400).json({ error: "Service information not found for selected time slot" });
    }

    if (!shopId || !timeSlotId || !showtimeId || !date) {
      return res.status(400).json({
        error: "Missing required booking parameters",
        details: { shopId, timeSlotId, showtimeId, date },
      });
    }

    const appointment = await bookAppointment(
      shopId,
      timeSlotId,
      showtimeId,
      date,
      customerEmail || null,
      customerPhone,
      userId,
      serviceInfo,
      totalAmount
    );

    const notificationResults = await Promise.allSettled([
      ...(customerEmail
        ? [sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlots)]
        : []),
      ...(customerPhone
        ? [sendConfirmationSms(customerPhone, customerName, shopName, location, selectedTimeSlots)]
        : []),
    ]);

    notificationResults.forEach((result, index) =>
      logNotificationFailure(`Direct-booking notification ${index + 1}`, result)
    );

    res.json({
      success: true,
      appointment,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Direct booking error:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
