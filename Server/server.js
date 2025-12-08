require('module-alias/register')
const { config } = require('dotenv')
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

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
config({ path: path.resolve(__dirname, envFile) });

const apiRoute = require('@/routes')

const PORT = process.env.PORT ?? 5000

console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

// MongoDB connection
mongoose.connect(`${process.env.MongoDB}`)
.then(() => console.log(`Connected to MongoDB (${process.env.NODE_ENV})`))
.catch((error) => console.error('MongoDB connection error:', error));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', 
      'https://salonbookingtime.vercel.app', 
      'https://www.salonhub.co.in',
      'https://salonhub.co.in',
      'https://api.salonhub.co.in',
      'http://65.1.28.220',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow all in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Apply middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SalonHub API Server',
    status: 'running',
    version: '1.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Main API routes
app.use('/api', apiRoute);
app.use('/api/cron', cronRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Handle non-API routes
app.use((req, res) => {
  if (req.url === '/') {
    res.json({
      message: 'SalonHub Backend API',
      documentation: 'Use /api for API endpoints',
      frontend: 'Hosted separately on Vercel'
    });
  } else {
    res.status(404).json({
      error: 'Not found',
      message: 'This is an API server. Please use /api endpoints.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
https.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Accessible at http://65.1.28.220:${PORT}/api`);
});













// require('module-alias/register')
// const { config } = require('dotenv')
// // config({ path: './.env' })
// const express = require("express")
// const app = express();
// const mongoose = require('mongoose')
// const bodyParser = require("body-parser")
// const cors = require("cors")
// const { createServer } = require("http");
// const path = require('path')
// const cookieParser = require('cookie-parser')
// const https = createServer(app);
// const cronRoutes = require("./utils/scheduler");
// require('./utils/slot-creation');
// // const { initializeSocket } = require('./utils/sockets');
// // const Razorpay = require("razorpay")
// // const crypto = require('crypto');
// // const nodemailer = require('nodemailer');
// // const { bookAppointment } = require('../Server/controllers/appointment-controller')

// // Load environment file based on NODE_ENV
// const envFile = process.env.NODE_ENV === 'production'
//   ? '.env.production'
//   : '.env.development';
// config({ path: path.resolve(__dirname, envFile) });

// const apiRoute = require('@/routes')

// const PORT = process.env.PORT ?? 5000

// mongoose
// .connect(`${process.env.MongoDB}`)
// .then(() => console.log(`Connected to MongoDB (${process.env.NODE_ENV})`))
// .catch((error) => console.error('MongoDB connection error:', error));


// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowedOrigins = [
//       'http://localhost:5173', 
//       'https://salonbookingtime.vercel.app', 
//       'https://www.salonhub.co.in',
//       'https://salonhub.co.in',
//       'https://api.salonhub.co.in'
//     ];
    
//     // Allow requests with no origin (e.g., mobile apps or same-origin requests)
//     if (!origin) {
//       return callback(null, true);
//     }
    
//     // Allow all origins in development
//     if (process.env.NODE_ENV === 'development') {
//       return callback(null, true);
//     }
    
//     // Check if the request origin is in the allowedOrigins list
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
  
//   app.options('*', cors(corsOptions)); // Handle preflight requests
  
//   app.use(cors(corsOptions));
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));
//   app.use(cookieParser());
  
//   app.use((req, _, next) => {
//     if (!req.url.match(/(assets|images|index\.html|.*\.(svg|png|jpg|jpeg))$/)) {
//       console.log(`${req.method} ${req.url}`)
//     }
//     next()
//   })

// // Add this test route
// // app.get('/api', (req, res) => {
// //   console.log('Direct API route hit!');
// //   res.json({ 
// //     message: 'API is working',
// //     timestamp: new Date().toISOString()
// //   });
// // });
  
//   app.use('/api', apiRoute);
//   app.use('/api/cron', cronRoutes);

//   // Debug middleware - add this
// app.use((req, res, next) => {
//   console.log(`Request URL: ${req.url}, API Route matched: ${req.url.startsWith('/api')}`);
//   next();
// });

//   // Static frontend AFTER API routes
//   app.use(express.static(path.join(__dirname, '../client/dist')));

//   // More debugging
// app.use((req, res, next) => {
//   console.log(`After static: ${req.url} - Not served by API`);
//   next();
// });

//   // Serve sitemap.xml correctly
//   app.get('/sitemap.xml', (req, res) => {
//     res.header('Content-Type', 'application/xml');
//     res.sendFile(path.join(__dirname, '../client/dist', 'sitemap.xml'));
//   });

//   // Serve robots.txt correctly (recommended)
//   app.get('/robots.txt', (req, res) => {
//     res.header('Content-Type', 'text/plain');
//     res.sendFile(path.join(__dirname, '../client/dist', 'robots.txt'));
//   });
  
//   // React fallback LAST 
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist', 'index.html'))
//   })
  
// https.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })

