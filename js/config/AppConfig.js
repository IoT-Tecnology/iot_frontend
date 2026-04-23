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

  function isLocalDevHost() {
    const location = window.location || {};
    return ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  }

  function parseEnvValue(content, key) {
    const pattern = new RegExp('^\\s*' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*(.+?)\\s*$', 'm');
    const match = String(content || '').match(pattern);
    if (!match) return '';
    return match[1].trim().replace(/^["']|["']$/g, '');
  }

  function readLocalEnvApiUrl() {
    if (!isLocalDevHost()) return '';

    const candidates = ['/.env', '.env'];
    for (const path of candidates) {
      try {
        const request = new XMLHttpRequest();
        request.open('GET', path, false);
        request.send(null);
        if (request.status >= 200 && request.status < 300) {
          return normalizeUrl(parseEnvValue(request.responseText, 'VITE_API_URL'));
        }
      } catch {}
    }

    return '';
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
    const localEnvApiUrl = readLocalEnvApiUrl();
    const metaApiUrl = document.querySelector('meta[name="api-base-url"]')?.content || '';
    const viteApiUrl = import.meta?.env?.VITE_API_URL || '';

    return normalizeUrl(
      runtimeConfig.apiUrl ||
      localEnvApiUrl ||
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
