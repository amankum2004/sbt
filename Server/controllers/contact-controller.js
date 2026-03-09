const prisma = require("../utils/prisma");
const { mapContact } = require("../utils/legacy-mappers");
const { sendAdminContactNotification } = require("../utils/mail");

const contactForm = async (req, res) => {
  try {
    const payload = {
      name: (req.body?.name || "").trim(),
      email: (req.body?.email || "").trim().toLowerCase(),
      message: (req.body?.message || "").trim(),
    };

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
