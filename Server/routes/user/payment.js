const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../../models/donation-model');
const TimeSlot = require('../../models/timeSlot-model');
const { bookAppointment } = require('../../controllers/appointment-controller');
const {
  sendConfirmationEmail,
  sendDonationConfirmationEmail,
  sendAdminDonationNotification,
} = require('../../utils/mail');

const router = express.Router();

// payment routes 
router.post("/order", async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        // Validate environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
            console.error('Razorpay credentials not configured');
            return res.status(500).json({ 
                error: "Payment gateway configuration error",
                details: "Missing Razorpay credentials"
            });
        }

        const { amount, currency, receipt } = req.body;

        if (!amount || !currency || !receipt) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const options = { 
            amount: Math.round(amount), // Ensure integer
            currency, 
            receipt,
            payment_capture: 1 // Auto capture payment
        };
        console.log('Creating order with options:', options);

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ error: "Order creation failed" });
        }
        console.log('Order created:', order.id);

        res.status(200).json(order);
    } catch (err) {
        console.error("Error in /pay/order:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// for the donation validation after payment
// for sending email after payment success
router.post('/donation/validate', async (req, res) => {
    const { 
        payment_id, 
        order_id, 
        signature, 
        donationDetails 
    } = req.body;
    
    console.log('=== DONATION VALIDATION ===');
    console.log('Payment ID:', payment_id);
    console.log('Order ID:', order_id);
    console.log('Donation Details:', donationDetails);

    // Validate required fields
    if (!payment_id || !order_id || !signature) {
        return res.status(400).json({ 
            success: false,
            error: "Missing payment information" 
        });
    }

    if (!donationDetails) {
        return res.status(400).json({ 
            success: false,
            error: "Missing donation details" 
        });
    }

    // ✅ FIX: Extract donation details properly
    const { name, email, amount, message } = donationDetails;
    console.log('Extracted details:', { name, email, amount, message });

    if (!name || !email || !amount) {
        return res.status(400).json({ 
            success: false,
            error: "Missing required donation fields: name, email, and amount are required" 
        });
    }

    // Validate payment signature
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${order_id}|${payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== signature) {
        console.error('Invalid signature:', { provided: signature, calculated: digest });
        return res.status(400).json({ 
            success: false,
            error: "Transaction verification failed" 
        });
    }

    try {
        console.log('Payment signature validated successfully');

        // ✅ FIX: Ensure proper field mapping for Donation model
        const donation = new Donation({
            donorName: name ? name.trim() : '',
            donorEmail: email ? email.toLowerCase().trim() : '',
            amount: parseFloat(amount) || 0,
            message: message ? message.trim() : '',
            payment_id,
            order_id,
            status: 'completed',
            donatedAt: new Date()
        });

        console.log('Donation object to save:', donation);

        // ✅ FIX: Save with validation and catch Mongoose validation errors
        const savedDonation = await donation.save();
        console.log('Donation saved to database:', savedDonation._id);
        
        // Send donation confirmation email
        sendDonationConfirmationEmail(name, email, amount, message)
            .then(() => {
                console.log('Donation confirmation email sent');
            })
            .catch((emailError) => {
                console.warn('Email sending failed:', emailError.message);
            });

        sendAdminDonationNotification(savedDonation.toObject())
            .then(() => {
                console.log('Admin donation alert email sent');
            })
            .catch((adminEmailError) => {
                console.warn('Admin donation alert failed:', adminEmailError.message);
            });
        
        res.status(200).json({ 
            success: true,
            message: 'Donation successful! Thank you for your contribution to the environment.',
            donationId: savedDonation._id,
            amount: amount,
            type: 'donation'
        });

    } catch (error) {
        console.error("Donation processing error:", error);
        
        // ✅ FIX: Provide more detailed error response
        let errorMessage = "Error processing donation";
        
        if (error.name === 'ValidationError') {
            // Handle Mongoose validation errors
            const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
            console.error('Validation errors:', validationErrors);
        } else {
            errorMessage = error.message || "Error processing donation";
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage,
            type: 'processing_error'
        });
    }
});

// for the appointment booking validation after payment -> Not using this route now
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

// NEW ROUTE: Direct booking without payment
router.post('/book-direct', async (req, res) => {
  try {
    console.log('Received booking request body:', req.body);
    
    const { 
      customerEmail, 
      customerName, 
      customerPhone, 
      userId, 
      shopDetails, 
      selectedTimeSlots, 
      totalAmount,
      showtimeServices // Add this parameter
    } = req.body;

    // Validate required fields
    if (!shopDetails || !shopDetails.shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      return res.status(400).json({ error: 'No time slots selected' });
    }

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    if (!showtimeServices) {
      return res.status(400).json({ error: 'Service information is required' });
    }

    // Extract data from the nested structure
    const shopId = shopDetails.shopId;
    const shopName = shopDetails.shopName; // Extract shopName
    const location = shopDetails.location; // Extract location
    
    // Since selectedTimeSlots is an array, handle multiple bookings or take the first one
    const firstTimeSlot = selectedTimeSlots[0];
    const timeSlotId = firstTimeSlot.timeSlotId;
    const showtimeId = firstTimeSlot.showtimeId;
    const date = firstTimeSlot.showtimeDate;

    // Get service information for this showtime
    const serviceInfo = showtimeServices[showtimeId];
    if (!serviceInfo) {
      return res.status(400).json({ error: 'Service information not found for selected time slot' });
    }

    console.log('Extracted parameters:', {
      shopId,
      timeSlotId,
      showtimeId,
      date,
      customerEmail,
      userId,
      serviceInfo,
      totalAmount,
      shopName,
      location
    });

    // Validate extracted parameters
    if (!shopId || !timeSlotId || !showtimeId || !date) {
      return res.status(400).json({ 
        error: 'Missing required booking parameters',
        details: { shopId, timeSlotId, showtimeId, date }
      });
    }

    const userEmail = customerEmail;
    const user_Id = userId;

    const appointment = await bookAppointment(
      shopId,
      timeSlotId,
      showtimeId,
      date,
      userEmail,
      user_Id,
      serviceInfo,
      totalAmount
    );

    // Now all variables are defined for the email function
    await sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlots);

    console.log('Appointment created successfully:', appointment);
    
    res.json({ 
      success: true, 
      appointment,
      message: 'Appointment booked successfully' 
    });
    
  } catch (error) {
    console.error('Direct booking error:', error);
    res.status(400).json({ error: error.message });
  }
});


// router.post('/book-direct', async (req, res) => {
//   try {
//     console.log('Received booking request body:', req.body);
    
//     const { 
//       customerEmail, 
//       customerName, 
//       customerPhone, 
//       userId, 
//       shopDetails, 
//       selectedTimeSlots, 
//       totalAmount 
//     } = req.body;

//     // Validate required fields
//     if (!shopDetails || !shopDetails.shopId) {
//       return res.status(400).json({ error: 'Shop ID is required' });
//     }

//     if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
//       return res.status(400).json({ error: 'No time slots selected' });
//     }

//     if (!customerEmail) {
//       return res.status(400).json({ error: 'Customer email is required' });
//     }

//     // Extract data from the nested structure
//     const shopId = shopDetails.shopId;
    
//     // Since selectedTimeSlots is an array, handle multiple bookings or take the first one
//     const firstTimeSlot = selectedTimeSlots[0];
//     const timeSlotId = firstTimeSlot.timeSlotId;
//     const showtimeId = firstTimeSlot.showtimeId;
//     const date = firstTimeSlot.showtimeDate;

//     console.log('Extracted parameters:', {
//       shopId,
//       timeSlotId,
//       showtimeId,
//       date,
//       customerEmail,
//       userId
//     });

//     // Validate extracted parameters
//     if (!shopId || !timeSlotId || !showtimeId || !date) {
//       return res.status(400).json({ 
//         error: 'Missing required booking parameters',
//         details: { shopId, timeSlotId, showtimeId, date }
//       });
//     }

//     // If you need user authentication, check if you have the user data
//     // Since req.user is undefined, you might be using a different auth method
//     // For now, use the data from the request body
//     const userEmail = customerEmail;
//     const user_Id = userId;

//     const appointment = await bookAppointment(
//       shopId,
//       timeSlotId,
//       showtimeId,
//       date,
//       userEmail,
//       user_Id
//     );

//     // Here you would typically process payment with totalAmount
//     console.log('Payment amount:', totalAmount);
    
//     // After successful booking, you might want to create a payment record
//     // const payment = await processPayment(totalAmount, appointment._id);

//     res.json({ 
//       success: true, 
//       appointment,
//       message: 'Appointment booked successfully' 
//     });
    
//   } catch (error) {
//     console.error('Direct booking error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });


module.exports = router;
