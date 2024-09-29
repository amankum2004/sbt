const express = require('express');
const { bookAppointment } = require('@/controllers/appointment-controller');
const router = express.Router();


router.route('/appointment').post(bookAppointment)

module.exports = router;
