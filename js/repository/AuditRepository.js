/**
 * js/repository/AuditRepository.js
 * API access for audit and machine event endpoints.
 */
const AuditRepository = (() => {
  async function getEventSummary(deviceKey) {
    const data = await ApiClient.json('/api/devices/' + encodeURIComponent(deviceKey) + '/events/summary');
    return data?.summary || {};
  }

  async function getEvents(deviceKey, { eventType, parameter, limit } = {}) {
    let url = '/api/devices/' + encodeURIComponent(deviceKey) + '/events?limit=' + encodeURIComponent(limit || 200);
    if (eventType) url += '&event_type=' + encodeURIComponent(eventType);
    if (parameter) url += '&parameter=' + encodeURIComponent(parameter);

    const data = await ApiClient.json(url);
    return data?.events || [];
  }

  return {
    getEventSummary,
    getEvents,
  };
})();
