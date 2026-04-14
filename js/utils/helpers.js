/**
 * js/utils/helpers.js
 * Funciones puras de formato. Sin dependencias.
 */
const Helpers = (() => {
  const VISIBLE_VARIABLE_TAGS = [
    'telemetry_pv_peso_promedio',
    'telemetry_sp_peso_promedio',
    'telemetry_cantidad_productos_total',
  ];

  const VISIBLE_VARIABLE_SET = new Set(VISIBLE_VARIABLE_TAGS);

  function fmt2(v) {
    return typeof v === 'number'
      ? v.toFixed(2)
      : (v !== null && v !== undefined ? (+v).toFixed(2) : '—');
  }

  function toDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v > 1e12 ? v : v * 1000);
    if (typeof v === 'string') {
      const hasTz = /[zZ]|[+-]\d{2}:\d{2}$/.test(v);
      return new Date(hasTz ? v : v + 'Z');
    }
    return new Date(v);
  }

  function fmtTime(value) {
    const d = toDate(value);
    if (!d) return '—';
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit'
    }).format(d);
  }

  function fmtDateTime(value) {
    const d = toDate(value);
    if (!d) return '—';
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'medium'
    }).format(d);
  }

  function formatTagLabel(tag) {
    if (!tag) return '';
    return tag
      .replace(/^telemetry_/, '').replace(/^event_/, '')
      .replace(/_/g, ' ')
      .replace(/\bpv\b/i,  'PV').replace(/\bsp\b/i,  'SP')
      .replace(/\bppm\b/i, 'PPM').replace(/\bms\b/i, 'ms');
  }

  function isVisibleVariableTag(tag) {
    return VISIBLE_VARIABLE_SET.has(tag);
  }

  function filterVisibleVariableTags(tags) {
    return VISIBLE_VARIABLE_TAGS.filter(tag => tags.includes(tag));
  }

  function fmtEventType(t) {
    const m = {
      SETPOINT_CHANGE: 'SetPoint', STATE_CHANGE: 'Estado',
      ALARM_TRIGGER:   'Alarma',   ALARM_CLEAR:  'Alarma OK',
      TARE_ACTION:     'Tara',     RECIPE_LOAD:  'Receta',
      CALIBRATION:     'Calibración',
    };
    return m[t] || t;
  }

  function boolHtml(val) {
    if (val === null || val === undefined) return '—';
    return val
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
    fmt2, toDate, fmtTime, fmtDateTime,
    formatTagLabel, isVisibleVariableTag, filterVisibleVariableTags,
    fmtEventType, boolHtml, escapeHtml,
    VISIBLE_VARIABLE_TAGS,
  };
})();
