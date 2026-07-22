import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { connectdb } from './config/mysql.js';
import { trackAPIStats } from './middleware/statsMiddleware.js';
import propertyrouter from './routes/ProductRouter.js';
import plotrouter from './routes/PlotRouter.js';
import carrouter from './routes/CarRouter.js';
import userrouter from './routes/UserRoute.js';
import formrouter from './routes/formrouter.js';
import newsrouter from './routes/newsRoute.js';
import appointmentRouter from './routes/appointmentRoute.js';
import adminRouter from './routes/adminRoute.js';
import propertyRoutes from './routes/propertyRoutes.js';
import notificationRouter from './routes/notificationRoute.js';
import settingsRouter from './routes/settingsRoute.js';
import serviceRouter from './routes/serviceRoute.js';
import blogRouter from './routes/blogRoute.js';
import teamRouter from './routes/teamRoute.js';
import testimonialRouter from './routes/testimonialRoute.js';
import getStatusPage from './serverweb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

const app = express();

// Configure trust proxy for different environments
if (process.env.NODE_ENV === 'production') {
  // Trust first proxy (Render, Heroku, Namecheap, etc.)
  app.set('trust proxy', 1);
} else {
  // In development, trust local proxies
  app.set('trust proxy', 'loopback');
}

// HTTPS redirect middleware for production
// Redirects HTTP to HTTPS when behind a proxy (Namecheap, etc.)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if request is secure (either direct HTTPS or through proxy)
    const isSecure = req.secure || 
                     req.headers['x-forwarded-proto'] === 'https' ||
                     req.headers['x-forwarded-ssl'] === 'on';
    
    // If not secure and not already redirecting, redirect to HTTPS
    if (!isSecure && req.headers.host) {
      const httpsUrl = `https://${req.headers.host}${req.originalUrl}`;
      return res.redirect(301, httpsUrl);
    }
    
    next();
  });
}

// Enhanced rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 1000, // More lenient in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  // Skip rate limiting for successful requests in development
  skip: (req, res) => {
    // Skip for health checks and in development for successful requests
    if (req.path === '/status' || req.path === '/') return true;
    return process.env.NODE_ENV === 'development' && res.statusCode < 400;
  },
  // Custom key generator to handle proxy scenarios
  keyGenerator: (req) => {
    // Use X-Forwarded-For in production, fallback to IP
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded && process.env.NODE_ENV === 'production') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip;
  }
});

// CORS Configuration - MUST BE BEFORE OTHER MIDDLEWARES
app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:5174',
    'http://localhost:5173',
    'https://buildestate.vercel.app',
    'https://real-estate-website-admin.onrender.com',
    'https://real-estate-website-backend-zfu7.onrender.com',
    // Namecheap domains
    'http://ngenziadmin.guzekustomz.com',
    'https://ngenziadmin.guzekustomz.com',
    'http://ngenzi.guzekustomz.com',
    'https://ngenzi.guzekustomz.com',
    'http://www.ngenziadmin.guzekustomz.com',
    'https://www.ngenziadmin.guzekustomz.com',
    'http://www.ngenzi.guzekustomz.com',
    'https://www.ngenzi.guzekustomz.com',
    // Production frontend domain
    'https://ngenzirealestate.rw',
    'http://ngenzirealestate.rw',
    'https://www.ngenzirealestate.rw',
    'http://www.ngenzirealestate.rw',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Plot-Youtube-Url',
    'X-Property-Youtube-Url',
    'X-Car-Youtube-Url',
    'X-Youtube-Url'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Security middlewares
app.use(limiter);
app.use(helmet({
  // Configure helmet for proxy environments
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:4000", "http://localhost:5173", "http://localhost:5174", "http://ngenzi.guzekustomz.com", "https://ngenzi.guzekustomz.com", "http://ngenziadmin.guzekustomz.com", "https://ngenziadmin.guzekustomz.com", "https://ngenzirealestate.rw", "https://www.ngenzirealestate.rw", "https://myambi.wildjourneysrwanda.com"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(trackAPIStats);

// Ensure uploads, logo, plots, properties, and services directories exist
const uploadsDir = join(__dirname, 'uploads');
const logoDir = join(__dirname, 'uploads', 'logo');
const plotsDir = join(__dirname, 'uploads', 'plots');
const carsDir = join(__dirname, 'uploads', 'cars');
const propertiesDir = join(__dirname, 'uploads', 'properties');
const servicesDir = join(__dirname, 'uploads', 'services');
const blogsDir = join(__dirname, 'uploads', 'blogs');
const teamsDir = join(__dirname, 'uploads', 'teams');
const testimonialsDir = join(__dirname, 'uploads', 'testimonials');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
  console.log('📁 Created logo directory:', logoDir);
}

if (!fs.existsSync(plotsDir)) {
  fs.mkdirSync(plotsDir, { recursive: true });
  console.log('📁 Created plots directory:', plotsDir);
}

if (!fs.existsSync(carsDir)) {
  fs.mkdirSync(carsDir, { recursive: true });
  console.log('📁 Created cars directory:', carsDir);
}

if (!fs.existsSync(propertiesDir)) {
  fs.mkdirSync(propertiesDir, { recursive: true });
  console.log('📁 Created properties directory:', propertiesDir);
}

if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
  console.log('📁 Created services directory:', servicesDir);
}

if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
  console.log('📁 Created blogs directory:', blogsDir);
}
if (!fs.existsSync(teamsDir)) {
  fs.mkdirSync(teamsDir, { recursive: true });
  console.log('📁 Created teams directory:', teamsDir);
}
if (!fs.existsSync(testimonialsDir)) {
  fs.mkdirSync(testimonialsDir, { recursive: true });
  console.log('📁 Created testimonials directory:', testimonialsDir);
}

// CORS middleware for static files - must be before static file serving
// This handles CORS for static file requests
const staticCorsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:4000',
    'http://localhost:5174',
    'http://localhost:5173',
    'https://buildestate.vercel.app',
    'https://real-estate-website-admin.onrender.com',
    'http://ngenziadmin.guzekustomz.com',
    'https://ngenziadmin.guzekustomz.com',
    'http://ngenzi.guzekustomz.com',
    'https://ngenzi.guzekustomz.com',
    'http://www.ngenziadmin.guzekustomz.com',
    'https://www.ngenziadmin.guzekustomz.com',
    'http://www.ngenzi.guzekustomz.com',
    'https://www.ngenzi.guzekustomz.com',
    // Production frontend domain
    'https://ngenzirealestate.rw',
    'http://ngenzirealestate.rw',
    'https://www.ngenzirealestate.rw',
    'http://www.ngenzirealestate.rw',
  ];

  const origin = req.headers.origin;
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Plot-Youtube-Url, X-Property-Youtube-Url, X-Car-Youtube-Url, X-Youtube-Url');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.sendStatus(200);
  }
  
  // Set CORS headers for all requests
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Plot-Youtube-Url, X-Property-Youtube-Url, X-Car-Youtube-Url, X-Youtube-Url');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Last-Modified');
  next();
};

// Serve static files from uploads directory (for local image storage)
app.use('/uploads', staticCorsMiddleware, express.static(join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    // Ensure CORS headers are set for all static file responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Last-Modified');
    // Set cache control for images
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
  }
}));
console.log('📁 Serving static files from:', join(__dirname, 'uploads'));
console.log('📁 Logo directory available at:', logoDir);


// Additional CORS handler for all routes (backup)
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:4000',
    'http://localhost:5174',
    'http://localhost:5173',
    'https://buildestate.vercel.app',
    'https://real-estate-website-admin.onrender.com',
    'https://real-estate-website-backend-zfu7.onrender.com',
    'http://ngenziadmin.guzekustomz.com',
    'https://ngenziadmin.guzekustomz.com',
    'http://ngenzi.guzekustomz.com',
    'https://ngenzi.guzekustomz.com',
    'http://www.ngenziadmin.guzekustomz.com',
    'https://www.ngenziadmin.guzekustomz.com',
    'http://www.ngenzi.guzekustomz.com',
    'https://www.ngenzi.guzekustomz.com',
    // Production frontend domain
    'https://ngenzirealestate.rw',
    'http://ngenzirealestate.rw',
    'https://www.ngenzirealestate.rw',
    'http://www.ngenzirealestate.rw',
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Plot-Youtube-Url, X-Property-Youtube-Url, X-Car-Youtube-Url, X-Youtube-Url');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.sendStatus(200);
  }
  
  next();
});

// Database connection - non-blocking
// Server will start even if DB connection fails initially
let dbConnected = false;
connectdb()
  .then((db) => {
    if (db) {
      dbConnected = true;
      console.log('✅ Database connected successfully');
    }
  })
  .catch(err => {
    console.error('⚠️ Database connection error:', err.message);
    console.error('Server will continue running. Database will retry connection...');
    // Don't exit - allow server to start and retry DB connection
  });


// API Routes
app.use('/api/products', propertyrouter);
console.log('✅ Product routes registered: /api/products');
app.use('/api/plots', plotrouter);
app.use('/api/cars', carrouter);
app.use('/api/users', userrouter);
app.use('/api/forms', formrouter);
app.use('/api/news', newsrouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/services', serviceRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/teams', teamRouter);
app.use('/api/testimonials', testimonialRouter);
app.use('/api', propertyRoutes);


app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});


// Handle unhandled rejections - log but don't crash in production
process.on('unhandledRejection', (err, promise) => {
  console.error('⚠️ UNHANDLED REJECTION at:', promise);
  console.error('Error:', err);
  // In production, log but don't exit to prevent 503 errors
  if (process.env.NODE_ENV === 'production') {
    console.error('Server continuing despite unhandled rejection...');
  } else {
    console.log('Shutting down in development mode...');
    process.exit(1);
  }
});

// Handle uncaught exceptions - log but try to recover in production
process.on('uncaughtException', (err) => {
  console.error('⚠️ UNCAUGHT EXCEPTION!');
  console.error('Error:', err);
  // In production, log but don't exit immediately to prevent 503 errors
  if (process.env.NODE_ENV === 'production') {
    console.error('Attempting to continue...');
    // Give time for error logging before potential exit
    setTimeout(() => {
      console.error('Exiting after uncaught exception...');
      process.exit(1);
    }, 5000);
  } else {
    console.log('Shutting down in development mode...');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Status check endpoint - critical for health checks
app.get('/status', (req, res) => {
  const isSecure = req.secure || 
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.headers['x-forwarded-ssl'] === 'on';
  
  res.status(200).json({ 
    status: 'OK', 
    time: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    protocol: isSecure ? 'https' : 'http',
    forwardedProto: req.headers['x-forwarded-proto'] || 'not-set',
    clientIP: req.ip,
    forwardedFor: req.headers['x-forwarded-for'] || 'not-set',
    userAgent: req.headers['user-agent'] || 'not-set',
    database: dbConnected ? 'connected' : 'disconnected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Root endpoint - health check HTML
app.get('/', (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(getStatusPage());
  } catch (error) {
    console.error('Error serving home page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler - must be after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 4000;

// Start server with better error handling
if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Server URL: http://0.0.0.0:${port}`);
      console.log(`📊 Health check: http://0.0.0.0:${port}/status`);
    });

    // Handle server errors gracefully
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('Please use a different port or stop the other process');
      } else {
        console.error('❌ Server error:', err);
      }
      // Don't exit immediately - give time to log
      setTimeout(() => process.exit(1), 1000);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

export default app;