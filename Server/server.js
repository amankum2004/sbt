require('module-alias/register')
const { config } = require('dotenv')
config({ path: './.env' })
const express = require("express")
const Razorpay = require("razorpay")
const app = express();
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require("cors")
const { createServer } = require("http");
const path = require('path')
const cookieParser = require('cookie-parser')
const https = createServer(app);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const TimeSlot = require('../Server/models/timeSlot-model')
// const cron = require('node-cron')
const { bookAppointment } = require('../Server/controllers/appointment-controller')
require('./utils/scheduler')  // for deleting expired timeslots and appointments

const apiRoute = require('@/routes')

// const PORT = import.meta.env.VITE_LOCAL_PORT;
const PORT = process.env.PORT ?? 8000

mongoose
  .connect(`${process.env.MongoDB}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error))


  // Every Hour: 0 * * * *
  // Every 30 Minutes: */30 * * * *
  // Every 15 Minutes: */15 * * * *
  // Every Minute: * * * * *
// cron.schedule('0 0 * * *', async () => {
//   try {
//     const now = new Date();
//     const result = await TimeSlot.deleteMany({ date: { $lt: now } });

//     if (result.deletedCount > 0) {
//       console.log(`${result.deletedCount} expired time slot(s) deleted.`);
//     } else {
//       console.log('No expired time slots found to delete.');
//     }
//   } catch (error) {
//     console.error('Error deleting expired time slots:', error);
//   }
// });


const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'https://salonbookingtime.vercel.app', 'https://sbt-amankum2004s-projects.vercel.app', 'https://sbt-git-main-amankum2004s-projects.vercel.app'];

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

//   const corsOptions={
//     origin:"https://salonbookingtime.vercel.app",
//     methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
//     credentials:true
// }

app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../frontend/dist')))

app.use((req, _, next) => {
  if (!req.url.match(/(assets|images|index\.html|.*\.(svg|png|jpg|jpeg))$/)) {
    console.log(`${req.method} ${req.url}`)
  }
  next()
})

app.use('/api', apiRoute)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'))
})

https.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

