const prisma = require("../utils/prisma");
const { mapContact } = require("../utils/legacy-mappers");
const { sendAdminContactNotification } = require("../utils/mail");
const { normalizePhone } = require("../utils/phone");

const normalizeEmail = (value) => {
  const trimmedValue = (value || "").trim().toLowerCase();
  return trimmedValue || null;
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const contactForm = async (req, res) => {
  try {
    const payload = {
      name: (req.body?.name || "").trim(),
      phone: normalizePhone(req.body?.phone),
      email: normalizeEmail(req.body?.email),
      message: (req.body?.message || "").trim(),
    };

    if (!payload.name || !payload.phone || !payload.message) {
      return res.status(400).json({
        success: false,
        message: "Name, phone number, and message are required",
      });
    }

    if (payload.email && !isValidEmail(payload.email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const createdContact = await prisma.contact.create({
      data: payload,
    });

    const mappedContact = mapContact(createdContact);

    sendAdminContactNotification(mappedContact)
      .then(() => {
        console.log(`✅ Admin notified for new contact: ${mappedContact?._id}`);
      })
      .catch((emailError) => {
        console.warn(
          "⚠️ Failed to send admin contact notification:",
          emailError?.message || emailError
        );
      });

    return res.status(200).json({ success: true, message: "message sent successfully" });
  } catch (error) {
    console.error("Contact form submission failed:", error);
    return res.status(500).json({ success: false, message: "message not sent" });
  }
};

module.exports = contactForm;
