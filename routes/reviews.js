const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Add a review
router.post('/reviews', async (req, res) => {
  try {
    const { product_id, user_name, rating, comment } = req.body || {};

    if (!product_id || !user_name || !rating) {
      return res.status(400).json({ error: 'product_id, user_name, and rating are required' });
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
      user_name,
      rating: ratingNum,
      comment: comment || null
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;
