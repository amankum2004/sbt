const express = require('express');
const otpController = require('../../controllers/user/otp-controller');
const router = express.Router();
const { otpRequestSchema } = require("../../validators/auth-validator");
const validate = require("../../middlewares/validate-middleware");

router.post('/user-otp', validate(otpRequestSchema), otpController.userOTP);
// router.post('/user-otp1',otpController.userOTP1);
// router.post('/send-otp', otpController.sendOTP);
router.post('/forgot', validate(otpRequestSchema), otpController.sendOTPforgot);

module.exports = router;
