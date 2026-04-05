require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const postsRouter = require('./routes/posts');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');
const executorsRouter = require('./routes/executors');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "*.supabase.co", "*.supabase.in"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ""],
    }
  }
}));

// CORS - restrict in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
    : true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' }
});

app.use('/api/', apiLimiter);
app.use('/api/posts/:id/like', authLimiter);
app.use('/api/posts/:id/rating', authLimiter);

// API routes
app.use('/api/posts', postsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/profile', profileRouter);
app.use('/api/executors', executorsRouter);

// Public stats endpoint (no auth required)
app.get('/api/stats', async (req, res) => {
  try {
    const { supabaseAdmin } = require('./supabase');
    const [usersResult, postsResult, hubPostsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('source', 'ThegxxHub').eq('status', 'ativo')
    ]);
    res.json({
      total_users: usersResult.count ?? 0,
      total_posts: postsResult.count ?? 0,
      hub_posts: hubPostsResult.count ?? 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Config endpoint - returns public env vars only (NEVER service key)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// Serve the browser UMD build from the installed package to avoid flaky external CDN loading.
app.use('/vendor', express.static(path.join(__dirname, '..', 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// All other routes serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
