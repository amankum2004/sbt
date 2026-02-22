const express = require("express");
const router = express.Router();
const { getAllDonations } = require("../controllers/donation-controller");

// Admin-facing endpoint: returns donations sorted by most recent first.
router.get("/received-donations", getAllDonations);

module.exports = router;
