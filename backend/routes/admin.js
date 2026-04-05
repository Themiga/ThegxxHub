const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats - dashboard stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [usersResult, postsResult, hubPostsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('source', 'ThegxxHub')
    ]);

    // Top posts by views
    const { data: topPosts } = await supabaseAdmin
      .from('posts')
      .select(`
        id, title, created_at,
        views(count),
        likes(count)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const topPostsMapped = (topPosts || []).map(p => ({
      ...p,
      views_count: p.views?.[0]?.count ?? 0,
      likes_count: p.likes?.length ?? 0
    })).sort((a, b) => b.views_count - a.views_count);

    res.json({
      total_users: usersResult.count ?? 0,
      total_posts: postsResult.count ?? 0,
      hub_posts: hubPostsResult.count ?? 0,
      top_posts: topPostsMapped
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - list all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) query = query.ilike('username', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role - change user role
router.patch('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' });
    }

    // Prevent removing own admin role
    if (id === req.profile.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/ban - ban or unban user
router.patch('/users/:id/ban', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    if (id === req.profile.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ banned: !!banned })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
