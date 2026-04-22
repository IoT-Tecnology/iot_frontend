/**
 * js/service/I18nService.js
 * Runtime internationalization for DOM and JS strings.
 */
const I18nService = (() => {
  const STORAGE_KEY = 'rp_lang';
  const DEFAULT_LANGUAGE = 'es';
  let currentLanguage = DEFAULT_LANGUAGE;

  function getDictionary(language = currentLanguage) {
    return window.ReadyPackersLocales?.[language] || {};
  }

  function getValue(dictionary, key) {
    return key.split('.').reduce((acc, part) => acc?.[part], dictionary);
  }

  function interpolate(template, params = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '');
  }

  function t(key, params = {}, fallback = '') {
    const value = getValue(getDictionary(), key);
    if (typeof value === 'string') return interpolate(value, params);
    if (value !== undefined && value !== null) return value;
    if (fallback) return interpolate(fallback, params);
    return key;
  }

  function getLanguage() {
    return currentLanguage;
  }

  function getIntlLocale() {
    return t('meta.locale', {}, 'es-CO');
  }

  function setDocumentMetadata() {
    document.documentElement.lang = t('meta.htmlLang', {}, currentLanguage);
    document.title = t('meta.pageTitle');
  }

  function applyElementTranslation(element) {
    const textKey = element.dataset.i18n;
    const attrMap = element.dataset.i18nAttrs;

    if (textKey) {
      element.textContent = t(textKey);
    }

    if (!attrMap) return;
    attrMap.split(';')
      .map(item => item.trim())
      .filter(Boolean)
      .forEach(entry => {
        const [attr, key] = entry.split(':').map(part => part.trim());
        if (!attr || !key) return;
        element.setAttribute(attr, t(key));
      });
  }

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n], [data-i18n-attrs]').forEach(applyElementTranslation);
    setDocumentMetadata();
    refreshLanguageButtons(root);
  }

  function refreshLanguageButtons(root = document) {
    root.querySelectorAll('[data-language-toggle]').forEach(button => {
      button.textContent = t('language.toggleLabel');
      button.setAttribute('aria-label', t('language.toggleAria'));
      button.setAttribute('title', t('language.toggleAria'));
    });
  }

  function notifyChange() {
    window.dispatchEvent(new CustomEvent('i18n:changed', {
      detail: { language: currentLanguage },
    }));
  }

  function setLanguage(language) {
    if (!window.ReadyPackersLocales?.[language]) return;
    currentLanguage = language;
    localStorage.setItem(STORAGE_KEY, language);
    applyTranslations();
    notifyChange();
  }

  function toggleLanguage() {
    setLanguage(currentLanguage === 'es' ? 'en' : 'es');
  }

  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    currentLanguage = window.ReadyPackersLocales?.[stored] ? stored : DEFAULT_LANGUAGE;
    applyTranslations();
    document.querySelectorAll('[data-language-toggle]').forEach(button => {
      button.addEventListener('click', toggleLanguage);
    });
  }

  return {
    init,
    t,
    getLanguage,
    getIntlLocale,
    applyTranslations,
    setLanguage,
    toggleLanguage,
  };
})();
