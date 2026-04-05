const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin } = require('../supabase');

/**
 * Middleware to verify JWT from the Authorization header.
 * Attaches req.user and req.profile to the request.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    if (profile.banned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware to require admin role.
 * Must be used after authenticate.
 */
function requireAdmin(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Optional auth - attaches user if token is present, continues regardless.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile && !profile.banned) {
        req.user = user;
        req.profile = profile;
      }
    }
  } catch (_) {}
  next();
}

module.exports = { authenticate, requireAdmin, optionalAuth };
