const Donation = require("../models/donation-model");

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Normalize field names for frontend compatibility.
    const normalizedDonations = donations.map((donation) => ({
      _id: donation._id,
      name: donation.donorName,
      email: donation.donorEmail,
      amount: donation.amount,
      message: donation.message,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      donatedAt: donation.donatedAt,
      status: donation.status,
      payment_id: donation.payment_id,
      order_id: donation.order_id,
    }));

    return res.status(200).json(normalizedDonations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

module.exports = { getAllDonations };
