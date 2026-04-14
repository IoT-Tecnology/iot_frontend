/**
 * js/view/AuditView.js
 * Renderiza la pestaña Auditoría: grid resumen y tabla de eventos.
 * Depende de: Helpers
 */
const AuditView = (() => {

  // ── Summary grid ─────────────────────────────────────────────────────────────
  function renderSummaryGrid(items) {
    const grid = document.getElementById('summary-grid');
    const RELEVANT = ['SETPOINT_CHANGE', 'RECIPE_LOAD', 'CALIBRATION', 'TARE_ACTION'];
    const relevant = items.filter(e => RELEVANT.includes(e.event_type));

    if (!relevant.length) {
      grid.innerHTML = '<div class="summary-empty">Sin configuración registrada</div>';
      return;
    }

    grid.innerHTML = relevant.map(e => {
      const isBool = e.new_bool !== null;
      const val = isBool
        ? Helpers.boolHtml(e.new_bool)
        : (e.new_value !== null ? (+e.new_value).toFixed(2) : '—');
      return (
        '<div class="summary-card">' +
        '<div class="summary-param">' + Helpers.formatTagLabel(e.parameter) + '</div>' +
        '<div class="summary-value">' + val + '</div>' +
        '<div class="summary-meta">' + Helpers.fmtDateTime(e.received_at) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function setSummaryLoading() {
    document.getElementById('summary-grid').innerHTML =
      '<div class="summary-empty">Cargando...</div>';
  }

  function setSummaryError() {
    document.getElementById('summary-grid').innerHTML =
      '<div class="summary-empty">Error al cargar configuración</div>';
  }

  // ── Param filter ─────────────────────────────────────────────────────────────
  function populateParamFilter(items) {
    const sel = document.getElementById('evt-param-filter');
    sel.innerHTML = '<option value="">Todos</option>';
    const existing = new Set(Array.from(sel.options).map(o => o.value));
    items.forEach(e => {
      if (!existing.has(e.parameter)) {
        const opt = document.createElement('option');
        opt.value       = e.parameter;
        opt.textContent = Helpers.formatTagLabel(e.parameter);
        sel.appendChild(opt);
        existing.add(e.parameter);
      }
    });
  }

  // ── Events table ─────────────────────────────────────────────────────────────
  function renderEventsTable(events) {
    const tbody = document.getElementById('events-body');
    document.getElementById('events-count').textContent = events.length + ' eventos';

    if (!events.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Sin eventos registrados</td></tr>';
      return;
    }

    tbody.innerHTML = events.map(e => {
      const isBool = e.old_bool !== null || e.new_bool !== null;
      const oldVal = isBool
        ? Helpers.boolHtml(e.old_bool)
        : (e.old_value !== null ? '<span class="val-old">' + Helpers.fmt2(e.old_value) + '</span>' : '—');
      const newVal = isBool
        ? Helpers.boolHtml(e.new_bool)
        : (e.new_value !== null ? '<span class="val-new">' + Helpers.fmt2(e.new_value) + '</span>' : '—');

      return (
        '<tr>' +
        '<td>' + Helpers.fmtDateTime(e.received_at) + '</td>' +
        '<td><span class="evt-badge evt-' + e.event_type + '">' +
          Helpers.fmtEventType(e.event_type) + '</span></td>' +
        '<td class="table-text-sm">' + Helpers.formatTagLabel(e.parameter) + '</td>' +
        '<td>' + oldVal + '</td>' +
        '<td>' + newVal + '</td>' +
        '<td class="table-detail-cell">' + Helpers.escapeHtml(e.details || '') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function setEventsLoading() {
    document.getElementById('events-body').innerHTML =
      '<tr><td colspan="6" class="empty-row">Cargando...</td></tr>';
  }

  function setEventsError() {
    document.getElementById('events-body').innerHTML =
      '<tr><td colspan="6" class="empty-row">Error al cargar eventos</td></tr>';
  }

  return {
    renderSummaryGrid, setSummaryLoading, setSummaryError,
    populateParamFilter,
    renderEventsTable, setEventsLoading, setEventsError,
  };
})();
