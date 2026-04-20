const prisma = require("../../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mapShop } = require("../../utils/legacy-mappers");
const { normalizePhone } = require("../../utils/phone");

const normalizeEmail = (value) => (value || "").trim().toLowerCase();
const SMS_OTP_ENABLED = process.env.ENABLE_SMS_OTP === "true";

const home = async (req, res) => {
  try {
    res.status(200).send("Welcome to Salon Booking Time platform ");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { name, phone, password, otp, email, usertype } = req.body;

    if (!name || !password || !phone || !usertype || (SMS_OTP_ENABLED && !otp)) {
      return res.status(200).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email ? normalizeEmail(email) : null;
    const normalizedPhone = normalizePhone(phone);

    const existingUser = await prisma.user.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { phone: normalizedPhone },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      },
      select: { id: true },
    });
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "User already exists",
      });
    }

    // Keep the OTP verification path ready for when SMS delivery is turned back on.
    if (SMS_OTP_ENABLED) {
      const latestOtp = await prisma.otp.findFirst({
        where: { phone: normalizedPhone },
        orderBy: { createdAt: "desc" },
      });

      if (!latestOtp || otp !== latestOtp.otp) {
        return res.status(200).json({
          success: false,
          message: "The OTP is not valid",
        });
      }
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        usertype,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        usertype: newUser.usertype,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const login = async (req, res) => {
  console.log("=== BACKEND LOGIN REQUEST START ===");
  // console.log("Request body:", req.body);
  console.log("Request time:", new Date().toISOString());

  const { phone, password } = req.body;

  try {
    if (!password) {
      return res.status(200).json({
        success: false,
        error: "Password is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, isDeleted: false },
    });

    if (!user) {
      return res.status(200).json({
        success: false,
        error: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(200).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    let shop = null;
    if (user.usertype === "shopOwner") {
      const shopRecord = await prisma.shop.findFirst({
        where: { ownerPhone: user.phone },
        include: { services: true },
      });
      shop = shopRecord ? mapShop(shopRecord) : null;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email || null,
        usertype: user.usertype || "customer",
        name: user.name || "user",
        phone: user.phone || "",
      },
      `${process.env.JWT_SECRET || "secret"}`,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      userId: user.id,
      email: user.email || null,
      usertype: user.usertype || "customer",
      name: user.name || "user",
      phone: user.phone || "",
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      shop: shop || null,
    };

    return res.status(200).json({
      success: true,
      user: userResponse,
      token: token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const update = async (req, res) => {
  try {
    const { phone, password, otp } = req.body;
    if (!phone || !password || (SMS_OTP_ENABLED && !otp)) {
      return res.status(200).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedPhone = normalizePhone(phone);
    // Keep the OTP verification path ready for when SMS delivery is turned back on.
    if (SMS_OTP_ENABLED) {
      const latestOtp = await prisma.otp.findFirst({
        where: { phone: normalizedPhone },
        orderBy: { createdAt: "desc" },
      });

      if (!latestOtp || otp !== latestOtp.otp) {
        return res.status(200).json({
          success: false,
          message: "The OTP is not valid",
        });
      }
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, isDeleted: false },
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const user = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`Error from the user route: ${error}`);
  }
};

module.exports = { home, register, login, user, update };
