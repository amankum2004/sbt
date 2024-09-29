const express = require('express');
const otpController = require('@/controllers/user/otp-controller');
const router = express.Router();

router.post('/user-otp',otpController.userOTP);
// router.post('/user-otp1',otpController.userOTP1);
// router.post('/send-otp', otpController.sendOTP);
router.post('/forgot', otpController.sendOTPforgot);

module.exports = router;
