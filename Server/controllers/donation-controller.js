const Donation = require("../models/donation-model");

const createDonation = async (req, res) => {
  try {
    const { name, email, amount, message } = req.body;

    const donation = new Donation({ name, email, amount, message });
    await donation.save();

    res.status(201).json({ success: true, message: "Donation received!" });
  } catch (error) {
    console.error("Donation error:", error);
    res.status(500).json({ success: false, message: "Failed to process donation" });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch donations" });
  }
};

module.exports = { createDonation, getAllDonations };
