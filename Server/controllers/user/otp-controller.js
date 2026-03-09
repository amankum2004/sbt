const otpGenerator = require("otp-generator");
const prisma = require("../../utils/prisma");
const { mailOtp } = require("../../utils/mail");

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

exports.userOTP = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);

  try {
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
    if (user) {
      return res.status(200).json({
        success: false,
        message: "User already exists please login",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await prisma.otp.create({
      data: { email: normalizedEmail, otp },
    });

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
    });

    mailOtp(otp, normalizedEmail)
      .then(() => console.log("OTP email sent:", normalizedEmail))
      .catch((err) => console.error("Failed to send OTP email:", err));
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP. Please try again later.",
    });
  }
};

exports.sendOTPforgot = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User does not exist. Please sign up.",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await prisma.otp.create({
      data: { email: normalizedEmail, otp },
    });

    await mailOtp(otp, normalizedEmail);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};
