const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, formatProduct } = require('../db');
const { JWT_SECRET, verifyAdmin } = require('../middleware/auth');

// Public: Get Site Settings
router.get('/settings', async (req, res) => {
  try {
    const rows = await db('site_settings').select('setting_key', 'setting_value');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update Site Settings
router.post('/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const settingsObj = req.body || {};
    const keys = Object.keys(settingsObj);
    
    for (const key of keys) {
      const val = String(settingsObj[key]);
      const exists = await db('site_settings').where('setting_key', key).first();
      if (exists) {
        await db('site_settings').where('setting_key', key).update({ setting_value: val, updated_at: db.fn.now() });
      } else {
        await db('site_settings').insert({ setting_key: key, setting_value: val });
      }
    }

    const rows = await db('site_settings').select('setting_key', 'setting_value');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('Error updating site settings:', err);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await db('admin_users').where('username', username).first();
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: Number(admin.id), username: admin.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      admin: payload,
      user: payload
    });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Logout
router.post('/admin/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Check Session / Current Admin
router.get('/admin/me', verifyAdmin, (req, res) => {
  res.json({ admin: req.admin, user: req.admin });
});

// Admin Dashboard Stats
router.get('/admin/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalProductsRow = await db('products').count('id as count').first();
    const totalProducts = Number(totalProductsRow?.count || 0);

    const totalCategoriesRow = await db('categories').count('id as count').first();
    const totalCategories = Number(totalCategoriesRow?.count || 0);

    const totalReviewsRow = await db('reviews').count('id as count').first();
    const totalReviews = Number(totalReviewsRow?.count || 0);

    const activeOffersRow = await db('offers').where('is_active', true).orWhere('is_active', 1).count('id as count').first();
    const activeOffers = Number(activeOffersRow?.count || 0);

    const outOfStockRow = await db('products').where('is_out_of_stock', true).orWhere('is_out_of_stock', 1).count('id as count').first();
    const outOfStock = Number(outOfStockRow?.count || 0);

    const totalLikesRow = await db('products').sum('likes_count as total').first();
    const totalLikes = Number(totalLikesRow?.total || 0);

    const totalInventoryRow = await db('products').sum('stock as total').first();
    const totalInventory = Number(totalInventoryRow?.total || 0);

    const recentProductsRaw = await db('products')
      .select('id', 'name', 'price', 'stock', 'category', 'is_out_of_stock', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(5);

    const productIds = recentProductsRaw.map(p => p.id);
    let imageMap = {};
    if (productIds.length > 0) {
      const imgs = await db('product_images').whereIn('product_id', productIds);
      imgs.forEach(img => {
        if (!imageMap[img.product_id]) imageMap[img.product_id] = [];
        imageMap[img.product_id].push(img);
      });
    }

    const recentProducts = recentProductsRaw.map(p => ({
      ...p,
      id: Number(p.id),
      price: Number(p.price),
      stock: Number(p.stock || 0),
      is_out_of_stock: Boolean(p.is_out_of_stock),
      images: imageMap[p.id] || []
    }));

    const topProductsRaw = await db('products')
      .select('id', 'name', 'likes_count')
      .orderBy('likes_count', 'desc')
      .limit(5);

    const topProducts = topProductsRaw.map(p => ({
      ...p,
      id: Number(p.id),
      likes_count: Number(p.likes_count || 0)
    }));

    // Flat response matching DashboardStats type
    res.json({
      total_products: totalProducts,
      total_categories: totalCategories,
      total_reviews: totalReviews,
      active_offers: activeOffers,
      out_of_stock: outOfStock,
      total_likes: totalLikes,
      total_inventory: totalInventory,
      recent_products: recentProducts,
      top_liked: topProducts,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
