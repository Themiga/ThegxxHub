const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { authenticate } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/sanitize');

// GET /api/profile/me - get current user profile
router.get('/me', authenticate, async (req, res) => {
  res.json(req.profile);
});

// PATCH /api/profile/me - update username/avatar
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};

    if (username) {
      const clean = sanitizeText(username).replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 30);
      if (clean.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
      updates.username = clean;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.profile.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Username already taken' });
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/:id - public profile
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, avatar_url, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
