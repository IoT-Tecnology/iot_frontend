/**
 * js/view/AuditView.js
 * Renders audit summary and table.
 */
const AuditView = (() => {
  function t(key, params = {}, fallback = '') {
    return I18nService.t(key, params, fallback);
  }

  function renderSummaryGrid(items) {
    const grid = document.getElementById('summary-grid');
    const relevantTypes = ['SETPOINT_CHANGE', 'RECIPE_LOAD', 'CALIBRATION', 'TARE_ACTION'];
    const relevant = items.filter(item => relevantTypes.includes(item.event_type));

    if (!relevant.length) {
      grid.innerHTML = '<div class="summary-empty">' + Helpers.escapeHtml(t('audit.noConfig')) + '</div>';
      return;
    }

    grid.innerHTML = relevant.map(item => {
      const isBool = item.new_bool !== null;
      const value = isBool
        ? Helpers.boolHtml(item.new_bool)
        : (item.new_value !== null ? Number(item.new_value).toFixed(2) : t('common.emptyDash', {}, '—'));

      return (
        '<div class="summary-card">' +
          '<div class="summary-param">' + Helpers.escapeHtml(Helpers.formatTagLabel(item.parameter)) + '</div>' +
          '<div class="summary-value">' + value + '</div>' +
          '<div class="summary-meta">' + Helpers.escapeHtml(Helpers.fmtDateTime(item.received_at)) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function setSummaryLoading() {
    document.getElementById('summary-grid').innerHTML =
      '<div class="summary-empty">' + Helpers.escapeHtml(t('audit.currentConfigLoading')) + '</div>';
  }

  function setSummaryError() {
    document.getElementById('summary-grid').innerHTML =
      '<div class="summary-empty">' + Helpers.escapeHtml(t('audit.configLoadError')) + '</div>';
  }

  function populateParamFilter(items) {
    const select = document.getElementById('evt-param-filter');
    if (!select) return;

    select.innerHTML = '<option value="">' + Helpers.escapeHtml(t('common.all')) + '</option>';
    const existing = new Set(Array.from(select.options).map(option => option.value));
    items.forEach(item => {
      if (existing.has(item.parameter)) return;
      const option = document.createElement('option');
      option.value = item.parameter;
      option.textContent = Helpers.formatTagLabel(item.parameter);
      select.appendChild(option);
      existing.add(item.parameter);
    });
  }

  function renderEventsTable(events) {
    const tbody = document.getElementById('events-body');
    document.getElementById('events-count').textContent = t('audit.eventsCount', { count: events.length });

    if (!events.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-row">' + Helpers.escapeHtml(t('audit.noEvents')) + '</td></tr>';
      return;
    }

    tbody.innerHTML = events.map(event => {
      const isBool = event.old_bool !== null || event.new_bool !== null;
      const oldValue = isBool
        ? Helpers.boolHtml(event.old_bool)
        : (event.old_value !== null
          ? '<span class="val-old">' + Helpers.escapeHtml(Helpers.fmt2(event.old_value)) + '</span>'
          : t('common.emptyDash', {}, '—'));
      const newValue = isBool
        ? Helpers.boolHtml(event.new_bool)
        : (event.new_value !== null
          ? '<span class="val-new">' + Helpers.escapeHtml(Helpers.fmt2(event.new_value)) + '</span>'
          : t('common.emptyDash', {}, '—'));

      return (
        '<tr>' +
          '<td>' + Helpers.escapeHtml(Helpers.fmtDateTime(event.received_at)) + '</td>' +
          '<td><span class="evt-badge evt-' + Helpers.escapeHtml(event.event_type) + '">' +
            Helpers.escapeHtml(Helpers.fmtEventType(event.event_type)) + '</span></td>' +
          '<td class="table-text-sm">' + Helpers.escapeHtml(Helpers.formatTagLabel(event.parameter)) + '</td>' +
          '<td>' + oldValue + '</td>' +
          '<td>' + newValue + '</td>' +
          '<td class="table-detail-cell">' + Helpers.escapeHtml(event.details || '') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function setEventsLoading() {
    document.getElementById('events-body').innerHTML =
      '<tr><td colspan="6" class="empty-row">' + Helpers.escapeHtml(t('audit.eventsLoading')) + '</td></tr>';
  }

  function setEventsError() {
    document.getElementById('events-body').innerHTML =
      '<tr><td colspan="6" class="empty-row">' + Helpers.escapeHtml(t('audit.eventsLoadError')) + '</td></tr>';
  }

  return {
    renderSummaryGrid,
    setSummaryLoading,
    setSummaryError,
    populateParamFilter,
    renderEventsTable,
    setEventsLoading,
    setEventsError,
  };
})();
