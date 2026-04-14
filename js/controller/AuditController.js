/**
 * js/controller/AuditController.js
 * Orquesta la pestaña Auditoría: resumen de configuración y tabla de eventos.
 * Depende de: AppState, AuditService, AuditView
 */
const AuditController = (() => {

  async function loadEventSummary() {
    AuditView.setSummaryLoading();
    try {
      const items = await AuditService.getVisibleEventSummary(AppState.currentDevice);
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
      const visibleEvents = await AuditService.getVisibleEvents(AppState.currentDevice, { eventType, parameter, limit });
      AuditView.renderEventsTable(visibleEvents);
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
