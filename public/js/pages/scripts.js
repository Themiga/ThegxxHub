// pages/scripts.js - Scripts listing page
const ScriptsPage = (() => {
  let currentPage = 1;
  let currentSearch = '';
  let currentSource = null;
  let currentHasKey = null;
  let currentIsPaid = null;
  const LIMIT = 12;

  function render() {
    currentPage = 1;
    currentSearch = '';
    currentSource = null;
    currentHasKey = null;
    currentIsPaid = null;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-wrapper">
        <div class="container section">
          <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.5rem;">
            <div>
              <h1 style="font-size:1.4rem;margin:0;">${i18n.t('scripts_title')}</h1>
              <p style="margin:0.25rem 0 0;color:var(--text-muted);font-size:0.875rem;">${i18n.t('scripts_subtitle')}</p>
            </div>
            <div style="display:flex;gap:0.6rem;flex-wrap:wrap;align-items:center;">
              <select class="form-select" id="filter-source" style="padding:0.5rem 0.75rem;">
                <option value="">${i18n.t('filter_all_sources')}</option>
                <option value="ThegxxHub">ThegxxHub</option>
                <option value="Terceiros">${i18n.t('filter_third_party')}</option>
              </select>
              <select class="form-select" id="filter-key" style="padding:0.5rem 0.75rem;">
                <option value="">${i18n.t('filter_with_without_key')}</option>
                <option value="false">${i18n.t('filter_no_key')}</option>
                <option value="true">${i18n.t('filter_has_key')}</option>
              </select>
              <select class="form-select" id="filter-paid" style="padding:0.5rem 0.75rem;">
                <option value="">${i18n.t('filter_free_paid')}</option>
                <option value="false">${i18n.t('filter_free_only')}</option>
                <option value="true">${i18n.t('filter_paid_only')}</option>
              </select>
              <div class="search-bar" style="min-width:200px;">
                <input type="text" id="search-input" placeholder="${i18n.t('search_placeholder')}">
                <button id="search-btn">${i18n.t('search_btn')}</button>
              </div>
            </div>
          </div>

          <div id="posts-alert"></div>
          <div id="posts-container">
            <div class="loading-container"><div class="spinner"></div><span>${i18n.t('loading_scripts')}</span></div>
          </div>
          <div id="pagination"></div>
        </div>
      </div>`;

    document.getElementById('filter-source').addEventListener('change', e => {
      currentSource = e.target.value || null;
      currentPage = 1;
      loadPosts();
    });
    document.getElementById('filter-key').addEventListener('change', e => {
      currentHasKey = e.target.value === '' ? null : e.target.value;
      currentPage = 1;
      loadPosts();
    });
    document.getElementById('filter-paid').addEventListener('change', e => {
      currentIsPaid = e.target.value === '' ? null : e.target.value;
      currentPage = 1;
      loadPosts();
    });

    const searchInput = document.getElementById('search-input');
    document.getElementById('search-btn').addEventListener('click', () => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      loadPosts();
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadPosts();
      }
    });

    loadPosts();
  }

  async function loadPosts() {
    const container = document.getElementById('posts-container');
    const paginationEl = document.getElementById('pagination');
    container.innerHTML = `<div class="loading-container"><div class="spinner"></div><span>${i18n.t('loading')}</span></div>`;
    paginationEl.innerHTML = '';

    try {
      const params = { page: currentPage, limit: LIMIT };
      if (currentSearch) params.search = currentSearch;
      if (currentSource) params.source = currentSource;
      if (currentHasKey !== null) params.has_key = currentHasKey;
      if (currentIsPaid !== null) params.is_paid = currentIsPaid;

      const { posts, total } = await api.getPosts(params);

      if (!posts || posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">&#9888;</div>
            <div class="empty-title">${i18n.t('no_scripts_found')}</div>
            <div class="empty-desc">${i18n.t('no_scripts_hint')}</div>
          </div>`;
        return;
      }

      container.innerHTML = `<div class="posts-grid">${posts.map(renderCard).join('')}</div>`;
      renderPagination(paginationEl, total);
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderCard(post) {
    const thumb = post.thumbnail_url
      ? `<img class="card-thumbnail" src="${Utils.escapeHtml(post.thumbnail_url)}" alt="${Utils.escapeHtml(post.title)}" loading="lazy">`
      : `<div class="card-thumbnail-placeholder">&#128196;</div>`;

    const tags = (post.tags || []).slice(0, 3).map(t =>
      `<span class="tag">${Utils.escapeHtml(t)}</span>`
    ).join('');

    const badges = [
      post.source === 'ThegxxHub' ? `<span class="badge badge-hub">ThegxxHub</span>` : '',
      post.has_key ? `<span class="badge badge-key">KEY</span>` : '',
      post.is_paid ? `<span class="badge badge-paid">${i18n.t('paid').toUpperCase()}</span>` : `<span class="badge badge-free">${i18n.t('free').toUpperCase()}</span>`,
    ].filter(Boolean).join('');

    return `
      <a href="/post/${Utils.escapeHtml(post.id)}" class="card" style="display:block;text-decoration:none;">
        ${thumb}
        <div class="card-body">
          ${badges ? `<div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem;">${badges}</div>` : ''}
          <div class="card-title">${Utils.escapeHtml(post.title)}</div>
          <div class="card-desc">${Utils.escapeHtml(post.description)}</div>
          ${tags ? `<div class="card-tags">${tags}</div>` : ''}
          ${post.game_name ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.4rem;">&#127918; <strong style="color:var(--text-secondary);">${Utils.escapeHtml(post.game_name)}</strong></div>` : ''}
          <div class="card-stats">
            <span class="stat-item">&#128065; ${post.views_count ?? 0}</span>
            <span class="stat-item">&#128077; ${post.likes_count ?? 0}</span>
            ${post.avg_rating ? `<span class="stat-item">&#9733; ${post.avg_rating}</span>` : ''}
            <span class="stat-item" style="margin-left:auto;font-size:0.75rem;">${Utils.timeAgo(post.created_at)}</span>
          </div>
        </div>
      </a>`;
  }

  function renderPagination(el, total) {
    const totalPages = Math.ceil(total / LIMIT);
    if (totalPages <= 1) return;

    let html = '';
    if (currentPage > 1) html += `<button class="page-btn" data-page="${currentPage - 1}">&#8249;</button>`;

    for (let p = Math.max(1, currentPage - 2); p <= Math.min(totalPages, currentPage + 2); p++) {
      html += `<button class="page-btn${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
    }

    if (currentPage < totalPages) html += `<button class="page-btn" data-page="${currentPage + 1}">&#8250;</button>`;

    el.innerHTML = `<div class="pagination">${html}</div>`;
    el.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadPosts();
      });
    });
  }

  return { render };
})();
