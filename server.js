require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db');

const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const offersRouter = require('./routes/offers');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS restricted to explicit allowed origins (never reflect arbitrary origins).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://upanishadmobiles.com,http://localhost:5173,http://localhost:10000')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  },
  credentials: false,
}));

// Gzip compression — 70-80% bandwidth savings
app.use(compression());

// Security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self'; connect-src 'self'");
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Enable ETag for conditional responses (304 Not Modified)
app.set('etag', 'strong');

// Disable browser caching for dynamic API responses (ensures updates like deleted banners reflect immediately across devices)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve Uploads Directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  immutable: true,
  etag: true
}));

// API Routes
app.use('/api', productsRouter);
app.use('/api', categoriesRouter);
app.use('/api', offersRouter);
app.use('/api', reviewsRouter);
app.use('/api', adminRouter);
app.use('/api', uploadRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Favicon Endpoint
app.get('/favicon.ico', (req, res) => {
  const icoPath = path.join(__dirname, 'frontend', 'dist', 'favicon.ico');
  if (fs.existsSync(icoPath)) {
    res.sendFile(icoPath);
  } else {
    res.status(204).end();
  }
});

// Serve Static Frontend Assets (Production Build)
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, {
    maxAge: '30d',
    immutable: true,
    etag: true
  }));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Initialize Database BEFORE starting server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`==========================================`);
      console.log(`🚀 Upanishad Store Node Backend Running!`);
      console.log(`📡 Listening on Port: ${PORT}`);
      console.log(`==========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
