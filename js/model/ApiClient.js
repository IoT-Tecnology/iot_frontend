/**
 * js/model/ApiClient.js
 * Central HTTP client with shared error handling.
 */
const ApiClient = (() => {
  class ApiError extends Error {
    constructor(message, status, data = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  }

  class AuthSessionError extends ApiError {
    constructor(message = I18nService.t('auth.sessionExpired'), data = null, status = 401) {
      super(message, status, data);
      this.name = 'AuthSessionError';
    }
  }

  function buildUrl(path) {
    return AppConfig.apiUrl + path;
  }

  async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function createHeaders(headers = {}, includeJson = false) {
    const finalHeaders = { ...headers };
    if (includeJson && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    return finalHeaders;
  }

  function buildResponseErrorMessage(data) {
    return data?.error || data?.message || I18nService.t('common.errorGeneric');
  }

  async function request(path, options = {}, config = {}) {
    const {
      requiresAuth = true,
      includeJsonHeader = false,
      sessionExpiredMessage = I18nService.t('auth.sessionExpired'),
    } = config;

    const headers = createHeaders(options.headers, includeJsonHeader);
    const session = typeof AuthSessionService !== 'undefined' ? AuthSessionService : null;
    const token = requiresAuth && session ? session.getToken() : '';

    if (requiresAuth && token) {
      headers.Authorization = 'Bearer ' + token;
    }

    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });

    const data = await parseResponse(response);

    if (response.status === 401 || response.status === 403) {
      if (requiresAuth) {
        if (session) session.clearSession();
        window.dispatchEvent(new CustomEvent('auth:required', {
          detail: {
            reason: 'expired',
            message: sessionExpiredMessage,
          },
        }));
        throw new AuthSessionError(sessionExpiredMessage, data, response.status);
      }

      throw new ApiError(buildResponseErrorMessage(data), response.status, data);
    }

    if (!response.ok) {
      throw new ApiError(buildResponseErrorMessage(data), response.status, data);
    }

    return { response, data };
  }

  async function json(path, options = {}, config = {}) {
    const result = await request(path, options, config);
    return result.data;
  }

  return {
    ApiError,
    AuthSessionError,
    buildUrl,
    request,
    json,
  };
})();
