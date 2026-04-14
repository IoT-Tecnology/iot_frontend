/**
 * js/service/AuditService.js
 * Audit business logic and event filtering.
 */
const AuditService = (() => {
  function ensureAuditAllowed() {
    if (!RoleAccessService.canViewAudit()) {
      throw new ApiClient.ApiError('Permisos insuficientes para auditoria.', 403);
    }
  }

  async function getVisibleEventSummary(deviceKey) {
    ensureAuditAllowed();
    const summary = await AuditRepository.getEventSummary(deviceKey);
    return Object.values(summary).filter(e => Helpers.isVisibleVariableTag(e.parameter));
  }

  async function getVisibleEvents(deviceKey, filters = {}) {
    ensureAuditAllowed();
    const events = await AuditRepository.getEvents(deviceKey, filters);
    return events.filter(e => Helpers.isVisibleVariableTag(e.parameter));
  }

  return {
    getVisibleEventSummary,
    getVisibleEvents,
  };
})();
