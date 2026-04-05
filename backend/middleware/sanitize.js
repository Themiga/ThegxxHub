const sanitizeHtml = require('sanitize-html');

function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

function sanitizeScript(value) {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter(t => typeof t === 'string')
    .map(t => sanitizeText(t).toLowerCase().replace(/[^a-z0-9\-_]/g, ''))
    .filter(t => t.length > 0 && t.length <= 30)
    .slice(0, 10);
}

function validateColor(value) {
  if (typeof value !== 'string') return '#e60000';
  const clean = value.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(clean) ? clean : '#e60000';
}

const ALLOWED_CATEGORIES = ['general', 'gui', 'exploit', 'admin', 'utility', 'game', 'fun', 'movement', 'combat'];

function validateCategory(value) {
  if (typeof value !== 'string') return 'general';
  const lower = value.toLowerCase().trim();
  return ALLOWED_CATEGORIES.includes(lower) ? lower : 'general';
}

const ALLOWED_SOURCES = ['ThegxxHub', 'Terceiros'];

function validateSource(value) {
  return ALLOWED_SOURCES.includes(value) ? value : 'Terceiros';
}

const ALLOWED_STATUSES = ['ativo', 'privado', 'rascunho', 'arquivado'];

function validateStatus(value) {
  return ALLOWED_STATUSES.includes(value) ? value : 'ativo';
}

// Only Roblox game URLs are allowed for game links
function validateGameLink(value) {
  if (!value || typeof value !== 'string') return null;
  const clean = value.trim().slice(0, 500);
  if (!clean) return null;
  try {
    const url = new URL(clean);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (hostname !== 'roblox.com') return null;
    return clean;
  } catch {
    return null;
  }
}

// Sanitize search strings to prevent PostgREST filter injection
function sanitizeSearch(value) {
  if (typeof value !== 'string') return '';
  let clean = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
  // Remove characters that could break PostgREST OR filter syntax
  clean = clean.replace(/[,()'"\\<>]/g, '').slice(0, 100);
  return clean;
}

function sanitizeVersion(value) {
  if (!value || typeof value !== 'string') return '1.0';
  return value.trim().replace(/[^0-9a-zA-Z.\-]/g, '').slice(0, 20) || '1.0';
}

module.exports = {
  sanitizeText, sanitizeScript, sanitizeTags, validateColor, validateCategory,
  validateSource, validateStatus, validateGameLink, sanitizeSearch, sanitizeVersion,
  ALLOWED_CATEGORIES, ALLOWED_SOURCES, ALLOWED_STATUSES
};
