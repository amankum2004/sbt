require('module-alias/register')
const { config } = require('dotenv')
// config({ path: './.env' })
const express = require("express")
const app = express();
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require("cors")
const { createServer } = require("http");
const path = require('path')
const cookieParser = require('cookie-parser')
const https = createServer(app);
const cronRoutes = require("./utils/scheduler");
require('./utils/slot-creation');
// const { initializeSocket } = require('./utils/sockets');
// const Razorpay = require("razorpay")
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { bookAppointment } = require('../Server/controllers/appointment-controller')

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
config({ path: path.resolve(__dirname, envFile) });

const apiRoute = require('@/routes')

const PORT = process.env.PORT ?? 5000

mongoose
.connect(`${process.env.MongoDB}`)
.then(() => console.log(`Connected to MongoDB (${process.env.NODE_ENV})`))
.catch((error) => console.error('MongoDB connection error:', error));


const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173', 
      'https://salonbookingtime.vercel.app', 
      'https://www.salonhub.co.in'
    ];
    
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
  
  app.options('*', cors(corsOptions)); // Handle preflight requests
  
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  app.use((req, _, next) => {
    if (!req.url.match(/(assets|images|index\.html|.*\.(svg|png|jpg|jpeg))$/)) {
      console.log(`${req.method} ${req.url}`)
    }
    next()
  })
  
  app.use('/api', apiRoute);
  app.use('/api/cron', cronRoutes);

  // Static frontend AFTER API routes
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Serve sitemap.xml correctly
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, '../client/dist', 'sitemap.xml'));
  });

  // Serve robots.txt correctly (recommended)
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, '../client/dist', 'robots.txt'));
  });
  
  // React fallback LAST 
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
  })
  
https.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

