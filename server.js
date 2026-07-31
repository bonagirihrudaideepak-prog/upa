require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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

// Serve Static Frontend Assets (Production Build)
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
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
