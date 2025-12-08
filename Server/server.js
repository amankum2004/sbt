// # Backup current server.js
// cp server.js server.js.backup2

// Create a clean server.js without module-alias
// cat > server.js << 'EOF'
const { config } = require('dotenv')
const express = require("express")
const app = express();
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require("cors")
const { createServer } = require("http");
const path = require('path')
const cookieParser = require('cookie-parser')

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';
config({ path: path.resolve(__dirname, envFile) });

const PORT = process.env.PORT || 5000;

console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

// MongoDB connection
mongoose.connect(process.env.MongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(`✅ Connected to MongoDB (${process.env.NODE_ENV})`))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// CORS configuration - Allow all origins for now (we'll restrict later)
app.use(cors({
  origin: '*', // Allow all for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SalonHub Backend API',
    version: '1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      api: '/api',
      health: '/api/health',
      docs: 'Coming soon'
    }
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'SalonHub API Server',
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    server_time: new Date().toISOString(),
    memory_usage: process.memoryUsage()
  });
});

// Try to load routes with relative paths
try {
  console.log('Attempting to load routes...');
  
  // Try different path variations
  let apiRoute;
  try {
    apiRoute = require('./routes');
    console.log('✅ Routes loaded from ./routes');
  } catch (err1) {
    try {
      apiRoute = require('./routes/index');
      console.log('✅ Routes loaded from ./routes/index');
    } catch (err2) {
      console.log('⚠️ Could not load routes:', err1.message);
      console.log('Creating basic routes...');
      
      // Create basic router
      const { Router } = require('express');
      apiRoute = Router();
      
      // Add some test routes
      apiRoute.get('/test', (req, res) => {
        res.json({ message: 'Test route working!', timestamp: new Date().toISOString() });
      });
      
      apiRoute.get('/auth/check', (req, res) => {
        res.json({ 
          authenticated: false, 
          message: 'Authentication endpoint',
          timestamp: new Date().toISOString()
        });
      });
      
      apiRoute.post('/auth/login', (req, res) => {
        res.json({ 
          message: 'Login endpoint - POST data received',
          body: req.body,
          timestamp: new Date().toISOString()
        });
      });
    }
  }
  
  // Use the routes
  app.use('/api', apiRoute);
  
} catch (error) {
  console.error('❌ Failed to setup routes:', error.message);
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    available_endpoints: ['/api', '/api/health', '/api/test', '/api/auth/check']
  });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'This is an API server. Please use valid endpoints.',
    try_these: ['/', '/api', '/api/health']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Create server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Public: http://65.1.28.220:${PORT}`);
  console.log(`🔗 API: http://65.1.28.220:${PORT}/api`);
  console.log(`🏥 Health: http://65.1.28.220:${PORT}/api/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
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

