/**
 * js/controller/AuditController.js
 * Orquesta la pestaña Auditoría: resumen de configuración y tabla de eventos.
 * Depende de: AppState, ApiService, AuditView
 */
const AuditController = (() => {

  async function loadEventSummary() {
    AuditView.setSummaryLoading();
    try {
      const summary = await ApiService.getEventSummary(AppState.currentDevice);
      const items   = Object.values(summary);
      AuditView.renderSummaryGrid(items);
      AuditView.populateParamFilter(items);
    } catch (err) {
      AuditView.setSummaryError();
      console.error('[AuditController] loadEventSummary', err);
    }
  }

  async function loadEvents() {
    AuditView.setEventsLoading();
    try {
      const eventType = document.getElementById('evt-type-filter').value;
      const parameter = document.getElementById('evt-param-filter').value;
      const limit     = document.getElementById('evt-limit-filter').value;
      const events    = await ApiService.getEvents(AppState.currentDevice, { eventType, parameter, limit });
      AuditView.renderEventsTable(events);
    } catch (err) {
      AuditView.setEventsError();
      console.error('[AuditController] loadEvents', err);
    }
  }

  async function refresh() {
    await Promise.all([loadEventSummary(), loadEvents()]);
  }

  return { loadEventSummary, loadEvents, refresh };
})();
