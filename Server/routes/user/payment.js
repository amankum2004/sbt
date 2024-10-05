const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const TimeSlot = require('../../models/timeSlot-model'); // Adjust path accordingly
const { bookAppointment } = require('../../controllers/appointment-controller'); // Adjust path accordingly
const { sendConfirmationEmail } = require('../../utils/mail'); // Import the email utility function

const router = express.Router();

router.post("/order", async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = req.body;
        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send("Error");
        }

        res.json(order);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error");
    }
});

router.post('/order/validate', async (req, res) => {
    const { payment_id, order_id, signature, customerEmail, customerName, shopDetails, selectedTimeSlot } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${order_id}|${payment_id}`);
    const digest = sha.digest("hex");

    if (!signature || digest !== signature) {
        return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    const paymentValid = true;

    if (paymentValid) {
        const { shopName, location } = shopDetails;

        try {
            for (const slot of selectedTimeSlot) {
                const { timeSlotId, showtimeId } = slot;
                const timeSlot = await TimeSlot.findById(timeSlotId);

                if (!timeSlot) {
                    throw new Error(`Invalid TimeSlot ID: ${timeSlotId}`);
                }

                const showtime = timeSlot.showtimes.find(s => s._id.equals(showtimeId));
                if (!showtime || showtime.is_booked) {
                    throw new Error(`Showtime is either booked or invalid for ID: ${showtimeId}`);
                }

                const shopOwnerId = timeSlot.shop_owner_id;
                await bookAppointment(shopOwnerId, timeSlotId, showtimeId, timeSlot.date);
                await sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlot);
                // showtime.is_booked = true;
                // await timeSlot.save();
            }
            return res.status(200).json({ message: 'Payment successful and email sent!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error booking appointment" });
        }
    } else {
        res.status(400).json({ error: 'Payment validation failed' });
    }
});

module.exports = router;
