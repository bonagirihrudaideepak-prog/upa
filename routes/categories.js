const express = require('express');
const router = express.Router();
const { db, formatCategory } = require('../db');
const { verifyAdmin } = require('../middleware/auth');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Public: Get all active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db('categories')
      .where('is_active', true)
      .orWhere('is_active', 1)
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc');
    res.json(categories.map(formatCategory));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all categories (active & inactive)
router.get('/admin/categories', verifyAdmin, async (req, res) => {
  try {
    const categories = await db('categories')
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc');
    res.json(categories.map(formatCategory));
  } catch (err) {
    console.error('Error fetching admin categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create category
router.post('/admin/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, display_order, is_active, image_path } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const categorySlug = slug || slugify(name);
    const newCategory = {
      name,
      slug: categorySlug,
      description: description || null,
      image_path: image_path || null,
      display_order: parseInt(display_order || '0'),
      is_active: is_active !== false && is_active !== 'false' && is_active !== 0
    };

    const inserted = await db('categories').insert(newCategory);
    const id = Array.isArray(inserted) ? inserted[0] : inserted;
    const created = await db('categories').where('id', id).first();

    res.status(201).json(formatCategory(created));
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: Update category
router.put('/admin/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db('categories').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const { name, slug, description, display_order, is_active, image_path } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (image_path !== undefined) updates.image_path = image_path;
    if (display_order !== undefined) updates.display_order = parseInt(display_order || '0');
    if (is_active !== undefined) {
      updates.is_active = is_active === true || is_active === 'true' || is_active === 1 || is_active === '1';
    }

    await db('categories').where('id', id).update(updates);
    const updated = await db('categories').where('id', id).first();
    res.json(formatCategory(updated));
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: Delete category
router.delete('/admin/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db('categories').where('id', id).first();
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    await db('categories').where('id', id).del();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
