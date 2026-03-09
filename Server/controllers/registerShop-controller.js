const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const {
  sendShopStatusNotification,
  sendAdminPendingShopNotification,
} = require("../utils/mail");
const { mapShop } = require("../utils/legacy-mappers");

const VALID_COORDINATE_SOURCES = new Set([
  "device_gps",
  "google_geocode",
  "manual_update",
  "fallback",
]);

const toCoordinateNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const latDiff = toRadians(lat2 - lat1);
  const lngDiff = toRadians(lng2 - lng1);

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const normalizeServices = (services) => {
  if (Array.isArray(services)) return services;
  if (typeof services === "string") {
    try {
      const parsed = JSON.parse(services);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const buildServicePayload = (services) => {
  return normalizeServices(services)
    .map((service) => {
      const serviceName = (service?.service || "").trim();
      const price = service?.price !== undefined ? String(service.price).trim() : "";
      if (!serviceName) return null;
      return { service: serviceName, price };
    })
    .filter(Boolean);
};

exports.registershop = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      shopname,
      state,
      district,
      city,
      street,
      pin,
      services,
      lat,
      lng,
      coordinatesSource,
    } = req.body;

    const requiredFields = [
      "name",
      "email",
      "phone",
      "shopname",
      "state",
      "district",
      "city",
      "street",
      "pin",
      "services",
    ];

    const latitude = toCoordinateNumber(lat);
    const longitude = toCoordinateNumber(lng);

    if (latitude === null || longitude === null) {
      return res.status(400).json({
        message: "Shop location coordinates are required",
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: "Invalid coordinates provided",
      });
    }

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(200).json({
          success: false,
          message: `${field} is required`,
          extraDetails: `Missing required field: ${field}`,
        });
      }
    }

    const normalizedEmail = normalizeEmail(email);

    const shopExists = await prisma.shop.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (shopExists) {
      return res.status(200).json({
        success: false,
        message: "Shop with this email already exists",
      });
    }

    let hash_password;
    if (password) {
      const userExist = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });

      if (!userExist) {
        return res.status(200).json({
          success: false,
          message: "No user found with this email",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, userExist.password);
      if (!isPasswordValid) {
        return res.status(200).json({
          success: false,
          message: "Invalid password",
        });
      }

      const saltRound = 10;
      hash_password = await bcrypt.hash(password, saltRound);
    }

    const finalCoordinateSource = VALID_COORDINATE_SOURCES.has(coordinatesSource)
      ? coordinatesSource
      : "device_gps";

    const servicePayload = buildServicePayload(services);

    const newShop = await prisma.shop.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hash_password || undefined,
        shopname,
        state,
        district,
        city,
        street,
        pin,
        lat: latitude,
        lng: longitude,
        coordinatesSource: finalCoordinateSource,
        isApproved: !password,
        services: servicePayload.length
          ? {
              create: servicePayload,
            }
          : undefined,
      },
      include: { services: true },
    });

    const mappedShop = mapShop(newShop);

    if (!newShop.isApproved) {
      sendAdminPendingShopNotification(mappedShop)
        .then(() => {
          console.log(`✅ Admin notified for pending shop: ${mappedShop?._id}`);
        })
        .catch((emailError) => {
          console.warn(
            "⚠️ Failed to send pending shop notification to admin:",
            emailError?.message || emailError
          );
        });
    }

    return res.status(201).json({
      success: true,
      message: password
        ? "Shop registered successfully. Awaiting admin approval."
        : "Shop created by admin successfully",
      data: {
        shopId: newShop.id,
        name: newShop.name,
        email: newShop.email,
        isApproved: newShop.isApproved,
        location: {
          lat: newShop.lat,
          lng: newShop.lng,
        },
      },
    });
  } catch (err) {
    console.error("Shop registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Check if shop exists by email
exports.checkShopExists = async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = normalizeEmail(email);

    const shop = await prisma.shop.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      include: { services: true },
    });

    if (shop) {
      return res.status(200).json({
        success: true,
        exists: true,
        shop: mapShop(shop),
        isApproved: shop.isApproved,
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      shop: null,
      isApproved: false,
    });
  } catch (error) {
    console.error("Error checking shop existence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all approved shops (for customers)
exports.getAllApprovedShops = async (req, res) => {
  try {
    const { state, district, city, lat, lng } = req.query;
    const query = { isApproved: true };

    if (state) {
      query.state = { contains: state, mode: "insensitive" };
    }
    if (district) {
      query.district = { contains: district, mode: "insensitive" };
    }
    if (city) {
      query.city = { contains: city, mode: "insensitive" };
    }

    const requesterLat = toCoordinateNumber(lat);
    const requesterLng = toCoordinateNumber(lng);
    const shouldSortByDistance =
      requesterLat !== null &&
      requesterLng !== null &&
      requesterLat >= -90 &&
      requesterLat <= 90 &&
      requesterLng >= -180 &&
      requesterLng <= 180;

    let shops = await prisma.shop.findMany({
      where: query,
      include: { services: true },
    });

    if (shouldSortByDistance) {
      shops = shops
        .map((shop) => {
          const shopLat = toCoordinateNumber(shop.lat);
          const shopLng = toCoordinateNumber(shop.lng);
          const hasCoordinates = shopLat !== null && shopLng !== null;
          const distance = hasCoordinates
            ? haversineDistanceKm(requesterLat, requesterLng, shopLat, shopLng)
            : Infinity;

          return {
            ...mapShop(shop),
            distance: Number.isFinite(distance) ? Number(distance.toFixed(3)) : null,
          };
        })
        .sort((a, b) => {
          const first = Number.isFinite(a.distance) ? a.distance : Infinity;
          const second = Number.isFinite(b.distance) ? b.distance : Infinity;
          return first - second;
        });
    } else {
      shops = shops.map(mapShop);
    }

    return res.status(200).json(Array.isArray(shops) ? shops : []);
  } catch (error) {
    console.log("Error while getting all shops", error);
    res.status(500).json({
      message: "Error fetching shops",
      error: error.message,
    });
  }
};

// LOGIC TO GET SINGLE Shop DATA
exports.getShopById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.shop.findUnique({
      where: { id },
      include: { services: true },
    });
    return res.status(200).json(data ? mapShop(data) : null);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch shop" });
  }
};

// Function to get shopId from user's email
exports.getShopByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const shop = await prisma.shop.findFirst({
      where: {
        email: {
          equals: normalizeEmail(email),
          mode: "insensitive",
        },
      },
      include: { services: true },
    });

    if (!shop) {
      return res.status(200).json({ success: false, message: "Shop not found" });
    }
    res.status(200).json(mapShop(shop));
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop data", error });
  }
};

// update barber Profile by email
exports.updateBarberProfile = async (req, res) => {
  try {
    const { email, lat, lng, latString, lngString, services, ...rest } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const hasLat = lat !== undefined;
    const hasLng = lng !== undefined;
    const updatePayload = { ...rest };

    if (!VALID_COORDINATE_SOURCES.has(updatePayload.coordinatesSource)) {
      delete updatePayload.coordinatesSource;
    }

    if (hasLat !== hasLng) {
      return res.status(400).json({
        success: false,
        message: "Both latitude and longitude are required together",
      });
    }

    if (hasLat && hasLng) {
      const latitude = toCoordinateNumber(lat);
      const longitude = toCoordinateNumber(lng);

      if (latitude === null || longitude === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates provided",
        });
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: "Coordinates are out of valid range",
        });
      }

      updatePayload.lat = latitude;
      updatePayload.lng = longitude;
      updatePayload.coordinatesSource =
        updatePayload.coordinatesSource || "manual_update";
    }

    if (latString !== undefined || lngString !== undefined) {
      updatePayload.coordinatesSource = updatePayload.coordinatesSource || "manual_update";
    }

    const normalizedEmail = normalizeEmail(email);
    const servicePayload = buildServicePayload(services);

    const updatedProfile = await prisma.$transaction(async (tx) => {
      if (Array.isArray(services)) {
        await tx.shopService.deleteMany({
          where: {
            shop: {
              email: {
                equals: normalizedEmail,
                mode: "insensitive",
              },
            },
          },
        });
      }

      return tx.shop.update({
        where: { email: normalizedEmail },
        data: {
          ...updatePayload,
          ...(Array.isArray(services)
            ? {
                services: {
                  create: servicePayload,
                },
              }
            : {}),
        },
        include: { services: true },
      });
    });

    if (!updatedProfile) {
      return res.status(200).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json(mapShop(updatedProfile));
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(200).json({ success: false, message: "Profile not found" });
    }
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// Update shop status
exports.updateShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    if (!["open", "closed", "break"].includes(status)) {
      return res.status(200).json({
        success: false,
        message: "Invalid status. Must be: open, closed, or break",
      });
    }

    let updatedShop;
    try {
      updatedShop = await prisma.shop.update({
        where: { id: shopId },
        data: {
          status,
          statusLastUpdated: new Date(),
        },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(200).json({
          success: false,
          message: "Shop not found",
        });
      }
      throw error;
    }

    await notifyCustomersAboutStatusChange(updatedShop, status);

    res.status(200).json({
      success: true,
      message: `Shop status updated to ${status}`,
      data: {
        shopId: updatedShop.id,
        status: updatedShop.status,
        statusLastUpdated: updatedShop.statusLastUpdated,
      },
    });
  } catch (error) {
    console.error("Error updating shop status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get shop status
exports.getShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        status: true,
        statusLastUpdated: true,
        shopname: true,
        name: true,
      },
    });

    if (!shop) {
      return res.status(200).json({
        success: false,
        message: "Shop not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: shop.status,
        statusLastUpdated: shop.statusLastUpdated,
        shopname: shop.shopname,
        name: shop.name,
      },
    });
  } catch (error) {
    console.error("Error fetching shop status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const notifyCustomersAboutStatusChange = async (shop, newStatus) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        status: { in: ["confirmed", "pending"] },
        showtimes: {
          some: {
            date: {
              gte: new Date(),
              lte: sevenDaysFromNow,
            },
          },
        },
      },
      include: {
        user: { select: { email: true, name: true } },
        showtimes: { orderBy: { date: "asc" } },
      },
    });

    if (upcomingAppointments.length === 0) {
      console.log("No upcoming appointments to notify");
      return;
    }

    for (const appointment of upcomingAppointments) {
      await sendShopStatusNotification(
        appointment.user?.email,
        appointment.user?.name,
        shop.shopname,
        newStatus,
        appointment.showtimes?.[0]?.date
      );
    }

    console.log(
      `Notified ${upcomingAppointments.length} customers about shop status change`
    );
  } catch (error) {
    console.error("Error notifying customers:", error);
  }
};
