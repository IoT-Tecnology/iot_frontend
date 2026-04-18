/**
 * js/config/AppConfig.js
 * Configuracion central del frontend para distintos entornos.
 */
window.AppConfig = (() => {
  function normalizeUrl(value) {
    const raw = (value || '').trim().replace(/\/+$/, '');
    if (!raw) return '';
    if (raw === 'localhost') return 'http://localhost:3000';
    if (/^localhost:\d+$/i.test(raw)) return 'http://' + raw;
    return raw;
  }

  function getLocalFallbackUrl() {
    const location = window.location || {};
    if (location.protocol === 'file:') return 'http://localhost:3000';
    if (['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '3000') {
      return 'http://localhost:3000';
    }
    return '';
  }

  function resolveApiUrl() {
    const runtimeConfig = window.__APP_CONFIG__ || {};
    const metaApiUrl = document.querySelector('meta[name="api-base-url"]')?.content || '';
    const viteApiUrl = import.meta?.env?.VITE_API_URL || '';

    return normalizeUrl(
      runtimeConfig.apiUrl ||
      viteApiUrl ||
      metaApiUrl ||
      getLocalFallbackUrl() ||
      ''
    );
  }

  return {
    apiUrl: resolveApiUrl(),
  };
})();
