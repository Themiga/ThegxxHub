// pages/home.js - Landing page
const HomePage = (() => {

  async function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="background:radial-gradient(ellipse at 50% -10%, rgba(230,0,0,0.12) 0%, var(--bg-primary) 65%);">

        <!-- HERO -->
        <section style="padding:5rem 0 3.5rem;text-align:center;">
          <div class="container" style="max-width:680px;">
            <div style="display:inline-flex;align-items:center;gap:0.4rem;background:rgba(230,0,0,0.1);border:1px solid rgba(230,0,0,0.3);border-radius:999px;padding:0.3rem 0.9rem;font-size:0.78rem;color:var(--accent);font-weight:700;letter-spacing:0.04em;margin-bottom:1.5rem;text-transform:uppercase;">
              ${i18n.t('home_tagline')}
            </div>
            <h1 style="font-size:clamp(2rem,6vw,3.4rem);font-weight:800;margin:0 0 1rem;line-height:1.1;letter-spacing:-0.02em;">
              ${i18n.t('home_hero_line1')}<br>
              <span style="color:var(--accent);">${i18n.t('home_hero_accent')}</span> ${i18n.t('home_hero_line2')}
            </h1>
            <p style="font-size:1.05rem;color:var(--text-secondary);margin:0 auto 2.5rem;max-width:480px;line-height:1.6;">
              ${i18n.t('home_hero_sub')}
            </p>
            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
              <a href="/scripts" class="btn btn-primary" style="padding:0.75rem 2rem;font-size:1rem;">${i18n.t('home_cta_scripts')}</a>
              <a href="/executores" class="btn btn-secondary" style="padding:0.75rem 1.5rem;font-size:1rem;">${i18n.t('home_cta_executors')}</a>
            </div>
          </div>
        </section>

        <!-- STATS -->
        <section class="container" style="padding:0 1.5rem 3rem;">
          <div id="stats-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;max-width:540px;margin:0 auto;">
            <div class="stat-card">
              <div class="stat-card-value" id="stat-posts">-</div>
              <div class="stat-card-label">${i18n.t('home_stat_posts')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value" id="stat-users">-</div>
              <div class="stat-card-label">${i18n.t('home_stat_users')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value" id="stat-hub">-</div>
              <div class="stat-card-label">${i18n.t('home_stat_hub')}</div>
            </div>
          </div>
        </section>

        <!-- FEATURED SCRIPTS -->
        <section class="container section" style="padding-top:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem;">
            <h2 style="margin:0;font-size:1.3rem;">${i18n.t('home_recent')}</h2>
            <a href="/scripts" class="btn btn-ghost btn-sm">${i18n.t('home_view_all')} &#8250;</a>
          </div>
          <div id="featured-container">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>
        </section>

      </div>`;

    loadStats();
    loadFeatured();
  }

  async function loadStats() {
    try {
      const stats = await api.getPublicStats();
      const el = document.getElementById('stat-posts');
      const eu = document.getElementById('stat-users');
      const eh = document.getElementById('stat-hub');
      if (el) el.textContent = stats.total_posts ?? 0;
      if (eu) eu.textContent = stats.total_users ?? 0;
      if (eh) eh.textContent = stats.hub_posts ?? 0;
    } catch (_) {}
  }

  async function loadFeatured() {
    const container = document.getElementById('featured-container');
    try {
      const { posts } = await api.getPosts({ limit: 6, page: 1 });
      if (!posts || posts.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-title">${i18n.t('home_empty')}</div></div>`;
        return;
      }
      container.innerHTML = `<div class="posts-grid">${posts.map(renderCard).join('')}</div>`;
    } catch (err) {
      container.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderCard(post) {
    const thumb = post.thumbnail_url
      ? `<img class="card-thumbnail" src="${Utils.escapeHtml(post.thumbnail_url)}" alt="${Utils.escapeHtml(post.title)}" loading="lazy">`
      : `<div class="card-thumbnail-placeholder">&#128196;</div>`;

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
          <div class="card-stats">
            <span class="stat-item">&#128065; ${post.views_count ?? 0}</span>
            <span class="stat-item">&#128077; ${post.likes_count ?? 0}</span>
            ${post.avg_rating ? `<span class="stat-item">&#9733; ${post.avg_rating}</span>` : ''}
            <span class="stat-item" style="margin-left:auto;font-size:0.75rem;">${Utils.timeAgo(post.created_at)}</span>
          </div>
        </div>
      </a>`;
  }

  return { render };
})();


