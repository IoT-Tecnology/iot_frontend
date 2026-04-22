/**
 * js/utils/helpers.js
 * Pure formatting helpers.
 */
const Helpers = (() => {
  const VISIBLE_VARIABLE_TAGS = [
    'telemetry_pv_peso_promedio',
    'telemetry_sp_peso_promedio',
    'telemetry_cantidad_productos_total',
  ];

  const VISIBLE_VARIABLE_SET = new Set(VISIBLE_VARIABLE_TAGS);

  function t(key, params = {}, fallback = '') {
    return typeof I18nService !== 'undefined'
      ? I18nService.t(key, params, fallback)
      : fallback || key;
  }

  function getLocale() {
    return typeof I18nService !== 'undefined'
      ? I18nService.getIntlLocale()
      : 'es-CO';
  }

  function fmt2(value) {
    return typeof value === 'number'
      ? value.toFixed(2)
      : (value !== null && value !== undefined ? Number(value).toFixed(2) : t('common.emptyDash', {}, '—'));
  }

  function toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value > 1e12 ? value : value * 1000);
    if (typeof value === 'string') {
      const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
      return new Date(hasTimezone ? value : value + 'Z');
    }
    return new Date(value);
  }

  function fmtTime(value) {
    const date = toDate(value);
    if (!date) return t('common.emptyDash', {}, '—');
    return new Intl.DateTimeFormat(getLocale(), {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function fmtDateTime(value) {
    const date = toDate(value);
    if (!date) return t('common.emptyDash', {}, '—');
    return new Intl.DateTimeFormat(getLocale(), {
      timeZone: 'America/Bogota',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(date);
  }

  function formatTagLabel(tag) {
    if (!tag) return '';
    return tag
      .replace(/^telemetry_/, '')
      .replace(/^event_/, '')
      .replace(/_/g, ' ')
      .replace(/\bpv\b/i, 'PV')
      .replace(/\bsp\b/i, 'SP')
      .replace(/\bppm\b/i, 'PPM')
      .replace(/\bms\b/i, 'ms');
  }

  function isVisibleVariableTag(tag) {
    return VISIBLE_VARIABLE_SET.has(tag);
  }

  function filterVisibleVariableTags(tags) {
    return VISIBLE_VARIABLE_TAGS.filter(tag => tags.includes(tag));
  }

  function fmtEventType(type) {
    return t('audit.eventBadge.' + type, {}, type);
  }

  function boolHtml(value) {
    if (value === null || value === undefined) return t('common.emptyDash', {}, '—');
    return value
      ? '<span class="val-bool-true">TRUE</span>'
      : '<span class="val-bool-false">FALSE</span>';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    fmt2,
    toDate,
    fmtTime,
    fmtDateTime,
    formatTagLabel,
    isVisibleVariableTag,
    filterVisibleVariableTags,
    fmtEventType,
    boolHtml,
    escapeHtml,
    VISIBLE_VARIABLE_TAGS,
  };
})();
