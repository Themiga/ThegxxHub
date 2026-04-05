// app.js - Application bootstrap, header, routing
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Apply persisted language to <html> element
    document.documentElement.lang = i18n.getLang() === 'pt' ? 'pt-BR' : 'en';

    // Initialize auth before anything else
    await Auth.init();

    // Setup router
    Router.init();

    Router.define('/', () => HomePage.render());
    Router.define('/scripts', () => ScriptsPage.render());
    Router.define('/executores', () => ExecutorsPage.render());
    Router.define('/login', () => AuthPage.renderLogin());
    Router.define('/register', () => AuthPage.renderRegister());
    Router.define('/post/:id', (params) => PostPage.render(params));
    Router.define('/admin', () => AdminPage.render({}));
    Router.define('/admin/edit/:id', (params) => {
      AdminPage.render({ id: params.id });
    });
    Router.define('*', () => renderNotFound());

    // Render header
    renderHeader();

    // Update header when auth changes
    Auth.onChange(() => {
      renderHeader();
      // If we're on a protected page, re-route
      const path = window.location.pathname;
      if (path.startsWith('/admin') && !Auth.isAdmin()) {
        Router.navigate('/');
      }
    });

    // Re-render on language change
    document.addEventListener('langchange', () => {
      renderHeader();
      Router.navigate(window.location.pathname, false);
    });

    // Navigate to current path
    Router.navigate(window.location.pathname, false);
  } catch (error) {
    console.error('Bootstrap error:', error);
    renderStartupError(error);
  }
});

function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const profile = Auth.getProfile();
  const isLoggedIn = Auth.isLoggedIn();
  const isAdmin = Auth.isAdmin();
  const path = window.location.pathname;
  const lang = i18n.getLang();

  header.innerHTML = `
    <div class="header-inner">
      <a href="/" class="header-logo">
        <img src="/logo.png" alt="ThegxxHub" onerror="this.style.display='none'">
        <span><em>Thegxx</em>Hub</span>
      </a>

      <nav class="header-nav">
        <a href="/" class="${path === '/' ? 'active' : ''}">${i18n.t('nav_home')}</a>
        <a href="/scripts" class="${path === '/scripts' ? 'active' : ''}">${i18n.t('nav_scripts')}</a>
        <a href="/executores" class="${path === '/executores' ? 'active' : ''}">${i18n.t('nav_executors')}</a>
        ${isAdmin ? `<a href="/admin" class="${path.startsWith('/admin') ? 'active' : ''}">${i18n.t('nav_admin')}</a>` : ''}
      </nav>

      <div class="header-actions">
        <div class="lang-toggle">
          <button class="lang-btn${lang === 'en' ? ' lang-active' : ''}" data-lang="en">EN</button>
          <button class="lang-btn${lang === 'pt' ? ' lang-active' : ''}" data-lang="pt">PT</button>
        </div>
        ${isLoggedIn ? `
          <div class="user-badge">
            <span>${escapeHeaderText(profile?.username || i18n.t('nav_user_fallback'))}</span>
            ${isAdmin ? '<span class="role-tag">admin</span>' : ''}
          </div>
          <button class="btn btn-ghost btn-sm" id="logout-btn">${i18n.t('nav_logout')}</button>
        ` : `
          <a href="/register" class="btn btn-secondary btn-sm">${i18n.t('nav_register')}</a>
          <a href="/login" class="btn btn-primary btn-sm">${i18n.t('nav_login')}</a>
        `}
      </div>
    </div>`;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await Auth.signOut();
    Router.navigate('/');
  });

  header.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => i18n.setLang(btn.dataset.lang));
  });
}

function escapeHeaderText(str) {
  const d = document.createElement('span');
  d.textContent = str;
  return d.innerHTML;
}

function renderNotFound() {
  document.getElementById('app').innerHTML = `
    <div class="page-wrapper">
      <div class="container section text-center" style="padding-top:4rem;">
        <div style="font-size:5rem;color:var(--accent);font-weight:800;">404</div>
        <h2>${i18n.t('page_not_found')}</h2>
        <p style="margin:1rem 0 2rem;">${i18n.t('page_not_found_desc')}</p>
        <a href="/" class="btn btn-primary">${i18n.t('go_home')}</a>
      </div>
    </div>`;
}

function renderStartupError(error) {
  const message = error?.message || 'Failed to start the application.';
  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = `
      <div class="header-inner">
        <a href="/" class="header-logo">
          <img src="/logo.png" alt="ThegxxHub" onerror="this.style.display='none'">
          <span><em>Thegxx</em>Hub</span>
        </a>
      </div>`;
  }

  document.getElementById('app').innerHTML = `
    <div class="page-wrapper">
      <div class="container section" style="max-width:720px;padding-top:4rem;">
        <div class="alert alert-error">
          ${escapeHeaderText(message)}
        </div>
        <p style="margin-top:1rem;">
          ${i18n.t('startup_error_hint')}
        </p>
      </div>
    </div>`;
}

