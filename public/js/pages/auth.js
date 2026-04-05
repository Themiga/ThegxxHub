// pages/auth.js - Login and Register pages
const AuthPage = (() => {

  function renderLogin() {
    if (Auth.isLoggedIn()) {
      Router.navigate('/');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo">
            <img src="/logo.png" alt="Logo" onerror="this.style.display='none'">
            <h2><span style="color:var(--accent);">Thegxx</span>Hub</h2>
            <p style="font-size:0.875rem;color:var(--text-muted);">${i18n.t('login_subtitle')}</p>
          </div>

          <div id="auth-alert"></div>

          <form id="login-form" autocomplete="on">
            <div class="form-group">
              <label class="form-label" for="email">${i18n.t('email_label')}</label>
              <input class="form-input" type="email" id="email" name="email" required autocomplete="email" placeholder="seu@email.com">
            </div>
            <div class="form-group">
              <label class="form-label" for="password">${i18n.t('password_label')}</label>
              <input class="form-input" type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary w-full" id="login-btn">${i18n.t('login_btn')}</button>
          </form>

          <div class="auth-divider">${i18n.t('auth_or')}</div>

          <div class="auth-switch">
            ${i18n.t('no_account')} <a href="/register">${i18n.t('create_account_link')}</a>
          </div>
        </div>
      </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const alertEl = document.getElementById('auth-alert');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      Utils.clearAlert(alertEl);
      btn.disabled = true;
      btn.textContent = i18n.t('logging_in');

      try {
        await Auth.signIn(email, password);
        Router.navigate('/');
      } catch (err) {
        Utils.showAlert(alertEl, err.message);
        btn.disabled = false;
        btn.textContent = i18n.t('login_btn');
      }
    });
  }

  function renderRegister() {
    if (Auth.isLoggedIn()) {
      Router.navigate('/');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo">
            <img src="/logo.png" alt="Logo" onerror="this.style.display='none'">
            <h2><span style="color:var(--accent);">Thegxx</span>Hub</h2>
            <p style="font-size:0.875rem;color:var(--text-muted);">${i18n.t('register_subtitle')}</p>
          </div>

          <div id="auth-alert"></div>

          <form id="register-form" autocomplete="on">
            <div class="form-group">
              <label class="form-label" for="username">${i18n.t('username_label')}</label>
              <input class="form-input" type="text" id="username" name="username" required
                autocomplete="username" placeholder="seu_nome_aqui"
                minlength="3" maxlength="30" pattern="[a-zA-Z0-9_\\-]+">
              <span class="form-hint">${i18n.t('username_hint')}</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">${i18n.t('email_label')}</label>
              <input class="form-input" type="email" id="email" name="email" required autocomplete="email" placeholder="seu@email.com">
            </div>
            <div class="form-group">
              <label class="form-label" for="password">${i18n.t('password_label')}</label>
              <input class="form-input" type="password" id="password" name="password" required
                autocomplete="new-password" placeholder="••••••••" minlength="6">
              <span class="form-hint">${i18n.t('password_hint')}</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="password-confirm">${i18n.t('confirm_password_label')}</label>
              <input class="form-input" type="password" id="password-confirm" name="password-confirm" required
                autocomplete="new-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary w-full" id="register-btn">${i18n.t('register_btn')}</button>
          </form>

          <div class="auth-divider">${i18n.t('auth_or')}</div>

          <div class="auth-switch">
            ${i18n.t('already_account')} <a href="/login">${i18n.t('login_btn')}</a>
          </div>
        </div>
      </div>`;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const alertEl = document.getElementById('auth-alert');

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('password-confirm').value;

      Utils.clearAlert(alertEl);

      if (password !== confirm) {
        Utils.showAlert(alertEl, i18n.t('passwords_no_match'));
        return;
      }
      if (!/^[a-zA-Z0-9_\-]{3,30}$/.test(username)) {
        Utils.showAlert(alertEl, i18n.t('invalid_username'));
        return;
      }

      btn.disabled = true;
      btn.textContent = i18n.t('creating_account');

      try {
        const data = await Auth.signUp(email, password, username);
        if (data.user && !data.session) {
          Utils.showAlert(alertEl, i18n.t('account_created'), 'success');
        } else {
          Router.navigate('/');
        }
      } catch (err) {
        Utils.showAlert(alertEl, err.message);
      }

      btn.disabled = false;
      btn.textContent = i18n.t('register_btn');
    });
  }

  return { renderLogin, renderRegister };
})();
