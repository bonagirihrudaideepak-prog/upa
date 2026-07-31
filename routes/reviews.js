const express = require('express');
const router = express.Router();
const { db } = require('../db');

function sanitizeHtml(str) {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Add a review
router.post('/reviews', async (req, res) => {
  try {
    const { product_id, user_name, rating, comment } = req.body || {};

    if (!product_id || !user_name || !rating) {
      return res.status(400).json({ error: 'product_id, user_name, and rating are required' });
    }

    // Input length limits + XSS sanitization
    const cleanName = sanitizeHtml(String(user_name).trim().substring(0, 100));
    const cleanComment = comment ? sanitizeHtml(String(comment).trim().substring(0, 2000)) : null;

    if (!cleanName) {
      return res.status(400).json({ error: 'user_name cannot be empty' });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const product = await db('products').where('id', parseInt(product_id)).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db('reviews').insert({
      product_id: parseInt(product_id),
      user_name: cleanName,
      rating: ratingNum,
      comment: cleanComment
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;
