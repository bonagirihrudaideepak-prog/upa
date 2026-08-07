const express = require('express');
const router = express.Router();
const { db, formatOffer, apiCache } = require('../db');
const { verifyAdmin } = require('../middleware/auth');

// Public: Get all active offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await db('offers')
      .where('is_active', true)
      .orWhere('is_active', 1)
      .orderBy('created_at', 'desc');
    const result = offers.map(formatOffer);
    res.json(result);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all offers
router.get('/admin/offers', verifyAdmin, async (req, res) => {
  try {
    const offers = await db('offers').orderBy('created_at', 'desc');
    res.json(offers.map(formatOffer));
  } catch (err) {
    console.error('Error fetching admin offers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create offer
router.post('/admin/offers', verifyAdmin, async (req, res) => {
  try {
    const { title, description, image_path, link, is_active, caption_left, caption_right } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newOffer = {
      title,
      description: description || null,
      image_path: image_path || null,
      link: link || null,
      caption_left: caption_left || null,
      caption_right: caption_right || null,
      is_active: is_active !== false && is_active !== 'false' && is_active !== 0
    };

    const inserted = await db('offers').insert(newOffer).returning('id');
    const id = typeof inserted[0] === 'object' ? inserted[0].id : (inserted[0] || inserted);

    if (apiCache) apiCache.invalidate('offers');

    res.status(201).json({ id, message: 'Offer created' });
  } catch (err) {
    console.error('Error creating offer:', err);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Helper for updating offer
async function updateOfferHandler(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid offer ID' });

    const existing = await db('offers').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Offer not found' });

    const { title, description, image_path, link, is_active, caption_left, caption_right } = req.body || {};
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (image_path !== undefined) updates.image_path = image_path;
    if (link !== undefined) updates.link = link;
    if (caption_left !== undefined) updates.caption_left = caption_left;
    if (caption_right !== undefined) updates.caption_right = caption_right;
    if (is_active !== undefined) {
      updates.is_active = is_active === true || is_active === 'true' || is_active === 1 || is_active === '1';
    }

    await db('offers').where('id', id).update(updates);
    if (apiCache) apiCache.invalidate('offers');
    res.json({ message: 'Offer updated' });
  } catch (err) {
    console.error('Error updating offer:', err);
    res.status(500).json({ error: 'Failed to update offer' });
  }
}

// Admin: Update offer (supports PUT and POST)
router.put('/admin/offers/:id', verifyAdmin, updateOfferHandler);
router.post('/admin/offers/:id', verifyAdmin, updateOfferHandler);

// Admin: Delete offer
router.delete('/admin/offers/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid offer ID' });

    const existing = await db('offers').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Offer not found' });

    await db('offers').where('id', id).del();
    if (apiCache) apiCache.invalidate('offers');
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

module.exports = router;
