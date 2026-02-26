const { config } = require('dotenv')
const express = require("express")
const app = express();
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require("cors")
const { Server: SocketIOServer } = require("socket.io");
const { createServer } = require("http");
const path = require('path')
const cookieParser = require('cookie-parser')
const https = createServer(app);
const cronRoutes = require("./utils/scheduler");
const { setSocketIO, getShopRoom } = require("./utils/socket");
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

// MongoDB connection with retry and enhanced logging
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Wait up to 5s for server selection before timing out (shorter for faster feedback)
  serverSelectionTimeoutMS: 5000,
  // Keep sockets open a bit longer
  socketTimeoutMS: 45000,
  // Prefer IPv4 to avoid IPv6 resolution issues in some environments
  family: 4,
};

let connectAttempts = 0;
const MAX_CONNECT_RETRIES = 6;
const RETRY_DELAY_MS = 5000;

function connectWithRetry() {
  connectAttempts += 1;
  console.log(`🔌 Attempting MongoDB connection (attempt ${connectAttempts})...`);

  mongoose.connect(String(process.env.MONGO_DB || ''), mongooseOptions)
    .then(() => {
      console.log(`✅ Connected to MongoDB (${process.env.NODE_ENV})`);
    })
    .catch((error) => {
      console.error(`❌ MongoDB connection error (attempt ${connectAttempts}):`, error && error.message ? error.message : error);
      if (connectAttempts < MAX_CONNECT_RETRIES) {
        console.log(`↻ Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
        setTimeout(connectWithRetry, RETRY_DELAY_MS);
      } else {
        console.error('⛔ Exceeded maximum MongoDB connection attempts.');
        // Keep process alive but log: in production you might want to exit or alert
      }
    });
}

connectWithRetry();

mongoose.connection.on('connected', () => console.log('📗 Mongoose connected.'));
mongoose.connection.on('reconnected', () => console.log('📘 Mongoose reconnected.'));
mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongoose disconnected.'));
mongoose.connection.on('error', (err) => console.error('❌ Mongoose connection error:', err && err.message ? err.message : err));

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

const socketCorsOptions =
  process.env.NODE_ENV === 'production'
    ? {
        origin: [
          'https://salonbookingtime.vercel.app',
          'https://www.salonhub.co.in',
          'https://salonhub.co.in',
          'https://api.salonhub.co.in',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      }
    : {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
      };

const io = new SocketIOServer(https, { cors: socketCorsOptions });
setSocketIO(io);
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_shop_room', (shopIdOrPayload) => {
    const shopId =
      typeof shopIdOrPayload === 'string'
        ? shopIdOrPayload
        : shopIdOrPayload?.shopId;

    if (!shopId) return;
    const roomName = getShopRoom(String(shopId));
    socket.join(roomName);
    console.log(`🔔 Socket ${socket.id} joined ${roomName}`);
  });

  socket.on('leave_shop_room', (shopIdOrPayload) => {
    const shopId =
      typeof shopIdOrPayload === 'string'
        ? shopIdOrPayload
        : shopIdOrPayload?.shopId;

    if (!shopId) return;
    const roomName = getShopRoom(String(shopId));
    socket.leave(roomName);
    console.log(`🔕 Socket ${socket.id} left ${roomName}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Option 1: Allow all origins (temporarily for debugging)
// app.use(cors({
//   origin: '*', // Allow ALL origins
//   credentials: false,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS','HEAD'],
// }));

// // IMPORTANT: Handle preflight requests
// app.options('*', (req, res) => {
//   console.log('Preflight request for:', req.headers.origin);
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
//   res.sendStatus(200);
// });

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



