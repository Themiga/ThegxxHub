const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sanitizeText, sanitizeTags, validateColor } = require('../middleware/sanitize');

const ALLOWED_LEVELS = ['Iniciante', 'Intermediario', 'Avancado'];

function validateLevel(value) {
  return ALLOWED_LEVELS.includes(value) ? value : 'Iniciante';
}

// GET /api/executors - list all executors (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('executors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ executors: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/executors - create executor (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, platform, price, description, level, level_color, tags, display_order } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const parsedTags = (() => {
      try { return sanitizeTags(typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : [])); }
      catch { return []; }
    })();

    const { data, error } = await supabaseAdmin
      .from('executors')
      .insert({
        name: sanitizeText(name).slice(0, 100),
        platform: sanitizeText(platform || '').slice(0, 200),
        price: sanitizeText(price || 'Gratuito').slice(0, 100),
        description: sanitizeText(description || '').slice(0, 1000),
        level: validateLevel(level),
        level_color: validateColor(level_color),
        tags: parsedTags,
        display_order: parseInt(display_order) || 0
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/executors/:id - update executor (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, platform, price, description, level, level_color, tags, display_order } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = sanitizeText(name).slice(0, 100);
    if (platform !== undefined) updates.platform = sanitizeText(platform).slice(0, 200);
    if (price !== undefined) updates.price = sanitizeText(price).slice(0, 100);
    if (description !== undefined) updates.description = sanitizeText(description).slice(0, 1000);
    if (level !== undefined) updates.level = validateLevel(level);
    if (level_color !== undefined) updates.level_color = validateColor(level_color);
    if (display_order !== undefined) updates.display_order = parseInt(display_order) || 0;
    if (tags !== undefined) {
      try { updates.tags = sanitizeTags(typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : [])); }
      catch { updates.tags = []; }
    }

    const { data, error } = await supabaseAdmin
      .from('executors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/executors/:id - delete executor (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('executors').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
