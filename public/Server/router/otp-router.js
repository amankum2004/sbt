const express = require('express');
const otpController = require('../controllers/otp-controller');
const router = express.Router();

router.post('/user-otp',otpController.userOTP);
router.post('/user-otp1',otpController.userOTP1);
router.post('/send-otp', otpController.sendOTP);
router.post('/send-otp-forgot', otpController.sendOTPforgot);

module.exports = router;
