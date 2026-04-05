const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  sanitizeText, sanitizeScript, sanitizeTags, validateColor,
  validateSource, validateStatus, validateGameLink, sanitizeSearch, sanitizeVersion
} = require('../middleware/sanitize');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/posts - list all posts with stats
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 12, source, has_key, is_paid } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.profile?.role === 'admin';

    let query = supabaseAdmin
      .from('posts')
      .select(`
        id, title, description, tags, thumbnail_url, created_at, highlight_color,
        game_name, game_link, source, has_key, is_paid, status, script_version,
        author:profiles!author_id(id, username, avatar_url),
        views(count),
        likes(count),
        ratings(rating)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Non-admins only see active posts
    if (!isAdmin) query = query.eq('status', 'ativo');

    if (tag) query = query.contains('tags', [sanitizeText(tag).slice(0, 50)]);
    if (source && ['ThegxxHub', 'Terceiros'].includes(source)) query = query.eq('source', source);
    if (has_key === 'true') query = query.eq('has_key', true);
    if (has_key === 'false') query = query.eq('has_key', false);
    if (is_paid === 'true') query = query.eq('is_paid', true);
    if (is_paid === 'false') query = query.eq('is_paid', false);

    if (search) {
      const safe = sanitizeSearch(search);
      if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const posts = data.map(post => ({
      ...post,
      views_count: post.views?.[0]?.count ?? 0,
      likes_count: post.likes?.length ?? 0,
      avg_rating: post.ratings?.length
        ? (post.ratings.reduce((s, r) => s + r.rating, 0) / post.ratings.length).toFixed(1)
        : null,
      ratings_count: post.ratings?.length ?? 0
    }));

    res.json({ posts, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id - single post detail
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.profile?.role === 'admin';

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, username, avatar_url),
        views(count),
        likes(type, user_id),
        ratings(rating, user_id)
      `)
      .eq('id', id)
      .single();

    if (error || !post) return res.status(404).json({ error: 'Post not found' });

    // Non-admins cannot view non-active posts
    if (!isAdmin && post.status !== 'ativo') {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await supabaseAdmin
      .from('views')
      .update({ count: (post.views?.[0]?.count ?? 0) + 1 })
      .eq('post_id', id);

    const likes = post.likes || [];
    const ratings = post.ratings || [];

    const response = {
      ...post,
      views_count: (post.views?.[0]?.count ?? 0) + 1,
      likes_count: likes.filter(l => l.type === 'like').length,
      dislikes_count: likes.filter(l => l.type === 'dislike').length,
      avg_rating: ratings.length
        ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
        : null,
      ratings_count: ratings.length,
      user_like: req.user ? likes.find(l => l.user_id === req.user.id)?.type ?? null : null,
      user_rating: req.user ? ratings.find(r => r.user_id === req.user.id)?.rating ?? null : null
    };

    delete response.likes;
    delete response.ratings;
    delete response.views;

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - create post (admin only)
router.post('/', authenticate, requireAdmin, upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      title, description, script_content, tags, highlight_color,
      game_name, game_link, source, has_key, is_paid, status, script_version
    } = req.body;

    if (!title || !description || !script_content) {
      return res.status(400).json({ error: 'Title, description and script_content are required' });
    }

    let thumbnail_url = null;

    if (req.file) {
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!allowed.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Thumbnail must be PNG, JPEG, WEBP or GIF' });
      }
      const ext = req.file.mimetype.split('/')[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('thumbnails')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage.from('thumbnails').getPublicUrl(fileName);
        thumbnail_url = publicUrl;
      }
    }

    const parsedTags = (() => {
      try { return sanitizeTags(typeof tags === 'string' ? JSON.parse(tags) : tags); }
      catch { return sanitizeTags(typeof tags === 'string' ? tags.split(',') : []); }
    })();

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title: sanitizeText(title).slice(0, 200),
        description: sanitizeText(description).slice(0, 2000),
        script_content: sanitizeScript(script_content),
        tags: parsedTags,
        highlight_color: validateColor(highlight_color),
        thumbnail_url,
        game_name: game_name ? sanitizeText(game_name).slice(0, 200) : null,
        game_link: validateGameLink(game_link),
        source: validateSource(source),
        has_key: has_key === 'true' || has_key === true,
        is_paid: is_paid === 'true' || is_paid === true,
        status: validateStatus(status),
        script_version: sanitizeVersion(script_version),
        author_id: req.profile.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id - update post (admin only)
router.put('/:id', authenticate, requireAdmin, upload.single('thumbnail'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, script_content, tags, highlight_color,
      game_name, game_link, source, has_key, is_paid, status, script_version
    } = req.body;

    const updates = {};
    if (title) updates.title = sanitizeText(title).slice(0, 200);
    if (description) updates.description = sanitizeText(description).slice(0, 2000);
    if (script_content) updates.script_content = sanitizeScript(script_content);
    if (highlight_color) updates.highlight_color = validateColor(highlight_color);
    if (tags !== undefined) {
      try { updates.tags = sanitizeTags(typeof tags === 'string' ? JSON.parse(tags) : tags); }
      catch { updates.tags = sanitizeTags(typeof tags === 'string' ? tags.split(',') : []); }
    }
    if (game_name !== undefined) updates.game_name = game_name ? sanitizeText(game_name).slice(0, 200) : null;
    if (game_link !== undefined) updates.game_link = validateGameLink(game_link);
    if (source !== undefined) updates.source = validateSource(source);
    if (has_key !== undefined) updates.has_key = has_key === 'true' || has_key === true;
    if (is_paid !== undefined) updates.is_paid = is_paid === 'true' || is_paid === true;
    if (status !== undefined) updates.status = validateStatus(status);
    if (script_version !== undefined) updates.script_version = sanitizeVersion(script_version);

    if (req.file) {
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!allowed.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Thumbnail must be PNG, JPEG, WEBP or GIF' });
      }
      const ext = req.file.mimetype.split('/')[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('thumbnails')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage.from('thumbnails').getPublicUrl(fileName);
        updates.thumbnail_url = publicUrl;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
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

// DELETE /api/posts/:id - delete post (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/like - like or dislike (authenticated users)
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ error: 'Type must be like or dislike' });
    }

    // Check if post exists
    const { data: post } = await supabaseAdmin.from('posts').select('id').eq('id', id).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Check existing like
    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('*')
      .eq('user_id', req.profile.id)
      .eq('post_id', id)
      .single();

    if (existing) {
      if (existing.type === type) {
        // Remove like/dislike if same type
        await supabaseAdmin.from('likes').delete().eq('id', existing.id);
        return res.json({ action: 'removed', type });
      } else {
        // Update to new type
        const { data } = await supabaseAdmin
          .from('likes')
          .update({ type })
          .eq('id', existing.id)
          .select()
          .single();
        return res.json({ action: 'updated', data });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('likes')
      .insert({ user_id: req.profile.id, post_id: id, type })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ action: 'added', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/rating - rate post (authenticated users, once per post)
router.post('/:id/rating', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const rating = parseInt(req.body.rating);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data: post } = await supabaseAdmin.from('posts').select('id').eq('id', id).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { data: existing } = await supabaseAdmin
      .from('ratings')
      .select('*')
      .eq('user_id', req.profile.id)
      .eq('post_id', id)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('ratings')
        .update({ rating })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ action: 'updated', data });
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .insert({ user_id: req.profile.id, post_id: id, rating })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ action: 'added', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
