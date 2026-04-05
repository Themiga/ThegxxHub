// pages/post.js - Single post page
const PostPage = (() => {

  async function render(params) {
    const { id } = params;
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="page-wrapper">
        <div class="container section">
          <div class="loading-container"><div class="spinner"></div><span>${i18n.t('post_loading')}</span></div>
        </div>
      </div>`;

    try {
      const post = await api.getPost(id);
      renderPost(app, post);
    } catch (err) {
      app.innerHTML = `
        <div class="page-wrapper">
          <div class="container section">
            <div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>
            <a href="/" class="btn btn-secondary mt-2">${i18n.t('back_home')}</a>
          </div>
        </div>`;
    }
  }

  function renderPost(app, post) {
    const isAdmin = Auth.isAdmin();

    const tags = (post.tags || []).map(t =>
      `<span class="tag">${Utils.escapeHtml(t)}</span>`
    ).join('');

    const thumbnail = post.thumbnail_url
      ? `<img src="${Utils.escapeHtml(post.thumbnail_url)}" alt="${Utils.escapeHtml(post.title)}" style="width:100%;border-radius:8px;margin-bottom:1.5rem;max-height:400px;object-fit:cover;">`
      : '';

    const highlightedCode = Utils.highlightLua(post.script_content || '');

    const adminActions = isAdmin ? `
      <div class="flex gap-1">
        <a href="/admin/edit/${post.id}" class="btn btn-secondary btn-sm">${i18n.t('btn_edit')}</a>
        <button class="btn btn-danger btn-sm" id="delete-post-btn">${i18n.t('btn_delete')}</button>
      </div>` : '';

    // Build info badges
    const statusLabels = {
      ativo: i18n.t('status_active'),
      privado: i18n.t('status_private'),
      rascunho: i18n.t('status_draft'),
      arquivado: i18n.t('status_archived')
    };
    const statusColors = { ativo: '#22c55e', privado: '#f59e0b', rascunho: '#6b7280', arquivado: '#6b7280' };
    const statusVal = post.status || 'ativo';
    const statusBadge = isAdmin && statusVal !== 'ativo'
      ? `<span style="display:inline-block;font-size:0.72rem;font-weight:700;color:${statusColors[statusVal]};background:${statusColors[statusVal]}22;border:1px solid ${statusColors[statusVal]}44;border-radius:4px;padding:0.15rem 0.5rem;margin-left:0.5rem;">${statusLabels[statusVal]}</span>`
      : '';

    const infoBadges = [
      post.source === 'ThegxxHub' ? `<span class="badge badge-hub">ThegxxHub</span>` : `<span class="badge" style="background:var(--bg-tertiary);color:var(--text-secondary);border:1px solid var(--border);">${i18n.t('third_party')}</span>`,
      post.has_key ? `<span class="badge badge-key">${i18n.t('has_key')}</span>` : `<span class="badge badge-free">${i18n.t('no_key')}</span>`,
      post.is_paid ? `<span class="badge badge-paid">${i18n.t('paid')}</span>` : `<span class="badge badge-free">${i18n.t('free')}</span>`,
    ].join('');

    const gameInfo = post.game_name ? `
      <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;font-size:0.875rem;">
        <span style="color:var(--text-muted);">${i18n.t('post_game')}</span>
        ${post.game_link
          ? `<a href="${Utils.escapeHtml(post.game_link)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:600;">${Utils.escapeHtml(post.game_name)} &#8599;</a>`
          : `<strong style="color:var(--text-secondary);">${Utils.escapeHtml(post.game_name)}</strong>`
        }
      </div>` : '';

    const versionInfo = post.script_version && post.script_version !== '1.0'
      ? `<span style="font-size:0.78rem;color:var(--text-muted);">v${Utils.escapeHtml(post.script_version)}</span>`
      : '';

    app.innerHTML = `
      <div class="page-wrapper">
        <div class="container">
          <div class="post-header">
            <a href="/scripts" style="color:var(--text-muted);font-size:0.875rem;display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:1rem;">
              ${i18n.t('back_to_scripts')}
            </a>

            <div class="flex-between" style="align-items:flex-start;flex-wrap:wrap;gap:1rem;">
              <div>
                <h1 style="margin:0 0 0.25rem;">${Utils.escapeHtml(post.title)}${statusBadge}</h1>
                ${versionInfo}
              </div>
              ${adminActions}
            </div>

            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.75rem 0;">
              ${infoBadges}
            </div>
            ${gameInfo}

            <div class="post-meta" style="margin-top:0.75rem;">
              <span class="post-author">${i18n.t('post_by')} <strong>${Utils.escapeHtml(post.author?.username || i18n.t('unknown'))}</strong></span>
              <span>&#183;</span>
              <span>${Utils.formatDate(post.created_at)}</span>
              <span>&#183;</span>
              <span>&#128065; ${post.views_count ?? 0} ${i18n.t('post_views')}</span>
              ${post.avg_rating ? `<span>&#183;</span><span>&#9733; ${post.avg_rating} (${post.ratings_count} ${i18n.t('post_ratings')})</span>` : ''}
            </div>

            ${tags ? `<div class="card-tags mt-1">${tags}</div>` : ''}
          </div>

          <div class="post-body">
            ${thumbnail}

            <p style="font-size:1rem;color:var(--text-secondary);margin-bottom:1.5rem;">${Utils.escapeHtml(post.description)}</p>

            <div class="code-wrapper" style="border-left:3px solid ${Utils.escapeHtml(post.highlight_color || '#e60000')};">
              <div class="code-header">
                <span class="code-lang">Lua Script</span>
                <button class="btn btn-primary btn-sm" id="copy-btn">${i18n.t('copy_script')}</button>
              </div>
              <div class="code-body">
                <pre><code id="script-code">${highlightedCode}</code></pre>
              </div>
            </div>
          </div>

          <div class="post-interactions">
            <div>
              <div class="interaction-label" style="margin-bottom:0.5rem;">${i18n.t('rating_label')}</div>
              <div id="rating-section">
                ${renderRatingSection(post)}
              </div>
            </div>
            <div>
              <div class="interaction-label" style="margin-bottom:0.5rem;">${i18n.t('votes_label')}</div>
              <div class="like-actions" id="like-actions">
                ${renderLikeButtons(post)}
              </div>
            </div>
          </div>

          <div id="interaction-alert"></div>
        </div>
      </div>`;

    // Copy script
    document.getElementById('copy-btn').addEventListener('click', () => {
      Utils.copyToClipboard(post.script_content);
    });

    // Like buttons
    setupLikeButtons(post);

    // Rating
    setupRating(post);

    // Delete post (admin)
    const deleteBtn = document.getElementById('delete-post-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deletePost(post.id));
    }
  }

  function renderLikeButtons(post) {
    const isLoggedIn = Auth.isLoggedIn();
    if (!isLoggedIn) {
      return `<span style="font-size:0.875rem;color:var(--text-muted);">
        <a href="/login">${i18n.t('sign_in')}</a> ${i18n.t('sign_in_to_vote')}
      </span>`;
    }

    return `
      <button class="like-btn ${post.user_like === 'like' ? 'active-like' : ''}" id="like-btn" data-type="like">
        &#128077; <span id="likes-count">${post.likes_count ?? 0}</span>
      </button>
      <button class="like-btn ${post.user_like === 'dislike' ? 'active-dislike' : ''}" id="dislike-btn" data-type="dislike">
        &#128078; <span id="dislikes-count">${post.dislikes_count ?? 0}</span>
      </button>`;
  }

  function setupLikeButtons(post) {
    if (!Auth.isLoggedIn()) return;

    let likes = post.likes_count ?? 0;
    let dislikes = post.dislikes_count ?? 0;
    let currentLike = post.user_like;

    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const alertEl = document.getElementById('interaction-alert');

    function updateUI() {
      document.getElementById('likes-count').textContent = likes;
      document.getElementById('dislikes-count').textContent = dislikes;
      likeBtn.className = `like-btn ${currentLike === 'like' ? 'active-like' : ''}`;
      dislikeBtn.className = `like-btn ${currentLike === 'dislike' ? 'active-dislike' : ''}`;
    }

    async function handleLike(type) {
      likeBtn.disabled = true;
      dislikeBtn.disabled = true;
      try {
        const res = await api.likePost(post.id, type);
        const prev = currentLike;

        if (res.action === 'removed') {
          if (type === 'like') likes--;
          else dislikes--;
          currentLike = null;
        } else if (res.action === 'updated') {
          if (type === 'like') { likes++; dislikes--; }
          else { dislikes++; likes--; }
          currentLike = type;
        } else {
          if (type === 'like') likes++;
          else dislikes++;
          currentLike = type;
        }
        updateUI();
        Utils.clearAlert(alertEl);
      } catch (err) {
        Utils.showAlert(alertEl, err.message);
      }
      likeBtn.disabled = false;
      dislikeBtn.disabled = false;
    }

    likeBtn.addEventListener('click', () => handleLike('like'));
    dislikeBtn.addEventListener('click', () => handleLike('dislike'));
  }

  function renderRatingSection(post) {
    if (!Auth.isLoggedIn()) {
      return `<span style="font-size:0.875rem;color:var(--text-muted);">
        <a href="/login">${i18n.t('sign_in')}</a> ${i18n.t('sign_in_to_rate')}
      </span>`;
    }

    const current = post.user_rating ?? 0;
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star${i <= current ? ' active' : ''}" data-rating="${i}">&#9733;</span>`;
    }

    return `
      <div class="rating-stars" id="stars-container">
        ${starsHtml}
      </div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem;" id="rating-feedback">
        ${current ? i18n.t('rated_x_of_5', { n: current }) : i18n.t('click_to_rate')}
      </div>`;
  }

  function setupRating(post) {
    if (!Auth.isLoggedIn()) return;

    const container = document.getElementById('stars-container');
    if (!container) return;

    const alertEl = document.getElementById('interaction-alert');
    let currentRating = post.user_rating ?? 0;
    let submitting = false;

    const stars = container.querySelectorAll('.star');

    function updateStars(hoverRating) {
      stars.forEach((s, i) => {
        s.className = 'star' + (i < (hoverRating || currentRating) ? ' active' : '');
      });
    }

    stars.forEach(star => {
      star.addEventListener('mouseenter', () => updateStars(parseInt(star.dataset.rating)));
      star.addEventListener('mouseleave', () => updateStars(0));
      star.addEventListener('click', async () => {
        if (submitting) return;
        submitting = true;
        const rating = parseInt(star.dataset.rating);
        try {
          await api.ratePost(post.id, rating);
          currentRating = rating;
          document.getElementById('rating-feedback').textContent = i18n.t('rated_x_of_5', { n: rating });
          updateStars(0);
          Utils.clearAlert(alertEl);
        } catch (err) {
          Utils.showAlert(alertEl, err.message);
        }
        submitting = false;
      });
    });
  }

  async function deletePost(id) {
    if (!confirm(i18n.t('confirm_delete_post'))) return;
    try {
      await api.deletePost(id);
      Utils.showToast(i18n.t('post_deleted'));
      Router.navigate('/');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return { render };
})();
