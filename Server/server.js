require('module-alias/register')
const {config} = require('dotenv')
config({path: './.env'})
const express = require("express")
const Razorpay = require("razorpay")
const app = express();
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require("cors")
const { createServer }= require( "http");
const path = require('path')
const cookieParser = require('cookie-parser')
const https = createServer(app);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const TimeSlot = require('../Server/models/timeSlot-model')
const {bookAppointment} = require('../Server/controllers/appointment-controller')

const apiRoute = require('@/routes')

// const PORT = import.meta.env.VITE_LOCAL_PORT;
const PORT = process.env.PORT ?? 8000

mongoose
.connect(`${process.env.MongoDB}`)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error))


// const corsOptions = {
  //   origin: (origin, callback) => {
    //     if (!origin) {
      //       return callback(null, true);
      //     }
      //     if (process.env.NODE_ENV === 'development') {
        //       return callback(null, true);
        //     }
        //     const allowedOrigins = ['https://salonbookingtime.vercel.app'];
        //     if (allowedOrigins.includes(origin)) {
          //       callback(null, true);
          //     } else {
            //       callback(new Error('Not allowed by CORS'));
            //     }
            //   },
            //   credentials: true,
            //   methods: ["GET,POST,PUT,DELETE,PATCH,HEAD"],
            //   allowedHeaders: 'Content-Type, Authorization',
            // };
            
            const corsOptions = {
              origin: (origin, callback) => {
                const allowedOrigins = ['http://localhost:5173', 'https://salonbookingtime.vercel.app'];
                
                // Allow requests with no origin (e.g., mobile apps or same-origin requests)
                if (!origin) {
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if the request origin is in the allowedOrigins list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
        app.use(cors(corsOptions));
        app.use('/api', apiRoute)
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(cookieParser())
        app.use(express.static(path.join(__dirname, '../frontend/dist')))
        
    // Function to send email
    async function sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlot) {
      let transporter = nodemailer.createTransport({
        service: 'gmail', // Use any other service if needed
        auth: {
          user: 'sbthelp123@gmail.com',
          pass: 'cwpf ywjb qdrp dexv',
        },
      });
      const selectedTimeSlotHTML = selectedTimeSlot && selectedTimeSlot.length > 0
        ? selectedTimeSlot.map(slot => `
            Date: ${new Date(slot.showtimeDate).toLocaleDateString()}, 
            Time: ${new Date(slot.showtimeDate).toLocaleTimeString()}
        `).join('')  // `.join('')` to combine all slots into a single string
        : "No time slot selected";

      const mailOptions = {
        from: '"Salon Booking Time" sbthelp123@gmail.com', // Sender address
        to: customerEmail, // Recipient's email
        subject: 'Appointment Booking Confirmation',
        // text: `Your appointment at ${shopDetails.shopName}, ${shopDetails.location} is confirmed for the following time slot: ${selectedTimeSlot.showtimeDate}.`, // Plain text body
        text: `Dear ${customerName},
        Your payment for booking at ${shopName}, located at ${location}, has been successfully received.
        You have booked the following time slot:
        ${selectedTimeSlotHTML}
        
        Thank you for choosing us!
  
        Best regards,
        Salon Booking Team`,
      };

      return transporter.sendMail(mailOptions);
    }

    app.post("/order", async (req, res) => {
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
    
    app.post('/order/validate', async (req, res) => {
      const { payment_id, order_id, signature, customerEmail,customerName, shopDetails, selectedTimeSlot } = req.body;
      console.log("Request Body: ", req.body);
      console.log("Received Razorpay Signature: ", signature); 
      // Validate the payment using Razorpay API (this step depends on your Razorpay validation logic)
      const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
      //order_id + "|" + razorpay_payment_id
      sha.update(`${order_id}|${payment_id}`);
      const digest = sha.digest("hex");
      // console.log("Calculated Digest: ", digest);
      // console.log("Received Razorpay Signature: ", signature);
      if (!signature) {
        return res.status(400).json({ msg: "Signature is missing!" });
      }
      if (digest !== signature) {
        return res.status(400).json({ msg: "Transaction is not legit!" });
      }
      const paymentValid = true; // Assuming the payment is successfully validated
      
      if (paymentValid) {
        const { shopName, location } = shopDetails;
        // const { timeSlotId, showtimeId, showtimeDate } = selectedTimeSlot;
        const { selectedTimeSlot } = req.body; // Assuming this comes from the request body
        try {
            // Iterate over each selected time slot
            for (const slot of selectedTimeSlot) {
                const { timeSlotId, showtimeId } = slot;

                // Find the TimeSlot by ID
                const timeSlot = await TimeSlot.findById(new mongoose.Types.ObjectId(timeSlotId));
                if (!timeSlot) {
                    throw new Error(`Invalid TimeSlot ID: ${timeSlotId}`);
                }

                // Find the specific showtime by showtimeId
                const showtime = timeSlot.showtimes.find(s => s._id.equals(new mongoose.Types.ObjectId(showtimeId)));
                if (!showtime || showtime.is_booked) {
                    throw new Error(`Showtime is either booked or invalid for ID: ${showtimeId}`);
                }

                // Mark the showtime as booked
                showtime.is_booked = true;
                await timeSlot.save();

                const shopOwnerId = timeSlot.shop_owner_id;
                console.log("Shop Owner ID:", shopOwnerId);
                const appointment = await bookAppointment(shopOwnerId, timeSlotId, showtimeId, timeSlotId.date);
              }
            console.log("Showtimes slot updated successfully");
        } catch (error) {
            console.error(error);
        }
        await sendConfirmationEmail(customerEmail, customerName, shopName, location, selectedTimeSlot);
        return res.status(200).json({ message: 'Payment successful and email sent!' })
      } else {
        res.status(400).json({ error: 'Payment validation failed' });
      }
    });
    

app.use((req, _, next) => {
  if (!req.url.match(/(assets|images|index\.html|.*\.(svg|png|jpg|jpeg))$/)) {
    console.log(`${req.method} ${req.url}`)
  }
  next()
})


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'))
}) 
    https.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
    
    