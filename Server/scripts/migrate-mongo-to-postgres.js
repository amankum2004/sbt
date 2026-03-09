const path = require("path");
const { config } = require("dotenv");
const mongoose = require("mongoose");

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
config({ path: path.resolve(__dirname, "..", envFile) });

const prisma = require("../utils/prisma");

const User = require("../models/user/user-model");
const OTP = require("../models/user/otp-model");
const Shop = require("../models/registerShop-model");
const TimeSlot = require("../models/timeSlot-model");
const Template = require("../models/timeSlotTemplate-model");
const Appointment = require("../models/appointment-model");
const Review = require("../models/review");
const Contact = require("../models/contact-model");
const Donation = require("../models/donation-model");

const toId = (value) => (value ? String(value) : null);
const normalizeEnum = (value, allowedValues, fallback) =>
  allowedValues.has(value) ? value : fallback;

const USER_TYPES = new Set(["customer", "shopOwner", "admin"]);
const APPOINTMENT_STATUSES = new Set(["confirmed", "pending", "cancelled", "completed"]);
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);
const DONATION_STATUSES = new Set(["pending", "completed", "failed"]);
const SHOP_STATUSES = new Set(["open", "closed", "break"]);
const COORDINATE_SOURCES = new Set([
  "device_gps",
  "google_geocode",
  "manual_update",
  "fallback",
]);

const resetPostgres = async () => {
  console.log("⚠️ Resetting PostgreSQL data...");

  await prisma.appointmentShowtime.deleteMany();
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.timeSlotShowtime.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.template.deleteMany();
  await prisma.shopService.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ PostgreSQL reset completed.");
};

const migrateUsers = async () => {
  const users = await User.find().lean();
  const userIds = new Set();

  for (const user of users) {
    const id = toId(user._id);
    if (!id) continue;

    userIds.add(id);

    await prisma.user.upsert({
      where: { id },
      update: {
        name: user.name,
        email: (user.email || "").toLowerCase(),
        phone: user.phone,
        password: user.password,
        usertype: normalizeEnum(user.usertype, USER_TYPES, "customer"),
        createdAt: user.createdAt || undefined,
        updatedAt: user.updatedAt || undefined,
      },
      create: {
        id,
        name: user.name,
        email: (user.email || "").toLowerCase(),
        phone: user.phone,
        password: user.password,
        usertype: normalizeEnum(user.usertype, USER_TYPES, "customer"),
        createdAt: user.createdAt || undefined,
        updatedAt: user.updatedAt || undefined,
      },
    });
  }

  console.log(`✅ Users migrated: ${userIds.size}`);
  return userIds;
};

const migrateOtps = async () => {
  const otps = await OTP.find().lean();

  for (const otp of otps) {
    const id = toId(otp._id);
    if (!id) continue;

    await prisma.otp.upsert({
      where: { id },
      update: {
        email: (otp.email || "").toLowerCase(),
        otp: otp.otp,
        createdAt: otp.createdAt || undefined,
      },
      create: {
        id,
        email: (otp.email || "").toLowerCase(),
        otp: otp.otp,
        createdAt: otp.createdAt || undefined,
      },
    });
  }

  console.log(`✅ OTPs migrated: ${otps.length}`);
};

const migrateShops = async () => {
  const shops = await Shop.find().lean();
  const shopIds = new Set();

  for (const shop of shops) {
    const id = toId(shop._id);
    if (!id) continue;

    shopIds.add(id);

    await prisma.shop.upsert({
      where: { id },
      update: {
        name: shop.name,
        email: (shop.email || "").toLowerCase(),
        phone: shop.phone,
        password: shop.password || null,
        shopname: shop.shopname,
        state: shop.state,
        district: shop.district,
        city: shop.city,
        street: shop.street,
        pin: shop.pin,
        lat: Number(shop.lat) || 0,
        lng: Number(shop.lng) || 0,
        coordinatesSource: normalizeEnum(
          shop.coordinatesSource,
          COORDINATE_SOURCES,
          "device_gps"
        ),
        isApproved: !!shop.isApproved,
        status: normalizeEnum(shop.status, SHOP_STATUSES, "open"),
        statusLastUpdated: shop.statusLastUpdated || undefined,
        averageRating: Number(shop.averageRating) || 0,
        totalReviews: Number(shop.totalReviews) || 0,
        ratingBreakdown: shop.ratingBreakdown || undefined,
        createdAt: shop.createdAt || undefined,
        updatedAt: shop.updatedAt || undefined,
      },
      create: {
        id,
        name: shop.name,
        email: (shop.email || "").toLowerCase(),
        phone: shop.phone,
        password: shop.password || null,
        shopname: shop.shopname,
        state: shop.state,
        district: shop.district,
        city: shop.city,
        street: shop.street,
        pin: shop.pin,
        lat: Number(shop.lat) || 0,
        lng: Number(shop.lng) || 0,
        coordinatesSource: normalizeEnum(
          shop.coordinatesSource,
          COORDINATE_SOURCES,
          "device_gps"
        ),
        isApproved: !!shop.isApproved,
        status: normalizeEnum(shop.status, SHOP_STATUSES, "open"),
        statusLastUpdated: shop.statusLastUpdated || undefined,
        averageRating: Number(shop.averageRating) || 0,
        totalReviews: Number(shop.totalReviews) || 0,
        ratingBreakdown: shop.ratingBreakdown || undefined,
        createdAt: shop.createdAt || undefined,
        updatedAt: shop.updatedAt || undefined,
      },
    });

    await prisma.shopService.deleteMany({ where: { shopId: id } });

    const services = Array.isArray(shop.services) ? shop.services : [];
    if (services.length) {
      await prisma.shopService.createMany({
        data: services.map((service) => ({
          id: toId(service._id) || undefined,
          shopId: id,
          service: service.service,
          price: String(service.price ?? ""),
        })),
        skipDuplicates: true,
      });
    }
  }

  console.log(`✅ Shops migrated: ${shopIds.size}`);
  return shopIds;
};

const migrateTemplates = async (shopIds) => {
  const templates = await Template.find().lean();

  for (const template of templates) {
    const id = toId(template._id);
    const shopOwnerId = toId(template.shop_owner_id);
    if (!id || !shopOwnerId || !shopIds.has(shopOwnerId)) continue;

    await prisma.template.upsert({
      where: { id },
      update: {
        shopOwnerId,
        name: template.name,
        email: template.email,
        phone: template.phone,
        workingDays: template.workingDays || [],
        startTime: template.startTime,
        endTime: template.endTime,
        slotInterval: Number(template.slotInterval) || 0,
        createdAt: template.createdAt || undefined,
        updatedAt: template.updatedAt || undefined,
      },
      create: {
        id,
        shopOwnerId,
        name: template.name,
        email: template.email,
        phone: template.phone,
        workingDays: template.workingDays || [],
        startTime: template.startTime,
        endTime: template.endTime,
        slotInterval: Number(template.slotInterval) || 0,
        createdAt: template.createdAt || undefined,
        updatedAt: template.updatedAt || undefined,
      },
    });
  }

  console.log(`✅ Templates migrated: ${templates.length}`);
};

const migrateTimeSlots = async (shopIds) => {
  const timeSlots = await TimeSlot.find().lean();
  const timeSlotIds = new Set();
  const showtimeIds = new Set();

  for (const slot of timeSlots) {
    const id = toId(slot._id);
    const shopOwnerId = toId(slot.shop_owner_id);
    if (!id || !shopOwnerId || !shopIds.has(shopOwnerId)) continue;

    timeSlotIds.add(id);

    await prisma.timeSlot.upsert({
      where: { id },
      update: {
        shopOwnerId,
        name: slot.name,
        email: slot.email,
        phone: slot.phone,
        date: slot.date ? new Date(slot.date) : new Date(),
      },
      create: {
        id,
        shopOwnerId,
        name: slot.name,
        email: slot.email,
        phone: slot.phone,
        date: slot.date ? new Date(slot.date) : new Date(),
      },
    });

    await prisma.timeSlotShowtime.deleteMany({ where: { timeSlotId: id } });

    const showtimes = Array.isArray(slot.showtimes) ? slot.showtimes : [];
    if (showtimes.length) {
      await prisma.timeSlotShowtime.createMany({
        data: showtimes.map((showtime) => {
          const showtimeId = toId(showtime._id) || undefined;
          if (showtimeId) showtimeIds.add(showtimeId);
          return {
            id: showtimeId,
            timeSlotId: id,
            date: showtime.date ? new Date(showtime.date) : new Date(),
            isBooked: !!showtime.is_booked,
          };
        }),
        skipDuplicates: true,
      });
    }
  }

  console.log(`✅ Time slots migrated: ${timeSlotIds.size}`);
  console.log(`✅ Showtimes migrated: ${showtimeIds.size}`);
  return { timeSlotIds, showtimeIds };
};

const migrateAppointments = async (userIds, shopIds, timeSlotIds, showtimeIds) => {
  const appointments = await Appointment.find().lean();
  const appointmentIds = new Set();

  for (const appointment of appointments) {
    const id = toId(appointment._id);
    const userId = toId(appointment.userId);
    const shopId = toId(appointment.shopId);
    const timeSlotId = toId(appointment.timeSlot);

    if (!id || !userId || !shopId || !timeSlotId) continue;
    if (!userIds.has(userId) || !shopIds.has(shopId) || !timeSlotIds.has(timeSlotId)) {
      console.warn("Skipping appointment due to missing FK:", id);
      continue;
    }

    appointmentIds.add(id);

    await prisma.appointment.upsert({
      where: { id },
      update: {
        customerEmail: appointment.customerEmail,
        userId,
        shopId,
        timeSlotId,
        status: normalizeEnum(appointment.status, APPOINTMENT_STATUSES, "confirmed"),
        bookedAt: appointment.bookedAt ? new Date(appointment.bookedAt) : undefined,
        totalAmount: Number(appointment.totalAmount) || 0,
        createdAt: appointment.createdAt || undefined,
        updatedAt: appointment.updatedAt || undefined,
      },
      create: {
        id,
        customerEmail: appointment.customerEmail,
        userId,
        shopId,
        timeSlotId,
        status: normalizeEnum(appointment.status, APPOINTMENT_STATUSES, "confirmed"),
        bookedAt: appointment.bookedAt ? new Date(appointment.bookedAt) : new Date(),
        totalAmount: Number(appointment.totalAmount) || 0,
        createdAt: appointment.createdAt || undefined,
        updatedAt: appointment.updatedAt || undefined,
      },
    });

    await prisma.appointmentShowtime.deleteMany({ where: { appointmentId: id } });

    const showtimes = Array.isArray(appointment.showtimes) ? appointment.showtimes : [];
    if (showtimes.length) {
      const appointmentShowtimes = showtimes
        .map((showtime) => {
          const showtimeId = toId(showtime.showtimeId);
          if (!showtimeId || !showtimeIds.has(showtimeId)) return null;
          return {
            id: toId(showtime._id) || undefined,
            appointmentId: id,
            showtimeId,
            date: showtime.date ? new Date(showtime.date) : new Date(),
            serviceName: showtime.service?.name || "General Service",
            servicePrice: Number(showtime.service?.price) || Number(appointment.totalAmount) || 0,
          };
        })
        .filter(Boolean);

      if (appointmentShowtimes.length) {
        await prisma.appointmentShowtime.createMany({
          data: appointmentShowtimes,
          skipDuplicates: true,
        });
      }
    }
  }

  console.log(`✅ Appointments migrated: ${appointmentIds.size}`);
  return appointmentIds;
};

const migrateReviews = async (userIds, shopIds, appointmentIds) => {
  const reviews = await Review.find().lean();

  for (const review of reviews) {
    const id = toId(review._id);
    const userId = toId(review.userId);
    const shopId = toId(review.shopId);
    const appointmentId = toId(review.appointmentId);

    if (!id || !userId || !shopId || !appointmentId) continue;
    if (!userIds.has(userId) || !shopIds.has(shopId) || !appointmentIds.has(appointmentId)) {
      console.warn("Skipping review due to missing FK:", id);
      continue;
    }

    await prisma.review.upsert({
      where: { id },
      update: {
        userId,
        shopId,
        appointmentId,
        userName: review.userName,
        userEmail: review.userEmail,
        rating: Number(review.rating) || 0,
        comment: review.comment || null,
        status: normalizeEnum(review.status, REVIEW_STATUSES, "approved"),
        createdAt: review.createdAt || undefined,
        updatedAt: review.updatedAt || undefined,
      },
      create: {
        id,
        userId,
        shopId,
        appointmentId,
        userName: review.userName,
        userEmail: review.userEmail,
        rating: Number(review.rating) || 0,
        comment: review.comment || null,
        status: normalizeEnum(review.status, REVIEW_STATUSES, "approved"),
        createdAt: review.createdAt || undefined,
        updatedAt: review.updatedAt || undefined,
      },
    });
  }

  console.log(`✅ Reviews migrated: ${reviews.length}`);
};

const migrateContacts = async () => {
  const contacts = await Contact.find().lean();

  for (const contact of contacts) {
    const id = toId(contact._id);
    if (!id) continue;

    await prisma.contact.upsert({
      where: { id },
      update: {
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.createdAt || undefined,
        updatedAt: contact.updatedAt || undefined,
      },
      create: {
        id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.createdAt || undefined,
        updatedAt: contact.updatedAt || undefined,
      },
    });
  }

  console.log(`✅ Contacts migrated: ${contacts.length}`);
};

const migrateDonations = async () => {
  const donations = await Donation.find().lean();

  for (const donation of donations) {
    const id = toId(donation._id);
    if (!id) continue;

    await prisma.donation.upsert({
      where: { id },
      update: {
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amount: Number(donation.amount) || 0,
        message: donation.message || null,
        paymentId: donation.payment_id,
        orderId: donation.order_id,
        status: normalizeEnum(donation.status, DONATION_STATUSES, "completed"),
        donatedAt: donation.donatedAt || undefined,
        createdAt: donation.createdAt || undefined,
        updatedAt: donation.updatedAt || undefined,
      },
      create: {
        id,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amount: Number(donation.amount) || 0,
        message: donation.message || null,
        paymentId: donation.payment_id,
        orderId: donation.order_id,
        status: normalizeEnum(donation.status, DONATION_STATUSES, "completed"),
        donatedAt: donation.donatedAt || undefined,
        createdAt: donation.createdAt || undefined,
        updatedAt: donation.updatedAt || undefined,
      },
    });
  }

  console.log(`✅ Donations migrated: ${donations.length}`);
};

const migrate = async () => {
  const shouldReset = process.argv.includes("--reset");

  if (!process.env.MONGO_DB) {
    throw new Error("MONGO_DB is missing from environment");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from environment");
  }

  await prisma.$connect();
  await mongoose.connect(process.env.MONGO_DB);

  if (shouldReset) {
    await resetPostgres();
  }

  const userIds = await migrateUsers();
  await migrateOtps();
  const shopIds = await migrateShops();
  await migrateTemplates(shopIds);
  const { timeSlotIds, showtimeIds } = await migrateTimeSlots(shopIds);
  const appointmentIds = await migrateAppointments(userIds, shopIds, timeSlotIds, showtimeIds);
  await migrateReviews(userIds, shopIds, appointmentIds);
  await migrateContacts();
  await migrateDonations();

  await mongoose.disconnect();
  await prisma.$disconnect();

  console.log("✅ Migration completed.");
};

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
