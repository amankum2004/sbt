const otpGenerator = require("otp-generator");
const prisma = require("../../utils/prisma");
const { sendOtpSms } = require("../../utils/mail");
const { normalizePhone } = require("../../utils/phone");
const SMS_OTP_ENABLED = process.env.ENABLE_SMS_OTP === "true";

const buildOtpFailureMessage = (error) => {
  const rawMessage = error?.message || "";
  const isSchemaMismatch =
    error?.code === "P2022" ||
    /column [`"]?phone[`"]? does not exist/i.test(rawMessage) ||
    /current database/i.test(rawMessage);

  if (isSchemaMismatch) {
    return process.env.NODE_ENV === "development"
      ? "The database schema is outdated for phone-based OTP. Run the latest Prisma migration, then restart the server."
      : "We are updating the login system right now. Please try again in a moment.";
  }

  if (process.env.NODE_ENV === "development") {
    return rawMessage || "Failed to send OTP. Please try again later.";
  }
  return "Failed to send OTP. Please try again later.";
};

exports.userOTP = async (req, res) => {
  const normalizedPhone = normalizePhone(req.body?.phone);

  try {
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, isDeleted: false },
    });
    if (user) {
      return res.status(200).json({
        success: false,
        message: "User already exists please login",
      });
    }

    if (!SMS_OTP_ENABLED) {
      return res.status(200).json({
        success: true,
        message: "OTP is temporarily disabled. You can continue registration with your mobile number.",
      });
    }

    // Preserve the real OTP flow so it can be re-enabled later by setting ENABLE_SMS_OTP=true.
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await prisma.otp.create({
      data: { phone: normalizedPhone, otp },
    });

    await sendOtpSms(otp, normalizedPhone);

    res.status(200).json({
      success: true,
      message: "OTP sent to your mobile number",
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({
      success: false,
      message: buildOtpFailureMessage(error),
    });
  }
};

exports.sendOTPforgot = async (req, res) => {
  try {
    const normalizedPhone = normalizePhone(req.body?.phone);

    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, isDeleted: false },
    });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User does not exist. Please sign up.",
      });
    }

    if (!SMS_OTP_ENABLED) {
      return res.status(200).json({
        success: true,
        message: "OTP is temporarily disabled. You can update your password directly using your mobile number.",
      });
    }

    // Preserve the real OTP flow so it can be re-enabled later by setting ENABLE_SMS_OTP=true.
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await prisma.otp.create({
      data: { phone: normalizedPhone, otp },
    });

    await sendOtpSms(otp, normalizedPhone);
    res.status(200).json({
      success: true,
      message: "OTP sent to your mobile number",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: buildOtpFailureMessage(error),
    });
  }
};
