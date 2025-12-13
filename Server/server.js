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

// Load routes using relative path instead of module alias
const apiRoute = require('./routes')

const PORT = process.env.PORT ?? 5000

console.log(`🚀 Starting SalonHub Backend in ${process.env.NODE_ENV || 'development'} mode`);

// MongoDB connection
mongoose
.connect(`${process.env.MongoDB}`)
.then(() => console.log(`✅ Connected to MongoDB (${process.env.NODE_ENV})`))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// Security: Block common attack patterns
app.use((req, res, next) => {
  const url = req.url.toLowerCase();
  
  // Block PHP exploit attempts
  if (url.includes('php') || 
      url.includes('eval-stdin') || 
      url.includes('auto_prepend_file') ||
      url.includes('thinkphp') ||
      url.includes('pearcmd')) {
    console.log(`🚫 Blocked attack attempt: ${req.method} ${req.url} from ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173', 
      'https://salonbookingtime.vercel.app', 
      'https://www.salonhub.co.in',
      'https://salonhub.co.in',
      'https://api.salonhub.co.in',
      'http://65.1.28.220',  // Your EC2 IP
      'http://localhost:3000', // For testing
      'http://localhost:3000',      // React dev server
      'http://localhost:5000',      // Other dev ports
      'http://localhost:8080',      // Flutter web dev server
      'http://localhost:54321',     // Flutter web alternative
      'https://localhost:3000',     // HTTPS localhost
      'https://localhost:5000',
      'https://localhost:8080',
      'https://salonhub.co.in',     // Your production domain
      'https://www.salonhub.co.in', // WWW subdomain
      'https://api.salonhub.co.in',  // API subdomain
      'http://localhost', // Add this
      'https://localhost', // Add this
      // Add pattern for Flutter web dynamic ports
      /^http:\/\/localhost:\d+$/, // All localhost ports
      /^https:\/\/localhost:\d+$/, // All HTTPS localhost ports
      /^http:\/\/127\.0\.0\.1:\d+$/, // All 127.0.0.1 ports
      /^http:\/\/\[::1\]:\d+$/, // IPv6 localhost

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
      console.log(`❌ CORS blocked: ${origin} from ${req.ip || 'unknown'}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','x-user', 'X-Requested-With'],
};

app.options('*', cors(corsOptions)); // Handle preflight requests
  
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
  
// Request logging (filter out attack attempts)
app.use((req, _, next) => {
  const url = req.url.toLowerCase();
  if (!url.includes('php') && !url.includes('eval') && !url.includes('thinkphp')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// ================= API ROUTES =================
// Root endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'SalonHub API',
    version: '1.0',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      documentation: 'API documentation coming soon'
    }
  });
});

// API test endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SalonHub API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    server_time: new Date().toISOString(),
    memory_usage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  });
});

// Main API routes
try {
  console.log('Loading API routes...');
  app.use('/api', apiRoute);
  console.log('✅ API routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load API routes:', error.message);
  
  // Create fallback routes
  const router = express.Router();
  router.get('/test', (req, res) => {
    res.json({ message: 'API test endpoint', timestamp: new Date().toISOString() });
  });
  app.use('/api', router);
}

// Cron routes
try {
  app.use('/api/cron', cronRoutes);
  console.log('✅ Cron routes loaded');
} catch (error) {
  console.log('⚠️ Cron routes not available:', error.message);
}

// ================= ERROR HANDLING =================
// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Handle non-API routes (since frontend is on Vercel)
app.use('*', (req, res) => {
  if (req.url === '/robots.txt') {
    res.type('text/plain').send('User-agent: *\nAllow: /api\nDisallow: /');
  } else if (req.url === '/sitemap.xml') {
    res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  } else {
    res.status(404).json({
      error: 'Not found',
      message: 'This is a backend API server. Frontend is hosted separately on Vercel.',
      api_endpoints: {
        root: '/',
        api: '/api',
        health: '/api/health'
      },
      frontend: 'https://salonbookingtime.vercel.app'
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// ================= START SERVER =================
https.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║            🚀 SALONHUB BACKEND API               ║
╠══════════════════════════════════════════════════╣
║ Port:        ${PORT}                                
║ Local:       http://localhost:${PORT}               
║ Public:      http://65.1.28.220:${PORT}             
║ API Base:    http://65.1.28.220:${PORT}/api        
║ Environment: ${process.env.NODE_ENV || 'development'}
║ Time:        ${new Date().toLocaleString()}        
╚══════════════════════════════════════════════════╝
  `);
  
  console.log(`✅ Server started successfully!`);
  console.log(`📡 Available endpoints:`);
  console.log(`   • Root:        http://localhost:${PORT}/`);
  console.log(`   • API:         http://localhost:${PORT}/api`);
  console.log(`   • Health:      http://localhost:${PORT}/api/health`);
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

