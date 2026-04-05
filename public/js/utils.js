// utils.js - Shared utilities
const Utils = (() => {

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const locale = (typeof i18n !== 'undefined' && i18n.getLang() === 'pt') ? 'pt-BR' : 'en-US';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const _t = (typeof i18n !== 'undefined') ? i18n.t.bind(i18n) : (k) => k;
    if (mins < 1) return _t('time_now');
    if (mins < 60) return _t('time_m_ago', { n: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return _t('time_h_ago', { n: hrs });
    const days = Math.floor(hrs / 24);
    if (days < 30) return _t('time_d_ago', { n: days });
    return formatDate(dateStr);
  }

  function truncate(str, len = 120) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len - 3) + '...' : str;
  }

  function showToast(message, duration = 2500) {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast';
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  function copyToClipboard(text) {
    const _t = (typeof i18n !== 'undefined') ? i18n.t.bind(i18n) : (k) => k;
    navigator.clipboard.writeText(text).then(() => {
      showToast(_t('copied_clipboard'));
    }).catch(() => {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast(_t('copied'));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderStars(rating, maxStars = 5) {
    let html = '';
    for (let i = 1; i <= maxStars; i++) {
      html += `<span class="star${i <= rating ? ' active' : ''}">&#9733;</span>`;
    }
    return html;
  }

  // Simple Lua syntax highlighting
  function highlightLua(code) {
    const luaKeywords = /\b(and|break|do|else|elseif|end|false|for|function|goto|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/g;
    const luaStrings = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g;
    const luaComments = /(--[^\n]*)/g;
    const luaNumbers = /\b(\d+\.?\d*)\b/g;
    const luaFunctions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g;

    const escaped = escapeHtml(code);

    // Use placeholders to avoid double-processing
    const placeholders = [];
    let result = escaped;

    function placeholder(str, cls) {
      const idx = placeholders.length;
      placeholders.push(`<span class="token ${cls}">${str}</span>`);
      return `\x00${idx}\x00`;
    }

    // Comments first (highest priority)
    result = result.replace(luaComments, (m) => placeholder(m, 'comment'));
    // Strings
    result = result.replace(luaStrings, (m) => placeholder(m, 'string'));
    // Keywords
    result = result.replace(luaKeywords, (m) => placeholder(m, 'keyword'));
    // Functions
    result = result.replace(luaFunctions, (m, fn) => placeholder(fn, 'function') + m.slice(fn.length));
    // Numbers
    result = result.replace(luaNumbers, (m) => placeholder(m, 'number'));

    // Restore placeholders
    result = result.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i)]);
    return result;
  }

  function categoryLabel(cat) {
    const map = {
      general: 'Geral',
      gui: 'GUI',
      exploit: 'Exploit',
      admin: 'Admin',
      utility: 'Utilidade',
      game: 'Jogo',
      fun: 'Diversao',
      movement: 'Movimento',
      combat: 'Combate'
    };
    return map[cat] || cat;
  }

  function showAlert(container, msg, type = 'error') {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${escapeHtml(msg)}</div>`;
  }

  function clearAlert(container) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (el) el.innerHTML = '';
  }

  return {
    formatDate, timeAgo, truncate, showToast, copyToClipboard,
    escapeHtml, renderStars, highlightLua, categoryLabel,
    showAlert, clearAlert
  };
})();
