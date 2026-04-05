// pages/executors.js - Executors page (loaded from database)
const ExecutorsPage = (() => {

  function render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-wrapper">
        <div class="container section">
          <div style="margin-bottom:2rem;">
            <h1>${i18n.t('executors_title')}</h1>
            <p style="margin-top:0.4rem;color:var(--text-secondary);">
              ${i18n.t('executors_subtitle')}
            </p>
          </div>

          <div class="alert" style="background:rgba(230,0,0,0.07);border:1px solid rgba(230,0,0,0.25);color:var(--text-secondary);margin-bottom:2rem;border-radius:8px;padding:1rem 1.25rem;font-size:0.875rem;">
            <strong style="color:var(--accent);">${i18n.t('executors_warning_title')}</strong>
            ${i18n.t('executors_warning_text')}
          </div>

          <div id="executors-content">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>
        </div>
      </div>`;

    loadExecutors();
  }

  async function loadExecutors() {
    const el = document.getElementById('executors-content');
    try {
      const { executors } = await api.getExecutors();
      if (!executors || executors.length === 0) {
        el.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:3rem 0;">${i18n.t('executors_empty')}</p>`;
        return;
      }
      el.innerHTML = `<div class="executors-grid">${executors.map(renderCard).join('')}</div>`;
    } catch (err) {
      el.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderCard(ex) {
    const color = ex.level_color || '#22c55e';
    const tagHtml = (ex.tags || []).map(t =>
      `<span class="tag">${Utils.escapeHtml(t)}</span>`
    ).join('');

    return `
      <div class="card" style="cursor:default;">
        <div class="card-body">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;">
            <h3 style="font-size:1.05rem;margin:0;color:var(--text-primary);">${Utils.escapeHtml(ex.name)}</h3>
            <span style="font-size:0.7rem;font-weight:700;color:${color};background:${color}22;padding:0.2rem 0.55rem;border-radius:4px;border:1px solid ${color}44;white-space:nowrap;flex-shrink:0;">
              ${Utils.escapeHtml(ex.level)}
            </span>
          </div>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0 0 0.75rem;line-height:1.5;">${Utils.escapeHtml(ex.description)}</p>
          <div style="display:flex;gap:1rem;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;flex-wrap:wrap;">
            <span>&#128187; <strong style="color:var(--text-secondary);">${Utils.escapeHtml(ex.platform)}</strong></span>
            <span>&#128178; <strong style="color:var(--text-secondary);">${Utils.escapeHtml(ex.price)}</strong></span>
          </div>
          <div class="card-tags">${tagHtml}</div>
        </div>
      </div>`;
  }

  return { render };
})();
