const express = require('express');
const router = express.Router();
const { db, formatProduct, attachImagesAndVariants } = require('../db');
const { verifyAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple in-memory rate limiter for likes (per IP + product)
const likeRateMap = new Map();
const LIKE_COOLDOWN_MS = 5000; // 5 seconds per product per IP

function sanitizeHtml(str) {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prod_' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

function parseVariants(input) {
  if (!input) return [];
  if (typeof input === 'string') {
    try { return JSON.parse(input); } catch (e) { return []; }
  }
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'object') {
    const keys = Object.keys(input);
    // If keys are numbers or numeric strings (e.g. '0', '1')
    return keys.map(k => input[k]).filter(Boolean);
  }
  return [];
}

// ===== PUBLIC ROUTES =====

// 1. Featured Products
router.get('/products/featured', async (req, res) => {
  try {
    const products = await db('products')
      .where('is_featured', true)
      .orWhere('is_featured', 1)
      .orderBy('created_at', 'desc');
    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. New Arrivals (auto-rotating: always the most recently added products, capped at 12).
//    No manual flag needed — the newest uploaded products show here and older ones
//    naturally fade out as newer items are added.
router.get('/products/new-arrivals', async (req, res) => {
  try {
    const products = await db('products')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(12);
    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error fetching new arrivals:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Search Products (Ultra-fast case-insensitive search with limit for 200,000+ scale)
router.get('/products/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const clientType = db.client.config.client;
    let productsQuery = db('products');

    if (clientType === 'pg') {
      productsQuery = productsQuery
        .where('name', 'ILIKE', `%${query}%`)
        .orWhere('description', 'ILIKE', `%${query}%`)
        .orWhere('sku', 'ILIKE', `%${query}%`)
        .orWhere('category', 'ILIKE', `%${query}%`);
    } else {
      productsQuery = productsQuery
        .where('name', 'like', `%${query}%`)
        .orWhere('description', 'like', `%${query}%`)
        .orWhere('sku', 'like', `%${query}%`)
        .orWhere('category', 'like', `%${query}%`);
    }

    const products = await productsQuery
      .orderBy('created_at', 'desc')
      .limit(30);

    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Products by Category
router.get('/products/category/:category', async (req, res) => {
  try {
    const categoryParam = req.params.category;
    if (!categoryParam) {
      return res.status(400).json({ error: 'Category is required' });
    }
    // Match either category name or category slug
    const catObj = await db('categories').where('slug', categoryParam).orWhere('name', categoryParam).first();
    const categoryName = catObj ? catObj.name : categoryParam;

    const products = await db('products')
      .where('category', categoryName)
      .orWhere('category', categoryParam)
      .orderBy('created_at', 'desc');
    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Get All Products
router.get('/products', async (req, res) => {
  try {
    const category = req.query.category;
    let query = db('products').orderBy('created_at', 'desc');
    if (category) {
      const catObj = await db('categories').where('slug', category).orWhere('name', category).first();
      const categoryName = catObj ? catObj.name : category;
      query = query.where('category', categoryName).orWhere('category', category);
    }
    const products = await query;
    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error fetching all products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Get Product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await db('products').where('id', id).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const formatted = formatProduct(product);

    const images = await db('product_images')
      .where('product_id', id)
      .orderBy('display_order', 'asc');

    const variants = await db('product_variants')
      .where('product_id', id);

    const recent_reviews = await db('reviews')
      .where('product_id', id)
      .orderBy('created_at', 'desc')
      .limit(5);

    formatted.images = images.map(img => ({
      ...img,
      id: Number(img.id),
      product_id: Number(img.product_id),
      is_original_1_1: Boolean(img.is_original_1_1),
      is_original_3_4: Boolean(img.is_original_3_4),
      display_order: Number(img.display_order || 0)
    }));

    formatted.variants = variants.map(v => ({
      ...v,
      id: Number(v.id),
      product_id: Number(v.product_id),
      stock: Number(v.stock || 0)
    }));

    formatted.recent_reviews = recent_reviews.map(r => ({
      ...r,
      id: Number(r.id),
      product_id: Number(r.product_id),
      rating: Number(r.rating)
    }));

    formatted.main_image = images.find(img => img.image_type === 'main')?.image_path || (images[0] ? images[0].image_path : null);

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. Like Product (rate-limited)
router.post('/products/:id/like', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Rate limit: 1 like per 5 seconds per IP per product
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const rateKey = `${ip}:${id}`;
    const lastLike = likeRateMap.get(rateKey);
    if (lastLike && Date.now() - lastLike < LIKE_COOLDOWN_MS) {
      return res.status(429).json({ error: 'Too many requests. Please wait a few seconds.' });
    }
    likeRateMap.set(rateKey, Date.now());

    // Periodic cleanup of rate limiter (prevent memory leak)
    if (likeRateMap.size > 10000) {
      const now = Date.now();
      for (const [key, ts] of likeRateMap) {
        if (now - ts > 60000) likeRateMap.delete(key);
      }
    }

    await db('products').where('id', id).increment('likes_count', 1);
    const updated = await db('products').where('id', id).select('likes_count').first();
    const count = updated ? Number(updated.likes_count) : 0;

    res.json({ message: 'Product liked successfully', likes_count: count });
  } catch (err) {
    console.error('Error liking product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. Get Product Reviews
router.get('/products/:id/reviews', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const reviews = await db('reviews')
      .where('product_id', id)
      .orderBy('created_at', 'desc');

    res.json(reviews.map(r => ({
      ...r,
      id: Number(r.id),
      product_id: Number(r.product_id),
      rating: Number(r.rating)
    })));
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ===== ADMIN PROTECTED ROUTES =====

// 9. Admin Get All Products
router.get('/admin/products', verifyAdmin, async (req, res) => {
  try {
    const products = await db('products').orderBy('created_at', 'desc');
    const result = await attachImagesAndVariants(products);
    res.json(result);
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 10. Admin Get Product By ID
router.get('/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await db('products').where('id', id).first();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const formatted = formatProduct(product);
    const images = await db('product_images').where('product_id', id).orderBy('display_order', 'asc');
    const variants = await db('product_variants').where('product_id', id);

    formatted.images = images.map(img => ({
      ...img,
      id: Number(img.id),
      product_id: Number(img.product_id),
      is_original_1_1: Boolean(img.is_original_1_1),
      is_original_3_4: Boolean(img.is_original_3_4),
      display_order: Number(img.display_order || 0)
    }));
    formatted.variants = variants.map(v => ({
      ...v,
      id: Number(v.id),
      product_id: Number(v.product_id),
      stock: Number(v.stock || 0)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching admin product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 11. Admin Create Product
router.post('/admin/products', verifyAdmin, upload.array('images[]'), async (req, res) => {
  try {
    const body = req.body || {};
    const { name, price, category, description, sku, stock, is_featured, is_new_arrival, is_offer, is_out_of_stock } = body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'name, price, and category are required' });
    }

    const initialLikes = body.likes_count !== undefined ? parseInt(body.likes_count || '0') : 0;
    const newProduct = {
      name,
      description: description || null,
      sku: sku || null,
      price: parseFloat(price),
      category,
      stock: parseInt(stock || '0'),
      models: body.models || null,
      is_featured: is_featured === 'true' || is_featured === true || is_featured === '1' || is_featured === 1,
      is_new_arrival: is_new_arrival === 'true' || is_new_arrival === true || is_new_arrival === '1' || is_new_arrival === 1,
      is_offer: is_offer === 'true' || is_offer === true || is_offer === '1' || is_offer === 1,
      is_out_of_stock: is_out_of_stock === 'true' || is_out_of_stock === true || is_out_of_stock === '1' || is_out_of_stock === 1,
      likes_count: isNaN(initialLikes) ? 0 : initialLikes
    };

    const inserted = await db('products').insert(newProduct).returning('id');
    const productId = typeof inserted[0] === 'object' ? inserted[0].id : (inserted[0] || inserted);

    // Handle Variants
    const variants = parseVariants(body.variants);
    if (variants.length > 0) {
      const variantInserts = variants.map(v => ({
        product_id: productId,
        color: v.color || '',
        color_code: v.color_code || '#000000',
        model: v.model || null,
        stock: parseInt(v.stock || '0')
      }));
      await db('product_variants').insert(variantInserts);
    }

    // Handle Uploaded Files or Image URLs
    const imageInserts = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        imageInserts.push({
          product_id: productId,
          image_path: 'uploads/' + file.filename,
          image_type: imageInserts.length === 0 ? 'main' : 'alt',
          is_original_1_1: false,
          is_original_3_4: false,
          display_order: imageInserts.length
        });
      });
    }

    let urlInputs = body.image_urls || body.images || body.image_url;
    if (urlInputs) {
      if (typeof urlInputs === 'string') {
        try { urlInputs = JSON.parse(urlInputs); } catch (e) { urlInputs = [urlInputs]; }
      }
      if (!Array.isArray(urlInputs)) urlInputs = [urlInputs];

      urlInputs.forEach((img, i) => {
        const pathStr = typeof img === 'string' ? img : (img.image_path || img.existing || img.url || '');
        if (pathStr) {
          imageInserts.push({
            product_id: productId,
            image_path: pathStr,
            image_type: imageInserts.length === 0 ? 'main' : 'alt',
            is_original_1_1: false,
            is_original_3_4: false,
            display_order: imageInserts.length
          });
        }
      });
    }

    if (imageInserts.length > 0) {
      await db('product_images').insert(imageInserts);
    }

    const created = await db('products').where('id', productId).first();
    const formatted = formatProduct(created);
    res.status(201).json(formatted);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Helper function for updating product
async function updateProductHandler(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const existing = await db('products').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const body = req.body || {};
    const updates = {};

    const allowed = ['name', 'description', 'sku', 'price', 'category', 'stock', 'models', 'is_featured', 'is_new_arrival', 'is_offer', 'is_out_of_stock', 'likes_count'];
    allowed.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'price') updates.price = parseFloat(body.price);
        else if (field === 'stock') updates.stock = parseInt(body.stock || '0');
        else if (field === 'likes_count') updates.likes_count = parseInt(body.likes_count || '0');
        else if (['is_featured', 'is_new_arrival', 'is_offer', 'is_out_of_stock'].includes(field)) {
          updates[field] = body[field] === 'true' || body[field] === true || body[field] === '1' || body[field] === 1;
        } else {
          updates[field] = body[field];
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      await db('products').where('id', id).update(updates);
    }

    // Update variants if passed
    if (body.variants !== undefined) {
      const variants = parseVariants(body.variants);
      await db('product_variants').where('product_id', id).del();
      if (variants.length > 0) {
        const variantInserts = variants.map(v => ({
          product_id: id,
          color: v.color || '',
          color_code: v.color_code || '#000000',
          model: v.model || null,
          stock: parseInt(v.stock || '0')
        }));
        await db('product_variants').insert(variantInserts);
      }
    }

    // Update images if files uploaded or passed
    const imageInserts = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        imageInserts.push({
          product_id: id,
          image_path: 'uploads/' + file.filename,
          image_type: imageInserts.length === 0 ? 'main' : 'alt',
          is_original_1_1: false,
          is_original_3_4: false,
          display_order: imageInserts.length
        });
      });
    }

    let urlInputs = body.image_urls || body.images || body.image_url;
    if (urlInputs) {
      if (typeof urlInputs === 'string') {
        try { urlInputs = JSON.parse(urlInputs); } catch (e) { urlInputs = [urlInputs]; }
      }
      if (!Array.isArray(urlInputs)) urlInputs = [urlInputs];

      urlInputs.forEach((img, i) => {
        const pathStr = typeof img === 'string' ? img : (img.image_path || img.existing || img.url || '');
        if (pathStr) {
          imageInserts.push({
            product_id: id,
            image_path: pathStr,
            image_type: imageInserts.length === 0 ? 'main' : 'alt',
            is_original_1_1: false,
            is_original_3_4: false,
            display_order: imageInserts.length
          });
        }
      });
    }

    if (imageInserts.length > 0) {
      await db('product_images').where('product_id', id).del();
      await db('product_images').insert(imageInserts);
    }

    const updated = await db('products').where('id', id).first();
    const formatted = formatProduct(updated);
    res.json(formatted);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

// 12. Admin Update Product (PUT and POST supported for HTML Form compatibility)
router.put('/admin/products/:id', verifyAdmin, upload.array('images[]'), updateProductHandler);
router.post('/admin/products/:id', verifyAdmin, upload.array('images[]'), updateProductHandler);

// 13. Admin Delete Product
router.delete('/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db('products').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await db('product_images').where('product_id', id).del();
    await db('product_variants').where('product_id', id).del();
    await db('reviews').where('product_id', id).del();
    await db('products').where('id', id).del();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// 14. Admin Toggle Featured
router.post('/admin/products/:id/toggle-featured', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await db('products').where('id', id).first();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newStatus = !product.is_featured;
    await db('products').where('id', id).update({ is_featured: newStatus });

    res.json({ message: 'Featured status toggled', is_featured: newStatus });
  } catch (err) {
    console.error('Error toggling featured status:', err);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

module.exports = router;
