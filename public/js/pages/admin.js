// pages/admin.js - Admin panel page
const AdminPage = (() => {

  const HIGHLIGHT_COLORS = ['#e60000', '#ff4444', '#ff6600', '#ff9900', '#ffffff', '#00ccff', '#7c3aed'];

  function render(params) {
    if (!Auth.isLoggedIn()) { Router.navigate('/login'); return; }
    if (!Auth.isAdmin()) { Router.navigate('/'); return; }

    const editId = params?.id || null;
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="page-wrapper">
        <div class="container section">
          <div class="flex-between mb-2">
            <h1>${i18n.t('admin_title')}</h1>
          </div>

          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="dashboard">${i18n.t('tab_dashboard')}</button>
            <button class="admin-tab" data-tab="posts">${i18n.t('tab_posts')}</button>
            <button class="admin-tab" data-tab="users">${i18n.t('tab_users')}</button>
            <button class="admin-tab ${editId ? 'active' : ''}" data-tab="editor">${i18n.t('tab_editor')}</button>
            <button class="admin-tab" data-tab="executores">${i18n.t('tab_executors')}</button>
          </div>

          <div id="admin-dashboard" class="admin-section active">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>

          <div id="admin-posts" class="admin-section">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>

          <div id="admin-users" class="admin-section">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>

          <div id="admin-editor" class="admin-section ${editId ? 'active' : ''}">
            ${renderEditor()}
          </div>

          <div id="admin-executores" class="admin-section">
            <div class="loading-container"><div class="spinner"></div></div>
          </div>
        </div>
      </div>`;

    // Tab switching
    app.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        app.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        app.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        const section = document.getElementById(`admin-${tab.dataset.tab}`);
        if (section) section.classList.add('active');

        if (tab.dataset.tab === 'dashboard') loadDashboard();
        else if (tab.dataset.tab === 'posts') loadAdminPosts();
        else if (tab.dataset.tab === 'users') loadUsers();
        else if (tab.dataset.tab === 'executores') loadExecutores();
      });
    });

    loadDashboard();
    setupEditor(editId);

    if (editId) loadEditPost(editId);
  }

  async function loadDashboard() {
    const el = document.getElementById('admin-dashboard');
    el.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    try {
      const stats = await api.getStats();
      el.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-label">${i18n.t('admin_total_users')}</div>
            <div class="stat-card-value">${stats.total_users}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">${i18n.t('admin_total_posts')}</div>
            <div class="stat-card-value">${stats.total_posts}</div>
          </div>
        </div>
        <h3 style="margin-bottom:1rem;">${i18n.t('admin_top_posts')}</h3>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>${i18n.t('th_title')}</th><th>${i18n.t('th_category')}</th><th>${i18n.t('th_views')}</th><th>${i18n.t('th_likes')}</th><th>${i18n.t('th_date')}</th></tr></thead>
            <tbody>
              ${(stats.top_posts || []).map(p => `
                <tr>
                  <td><a href="/post/${p.id}">${Utils.escapeHtml(p.title)}</a></td>
                  <td>${Utils.categoryLabel(p.category)}</td>
                  <td>${p.views_count}</td>
                  <td>${p.likes_count}</td>
                  <td>${Utils.formatDate(p.created_at)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) {
      el.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  async function loadAdminPosts() {
    const el = document.getElementById('admin-posts');
    el.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    try {
      const { posts } = await api.getPosts({ limit: 50 });
      el.innerHTML = `
        <div class="flex-between mb-2">
          <h3>${i18n.t('manage_posts')}</h3>
          <button class="btn btn-primary btn-sm" id="go-editor-btn">${i18n.t('new_post')}</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>${i18n.t('th_title')}</th><th>${i18n.t('th_category')}</th><th>${i18n.t('th_tags')}</th><th>${i18n.t('th_date')}</th><th>${i18n.t('th_actions')}</th></tr></thead>
            <tbody>
              ${(posts || []).map(p => `
                <tr data-post-id="${p.id}">
                  <td><a href="/post/${p.id}" style="color:var(--text-primary);">${Utils.escapeHtml(p.title)}</a></td>
                  <td>${Utils.categoryLabel(p.category)}</td>
                  <td>${(p.tags || []).slice(0, 3).join(', ')}</td>
                  <td>${Utils.formatDate(p.created_at)}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-secondary btn-sm edit-post-btn" data-id="${p.id}">${i18n.t('btn_edit')}</button>
                      <button class="btn btn-danger btn-sm delete-post-btn" data-id="${p.id}">${i18n.t('btn_delete')}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      document.getElementById('go-editor-btn').addEventListener('click', () => {
        document.querySelector('[data-tab="editor"]').click();
      });

      el.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          document.querySelector('[data-tab="editor"]').click();
          loadEditPost(id);
        });
      });

      el.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', () => deletePost(btn.dataset.id, btn));
      });
    } catch (err) {
      el.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  async function deletePost(id, btn) {
    if (!confirm(i18n.t('confirm_delete_post_admin'))) return;
    btn.disabled = true;
    try {
      await api.deletePost(id);
      btn.closest('tr').remove();
      Utils.showToast(i18n.t('post_deleted_toast'));
    } catch (err) {
      alert('Error: ' + err.message);
      btn.disabled = false;
    }
  }

  async function loadUsers() {
    const el = document.getElementById('admin-users');
    el.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    try {
      const { users } = await api.getUsers({ limit: 50 });
      el.innerHTML = `
        <h3 style="margin-bottom:1rem;">${i18n.t('manage_users')}</h3>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>${i18n.t('th_user')}</th><th>${i18n.t('th_role')}</th><th>${i18n.t('th_status')}</th><th>${i18n.t('th_since')}</th><th>${i18n.t('th_actions')}</th></tr></thead>
            <tbody id="users-table-body">
              ${(users || []).map(u => renderUserRow(u)).join('')}
            </tbody>
          </table>
        </div>`;

      bindUserActions(el);
    } catch (err) {
      el.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderUserRow(u) {
    return `
      <tr data-user-id="${u.id}">
        <td>${Utils.escapeHtml(u.username)}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td>${u.banned ? `<span class="badge badge-banned">${i18n.t('banned_label')}</span>` : `<span style="color:var(--success);">${i18n.t('active_label')}</span>`}</td>
        <td>${Utils.formatDate(u.created_at)}</td>
        <td>
          <div class="flex gap-1">
            <select class="form-select" style="padding:0.3rem 0.5rem;font-size:0.8rem;width:auto;" data-user-role="${u.id}">
              <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
            </select>
            <button class="btn btn-secondary btn-sm save-role-btn" data-id="${u.id}">${i18n.t('save_role_btn')}</button>
            <button class="btn ${u.banned ? 'btn-primary' : 'btn-danger'} btn-sm ban-btn" data-id="${u.id}" data-banned="${u.banned}">
              ${u.banned ? i18n.t('unban_btn') : i18n.t('ban_btn')}
            </button>
          </div>
        </td>
      </tr>`;
  }

  function bindUserActions(el) {
    el.querySelectorAll('.save-role-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const select = el.querySelector(`[data-user-role="${id}"]`);
        btn.disabled = true;
        try {
          await api.setUserRole(id, select.value);
          Utils.showToast(i18n.t('role_updated'));
          loadUsers();
        } catch (err) {
          alert('Error: ' + err.message);
          btn.disabled = false;
        }
      });
    });

    el.querySelectorAll('.ban-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const banned = btn.dataset.banned !== 'true';
        if (!confirm(banned ? i18n.t('confirm_ban') : i18n.t('confirm_unban'))) return;
        btn.disabled = true;
        try {
          await api.banUser(btn.dataset.id, banned);
          Utils.showToast(i18n.t('status_updated'));
          loadUsers();
        } catch (err) {
          alert('Error: ' + err.message);
          btn.disabled = false;
        }
      });
    });
  }

  function renderEditor() {
    return `
      <div id="editor-alert"></div>
      <form id="post-form" enctype="multipart/form-data">
        <input type="hidden" id="edit-post-id" value="">
        <div class="editor-layout">
          <div class="editor-main">
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_title_label')}</label>
              <input class="form-input" type="text" id="post-title" maxlength="200" required placeholder="${i18n.t('editor_title_placeholder')}">
            </div>
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_desc_label')}</label>
              <textarea class="form-textarea" id="post-description" maxlength="2000" required rows="4" placeholder="${i18n.t('editor_desc_placeholder')}"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_script_label')}</label>
              <textarea class="script-editor" id="post-script" required placeholder="${i18n.t('editor_script_placeholder')}"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div class="form-group">
                <label class="form-label">${i18n.t('editor_game_name')}</label>
                <input class="form-input" type="text" id="post-game-name" maxlength="200" placeholder="${i18n.t('editor_game_name_placeholder')}">
              </div>
              <div class="form-group">
                <label class="form-label">${i18n.t('editor_version')}</label>
                <input class="form-input" type="text" id="post-version" maxlength="20" placeholder="${i18n.t('editor_version_placeholder')}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_game_link')}</label>
              <input class="form-input" type="url" id="post-game-link" maxlength="500" placeholder="${i18n.t('editor_game_link_placeholder')}">
            </div>
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_thumbnail')}</label>
              <div class="thumbnail-upload" id="thumb-upload">
                <input type="file" id="post-thumbnail" accept="image/jpeg,image/png,image/webp" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;">
                <div id="thumb-placeholder">
                  <div style="font-size:2rem;color:var(--text-muted);margin-bottom:0.5rem;">&#128247;</div>
                  <div style="font-size:0.875rem;color:var(--text-muted);">${i18n.t('editor_thumb_click')}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${i18n.t('editor_thumb_types')}</div>
                </div>
                <img id="thumb-preview" class="thumbnail-preview hidden" alt="Preview">
              </div>
            </div>
          </div>

          <div class="editor-sidebar">
            <div class="form-group">
              <label class="form-label">${i18n.t('editor_status')}</label>
              <select class="form-select" id="post-status">
                <option value="ativo">${i18n.t('status_active_label')}</option>
                <option value="rascunho">${i18n.t('status_draft_label')}</option>
                <option value="privado">${i18n.t('status_private_label')}</option>
                <option value="arquivado">${i18n.t('status_archived_label')}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${i18n.t('editor_source')}</label>
              <select class="form-select" id="post-source">
                <option value="Terceiros">Terceiros</option>
                <option value="ThegxxHub">ThegxxHub</option>
              </select>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <div class="form-group">
                <label class="form-label" style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
                  <input type="checkbox" id="post-has-key" style="width:16px;height:16px;accent-color:var(--accent);">
                  ${i18n.t('editor_has_key')}
                </label>
              </div>
              <div class="form-group">
                <label class="form-label" style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">
                  <input type="checkbox" id="post-is-paid" style="width:16px;height:16px;accent-color:var(--accent);">
                  ${i18n.t('editor_is_paid')}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">${i18n.t('editor_tags')}</label>
              <div class="tag-input-wrapper" id="tag-wrapper">
                <input class="tag-raw-input" id="tag-input" type="text" placeholder="${i18n.t('tag_placeholder')}" maxlength="30">
              </div>
              <span class="form-hint">${i18n.t('tag_hint')}</span>
            </div>

            <div class="form-group">
              <label class="form-label">${i18n.t('editor_color')}</label>
              <div class="color-options" id="color-options">
                ${HIGHLIGHT_COLORS.map(c => `
                  <div class="color-swatch${c === '#e60000' ? ' selected' : ''}"
                    style="background:${c};" data-color="${c}" title="${c}"></div>`).join('')}
                <input type="color" id="custom-color" value="#e60000" title="Cor personalizada"
                  style="width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;padding:0;background:none;">
              </div>
              <input type="hidden" id="selected-color" value="#e60000">
            </div>

            <div style="margin-top:1rem;">
              <button type="submit" class="btn btn-primary w-full" id="submit-post-btn">${i18n.t('publish_btn')}</button>
              <button type="button" class="btn btn-secondary w-full mt-1" id="clear-editor-btn">${i18n.t('clear_btn')}</button>
            </div>
          </div>
        </div>
      </form>`;
  }

  let _tags = [];

  function setupEditor(editId) {
    _tags = [];

    // Thumbnail preview
    const thumbInput = document.getElementById('post-thumbnail');
    if (thumbInput) {
      thumbInput.addEventListener('change', () => {
        const file = thumbInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            document.getElementById('thumb-preview').src = e.target.result;
            document.getElementById('thumb-preview').classList.remove('hidden');
            document.getElementById('thumb-placeholder').classList.add('hidden');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Color swatches
    const colorOptions = document.getElementById('color-options');
    if (colorOptions) {
      colorOptions.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          colorOptions.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
          swatch.classList.add('selected');
          document.getElementById('selected-color').value = swatch.dataset.color;
        });
      });

      document.getElementById('custom-color').addEventListener('input', (e) => {
        colorOptions.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        document.getElementById('selected-color').value = e.target.value;
      });
    }

    // Tag input
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
      tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(tagInput.value.trim().toLowerCase());
          tagInput.value = '';
        }
      });
    }

    // Clear editor
    document.getElementById('clear-editor-btn')?.addEventListener('click', () => {
      document.getElementById('edit-post-id').value = '';
      document.getElementById('post-form').reset();
      document.getElementById('post-status').value = 'ativo';
      document.getElementById('post-source').value = 'Terceiros';
      _tags = [];
      renderTags();
      document.getElementById('editor-alert').innerHTML = '';
      document.getElementById('submit-post-btn').textContent = i18n.t('publish_btn');
      document.getElementById('thumb-preview').classList.add('hidden');
      document.getElementById('thumb-placeholder').classList.remove('hidden');
    });

    // Form submit
    document.getElementById('post-form')?.addEventListener('submit', handleSubmit);
  }

  function addTag(tag) {
    if (!tag || _tags.includes(tag) || _tags.length >= 10) return;
    const clean = tag.replace(/[^a-z0-9\-_]/g, '').slice(0, 30);
    if (!clean) return;
    _tags.push(clean);
    renderTags();
  }

  function renderTags() {
    const wrapper = document.getElementById('tag-wrapper');
    const input = document.getElementById('tag-input');
    // Remove existing tags (not the input)
    wrapper.querySelectorAll('.tag').forEach(t => t.remove());

    _tags.forEach((tag, i) => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.innerHTML = `${Utils.escapeHtml(tag)}<button class="tag-remove" type="button">&times;</button>`;
      el.querySelector('.tag-remove').addEventListener('click', () => {
        _tags.splice(i, 1);
        renderTags();
      });
      wrapper.insertBefore(el, input);
    });
  }

  async function loadEditPost(id) {
    const alertEl = document.getElementById('editor-alert');
    try {
      const post = await api.getPost(id);
      document.getElementById('edit-post-id').value = post.id;
      document.getElementById('post-title').value = post.title;
      document.getElementById('post-description').value = post.description;
      document.getElementById('post-script').value = post.script_content;
      document.getElementById('post-status').value = post.status || 'ativo';
      document.getElementById('post-source').value = post.source || 'Terceiros';
      document.getElementById('post-has-key').checked = !!post.has_key;
      document.getElementById('post-is-paid').checked = !!post.is_paid;
      document.getElementById('post-game-name').value = post.game_name || '';
      document.getElementById('post-game-link').value = post.game_link || '';
      document.getElementById('post-version').value = post.script_version || '1.0';
      document.getElementById('selected-color').value = post.highlight_color || '#e60000';
      document.getElementById('submit-post-btn').textContent = i18n.t('save_changes_btn');

      _tags = [...(post.tags || [])];
      renderTags();

      if (post.thumbnail_url) {
        document.getElementById('thumb-preview').src = post.thumbnail_url;
        document.getElementById('thumb-preview').classList.remove('hidden');
        document.getElementById('thumb-placeholder').classList.add('hidden');
      }

      Utils.showAlert(alertEl, i18n.t('editing_post', { title: post.title }), 'info');
    } catch (err) {
      Utils.showAlert(alertEl, 'Erro ao carregar post: ' + err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const alertEl = document.getElementById('editor-alert');
    const btn = document.getElementById('submit-post-btn');
    Utils.clearAlert(alertEl);

    const id = document.getElementById('edit-post-id').value;
    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const script_content = document.getElementById('post-script').value;
    const highlight_color = document.getElementById('selected-color').value;
    const thumbFile = document.getElementById('post-thumbnail').files[0];
    const status = document.getElementById('post-status').value;
    const source = document.getElementById('post-source').value;
    const has_key = document.getElementById('post-has-key').checked;
    const is_paid = document.getElementById('post-is-paid').checked;
    const game_name = document.getElementById('post-game-name').value.trim();
    const game_link = document.getElementById('post-game-link').value.trim();
    const script_version = document.getElementById('post-version').value.trim();

    if (!title || !description || !script_content) {
      Utils.showAlert(alertEl, i18n.t('fill_required'));
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('script_content', script_content);
    formData.append('highlight_color', highlight_color);
    formData.append('status', status);
    formData.append('source', source);
    formData.append('has_key', has_key);
    formData.append('is_paid', is_paid);
    formData.append('game_name', game_name);
    formData.append('game_link', game_link);
    formData.append('script_version', script_version || '1.0');
    formData.append('tags', JSON.stringify(_tags));
    if (thumbFile) formData.append('thumbnail', thumbFile);

    btn.disabled = true;
    btn.textContent = i18n.t('saving');

    try {
      if (id) {
        await api.updatePost(id, formData);
        Utils.showAlert(alertEl, i18n.t('post_updated_ok'), 'success');
      } else {
        const post = await api.createPost(formData);
        Utils.showAlert(alertEl, i18n.t('post_created_ok'), 'success');
        document.getElementById('edit-post-id').value = post.id;
        document.getElementById('submit-post-btn').textContent = i18n.t('save_changes_btn');
      }
    } catch (err) {
      Utils.showAlert(alertEl, 'Error: ' + err.message);
    }

    btn.disabled = false;
    btn.textContent = id ? i18n.t('save_changes_btn') : i18n.t('publish_btn');
  }

  // ── Executores ──────────────────────────────────────────────────────────────

  let _executorTags = [];
  let _editingExecutorId = null;

  const EXECUTOR_LEVELS = ['Iniciante', 'Intermediario', 'Avancado'];
  const LEVEL_COLORS = { Iniciante: '#22c55e', Intermediario: '#f59e0b', Avancado: '#e60000' };

  async function loadExecutores() {
    const el = document.getElementById('admin-executores');
    el.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    try {
      const { executors } = await api.getExecutors();
      el.innerHTML = `
        <div class="flex-between mb-2">
          <h3>${i18n.t('manage_executors')}</h3>
          <button class="btn btn-primary btn-sm" id="new-executor-btn">${i18n.t('new_executor')}</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>${i18n.t('th_name')}</th><th>${i18n.t('th_platform')}</th><th>${i18n.t('th_price')}</th><th>${i18n.t('th_level')}</th><th>${i18n.t('th_order')}</th><th>${i18n.t('th_actions')}</th></tr></thead>
            <tbody>
              ${(executors || []).map(ex => `
                <tr data-executor-id="${ex.id}">
                  <td>${Utils.escapeHtml(ex.name)}</td>
                  <td>${Utils.escapeHtml(ex.platform)}</td>
                  <td>${Utils.escapeHtml(ex.price)}</td>
                  <td><span style="color:${ex.level_color};font-weight:600;">${Utils.escapeHtml(ex.level)}</span></td>
                  <td>${ex.display_order}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-secondary btn-sm edit-executor-btn" data-id="${ex.id}">${i18n.t('btn_edit')}</button>
                      <button class="btn btn-danger btn-sm delete-executor-btn" data-id="${ex.id}">${i18n.t('btn_delete')}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div id="executor-form-container" style="display:none;margin-top:2rem;">
          ${renderExecutorForm()}
        </div>`;

      document.getElementById('new-executor-btn').addEventListener('click', () => openExecutorForm(null));

      el.querySelectorAll('.edit-executor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const execData = (executors || []).find(e => e.id === btn.dataset.id);
          if (execData) openExecutorForm(execData);
        });
      });

      el.querySelectorAll('.delete-executor-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteExecutorItem(btn.dataset.id, btn));
      });
    } catch (err) {
      el.innerHTML = `<div class="alert alert-error">${Utils.escapeHtml(err.message)}</div>`;
    }
  }

  function renderExecutorForm() {
    return `
      <div id="executor-alert"></div>
      <h4 id="executor-form-title" style="margin-bottom:1rem;">${i18n.t('new_executor_title')}</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group">
          <label class="form-label">${i18n.t('executor_name_label')}</label>
          <input class="form-input" type="text" id="ex-name" maxlength="100" placeholder="${i18n.t('executor_name_placeholder')}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${i18n.t('executor_platform_label')}</label>
          <input class="form-input" type="text" id="ex-platform" maxlength="200" placeholder="${i18n.t('executor_platform_placeholder')}">
        </div>
        <div class="form-group">
          <label class="form-label">${i18n.t('executor_price_label')}</label>
          <input class="form-input" type="text" id="ex-price" maxlength="100" placeholder="${i18n.t('executor_price_placeholder')}">
        </div>
        <div class="form-group">
          <label class="form-label">${i18n.t('executor_level_label')}</label>
          <select class="form-select" id="ex-level">
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediario">Intermediario</option>
            <option value="Avancado">Avancado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cor do Level</label>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <div class="color-options" id="ex-color-options">
              ${HIGHLIGHT_COLORS.map(c => `<div class="color-swatch" style="background:${c};" data-color="${c}" title="${c}"></div>`).join('')}
              <input type="color" id="ex-custom-color" value="#22c55e" title="Cor personalizada"
                style="width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;padding:0;background:none;">
            </div>
            <input type="hidden" id="ex-level-color" value="#22c55e">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${i18n.t('executor_order_label')}</label>
          <input class="form-input" type="number" id="ex-order" value="0" min="0">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('executor_description_label')}</label>
        <textarea class="form-textarea" id="ex-description" rows="3" maxlength="1000" placeholder="${i18n.t('executor_description_placeholder')}"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('executor_tags_label')}</label>
        <div class="tag-input-wrapper" id="ex-tag-wrapper">
          <input class="tag-raw-input" id="ex-tag-input" type="text" placeholder="${i18n.t('tag_placeholder_executor')}" maxlength="30">
        </div>
        <span class="form-hint">${i18n.t('tag_hint_executor')}</span>
      </div>
      <div style="display:flex;gap:0.75rem;margin-top:1rem;">
        <button class="btn btn-primary" id="save-executor-btn">${i18n.t('save_executor')}</button>
        <button class="btn btn-secondary" id="cancel-executor-btn">${i18n.t('btn_cancel')}</button>
      </div>`;
  }

  function openExecutorForm(execData) {
    _editingExecutorId = execData ? execData.id : null;
    _executorTags = execData ? [...(execData.tags || [])] : [];

    const container = document.getElementById('executor-form-container');
    container.style.display = 'block';
    container.innerHTML = renderExecutorForm();

    document.getElementById('executor-form-title').textContent = execData ? i18n.t('edit_executor_title') : i18n.t('new_executor_title');

    if (execData) {
      document.getElementById('ex-name').value = execData.name || '';
      document.getElementById('ex-platform').value = execData.platform || '';
      document.getElementById('ex-price').value = execData.price || 'Gratuito';
      document.getElementById('ex-level').value = execData.level || 'Iniciante';
      document.getElementById('ex-level-color').value = execData.level_color || '#22c55e';
      document.getElementById('ex-custom-color').value = execData.level_color || '#22c55e';
      document.getElementById('ex-description').value = execData.description || '';
      document.getElementById('ex-order').value = execData.display_order ?? 0;
    }

    renderExecutorTags();

    // Color swatches
    const colorOpts = document.getElementById('ex-color-options');
    colorOpts.querySelectorAll('.color-swatch').forEach(swatch => {
      if (swatch.dataset.color === document.getElementById('ex-level-color').value) {
        swatch.classList.add('selected');
      }
      swatch.addEventListener('click', () => {
        colorOpts.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        document.getElementById('ex-level-color').value = swatch.dataset.color;
        document.getElementById('ex-custom-color').value = swatch.dataset.color;
      });
    });
    document.getElementById('ex-custom-color').addEventListener('input', (e) => {
      colorOpts.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      document.getElementById('ex-level-color').value = e.target.value;
    });

    // Auto-select level color on level change
    document.getElementById('ex-level').addEventListener('change', (e) => {
      const auto = LEVEL_COLORS[e.target.value];
      if (auto) {
        document.getElementById('ex-level-color').value = auto;
        document.getElementById('ex-custom-color').value = auto;
        colorOpts.querySelectorAll('.color-swatch').forEach(s => {
          s.classList.toggle('selected', s.dataset.color === auto);
        });
      }
    });

    // Tag input
    document.getElementById('ex-tag-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !_executorTags.includes(val) && _executorTags.length < 10) {
          _executorTags.push(val.slice(0, 30));
          renderExecutorTags();
        }
        e.target.value = '';
      }
    });

    document.getElementById('save-executor-btn').addEventListener('click', saveExecutor);
    document.getElementById('cancel-executor-btn').addEventListener('click', () => {
      container.style.display = 'none';
    });

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderExecutorTags() {
    const wrapper = document.getElementById('ex-tag-wrapper');
    const input = document.getElementById('ex-tag-input');
    wrapper.querySelectorAll('.tag').forEach(t => t.remove());
    _executorTags.forEach((tag, i) => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.innerHTML = `${Utils.escapeHtml(tag)}<button class="tag-remove" type="button">&times;</button>`;
      el.querySelector('.tag-remove').addEventListener('click', () => {
        _executorTags.splice(i, 1);
        renderExecutorTags();
      });
      wrapper.insertBefore(el, input);
    });
  }

  async function saveExecutor() {
    const alertEl = document.getElementById('executor-alert');
    const btn = document.getElementById('save-executor-btn');
    const name = document.getElementById('ex-name').value.trim();
    if (!name) {
      Utils.showAlert(alertEl, i18n.t('name_required'));
      return;
    }
    const data = {
      name,
      platform: document.getElementById('ex-platform').value.trim(),
      price: document.getElementById('ex-price').value.trim() || 'Gratuito',
      description: document.getElementById('ex-description').value.trim(),
      level: document.getElementById('ex-level').value,
      level_color: document.getElementById('ex-level-color').value,
      display_order: parseInt(document.getElementById('ex-order').value) || 0,
      tags: JSON.stringify(_executorTags)
    };

    btn.disabled = true;
    btn.textContent = i18n.t('saving_executor');
    try {
      if (_editingExecutorId) {
        await api.updateExecutor(_editingExecutorId, data);
        Utils.showToast(i18n.t('executor_updated'));
      } else {
        await api.createExecutor(data);
        Utils.showToast(i18n.t('executor_created'));
      }
      document.getElementById('executor-form-container').style.display = 'none';
      loadExecutores();
    } catch (err) {
      Utils.showAlert(alertEl, 'Error: ' + err.message);
      btn.disabled = false;
      btn.textContent = i18n.t('save_executor');
    }
  }

  async function deleteExecutorItem(id, btn) {
    if (!confirm(i18n.t('confirm_delete_executor'))) return;
    btn.disabled = true;
    try {
      await api.deleteExecutor(id);
      btn.closest('tr').remove();
      Utils.showToast(i18n.t('executor_deleted'));
    } catch (err) {
      alert('Error: ' + err.message);
      btn.disabled = false;
    }
  }

  return { render };
})();
