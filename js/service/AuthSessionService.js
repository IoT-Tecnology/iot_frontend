/**
 * js/service/AuthSessionService.js
 * Session persistence and authenticated user lifecycle.
 */
const AuthSessionService = (() => {
  const TOKEN_KEY = 'rp_auth_token';
  const USER_KEY = 'rp_auth_user';
  const BACKEND_URL_KEY = 'rp_auth_backend_url';

  AppState.setBackendUrl(AppConfig.apiUrl);

  function isStoredSessionFromCurrentBackend() {
    const storedBackendUrl = localStorage.getItem(BACKEND_URL_KEY) || '';
    return !storedBackendUrl || storedBackendUrl === AppConfig.apiUrl;
  }

  function getToken() {
    if (!isStoredSessionFromCurrentBackend()) {
      clearSession();
      return '';
    }

    return AppState.authToken || localStorage.getItem(TOKEN_KEY) || '';
  }

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    AppState.setAuthSession(token, user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || null));
    localStorage.setItem(BACKEND_URL_KEY, AppConfig.apiUrl);
  }

  function clearSession() {
    AppState.clearAuthSession();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BACKEND_URL_KEY);
  }

  async function restoreSession() {
    const token = getToken();
    if (!token) {
      clearSession();
      return false;
    }

    AppState.setAuthSession(token, getStoredUser());

    try {
      const user = await AuthRepository.getCurrentUser();
      setSession(token, user);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }

  async function login(email, password) {
    const data = await AuthRepository.login(email, password);
    setSession(data?.token || '', data?.user || null);
    return data;
  }

  async function logout() {
    try {
      await AuthRepository.logout();
    } catch (error) {
      if (!(error instanceof ApiClient.AuthSessionError)) {
        console.warn('[AuthSessionService] logout remoto no disponible:', error.message);
      }
    } finally {
      clearSession();
    }
  }

  async function getCurrentUser() {
    const user = await AuthRepository.getCurrentUser();
    setSession(getToken(), user);
    return user;
  }

  async function authenticatedFetch(path, options = {}) {
    const { response } = await ApiClient.request(path, options);
    return response;
  }

  return {
    getToken,
    getStoredUser,
    setSession,
    clearSession,
    restoreSession,
    logout,
    getCurrentUser,
    authenticatedFetch,
    login,
  };
})();
