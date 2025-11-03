const express = require("express");
const router = express.Router();
const {
  createDonation,
  getAllDonations
} = require("../controllers/donation-controller");

router.post("/donate", createDonation);
router.get("/received-donations", getAllDonations); 

module.exports = router;
