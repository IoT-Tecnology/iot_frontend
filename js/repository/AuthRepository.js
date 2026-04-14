/**
 * js/repository/AuthRepository.js
 * API access for authentication endpoints.
 */
const AuthRepository = (() => {
  async function login(email, password) {
    return ApiClient.json('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, {
      requiresAuth: false,
    });
  }

  async function getCurrentUser() {
    const data = await ApiClient.json('/api/auth/me');
    return data?.user || null;
  }

  async function logout() {
    return ApiClient.request('/api/auth/logout', {
      method: 'POST',
    }, {
      requiresAuth: true,
      sessionExpiredMessage: 'Tu sesion ya habia expirado.',
    });
  }

  return {
    login,
    getCurrentUser,
    logout,
  };
})();
