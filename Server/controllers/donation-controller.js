const prisma = require("../utils/prisma");

const getAllDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
    });

    const normalizedDonations = donations.map((donation) => ({
      _id: donation.id,
      name: donation.donorName,
      phone: donation.donorPhone,
      email: donation.donorEmail,
      amount: donation.amount,
      message: donation.message,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      donatedAt: donation.donatedAt,
      status: donation.status,
      payment_id: donation.paymentId,
      order_id: donation.orderId,
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
