/**
 * js/controller/AuthController.js
 * Handles login and authenticated bootstrap.
 */
const AuthController = (() => {
  let eventsBound = false;

  function t(key, params = {}, fallback = '') {
    return I18nService.t(key, params, fallback);
  }

  function showMessage(message, type = '') {
    const element = document.getElementById('auth-message');
    if (!element) return;
    element.textContent = message || '';
    element.className = 'auth-message' + (type ? ' ' + type : '');
  }

  function setLoginLoading(isLoading) {
    const button = document.getElementById('login-submit');
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const passwordToggle = document.querySelector('[data-password-toggle="login-password"]');

    if (button) {
      button.disabled = isLoading;
      button.textContent = isLoading ? t('auth.loggingIn') : t('auth.loginButton');
    }

    if (email) email.disabled = isLoading;
    if (password) password.disabled = isLoading;
    if (passwordToggle) passwordToggle.disabled = isLoading;
  }

  function setupPasswordToggles() {
    function refreshButton(button, input) {
      const isShowing = input.type === 'text';
      button.setAttribute('aria-pressed', String(isShowing));
      button.setAttribute('aria-label', isShowing ? t('auth.hidePassword') : t('auth.showPassword'));
    }

    document.querySelectorAll('[data-password-toggle]').forEach(button => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;

      button.addEventListener('click', () => {
        const shouldShow = input.type === 'password';
        input.type = shouldShow ? 'text' : 'password';
        refreshButton(button, input);
        input.focus();
      });

      window.addEventListener('i18n:changed', () => refreshButton(button, input));
    });
  }

  function showAuthShell(message = '', type = '') {
    document.getElementById('auth-shell').classList.remove('auth-hidden');
    document.body.classList.add('auth-locked');
    showMessage(message, type);
  }

  function hideAuthShell() {
    document.getElementById('auth-shell').classList.add('auth-hidden');
    document.body.classList.remove('auth-locked');
    showMessage('');
    setLoginLoading(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      setLoginLoading(true);
      showMessage(t('auth.validating'));
      await AuthSessionService.login(email, password);
      hideAuthShell();
      await AppController.enterPrivateApp();
    } catch (error) {
      const message = [401, 403].includes(error.status)
        ? t('auth.invalidCredentials')
        : (error.message || t('auth.loginError'));
      showMessage(message, 'err');
    } finally {
      setLoginLoading(false);
    }
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    setupPasswordToggles();
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    window.addEventListener('auth:required', async event => {
      await AppController.leavePrivateApp();
      showAuthShell(
        event.detail?.message || t('auth.authRequired'),
        event.detail?.reason === 'expired' ? 'err' : ''
      );
    });
  }

  async function init() {
    I18nService.init();

    if (typeof PublicController !== 'undefined' && PublicController.isPublicMode()) {
      await PublicController.init();
      return;
    }

    bindEvents();
    showAuthShell(t('auth.recoveringSession'));
    setLoginLoading(true);

    const hasSession = await AuthSessionService.restoreSession();
    if (hasSession) {
      hideAuthShell();
      await AppController.enterPrivateApp();
      return;
    }

    setLoginLoading(false);
    showAuthShell(t('auth.loginRequired'));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => AuthController.init());
