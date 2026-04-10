/**
 * js/model/ApiService.js
 * Acceso a la API REST del backend. Devuelve datos crudos.
 * Depende de: ApiClient
 */
const ApiService = (() => {

  async function getHealth() {
    const { response } = await ApiClient.request('/api/health', {}, {
      requiresAuth: false,
    });
    return response.ok;
  }

  async function getDevices() {
    const data = await ApiClient.json('/api/devices');
    return (data?.devices || []).map(x => x.id).filter(Boolean);
  }

  async function getDeviceObjects() {
    const data = await ApiClient.json('/api/devices');
    return data?.devices || [];
  }

  async function getSensors(deviceId) {
    const data = await ApiClient.json('/api/devices/' + deviceId + '/sensors');
    return data?.tags || [];
  }

  async function getLatest(deviceId) {
    const data = await ApiClient.json('/api/devices/' + deviceId + '/latest');
    return data?.data || {};
  }

  async function getHistory(deviceId, range) {
    const data = await ApiClient.json('/api/devices/' + deviceId + '/history/' + range);
    return data?.data || [];
  }

  async function getEventSummary(deviceId) {
    const data = await ApiClient.json('/api/devices/' + deviceId + '/events/summary');
    return data?.summary || {};
  }

  async function getEvents(deviceId, { eventType, parameter, limit } = {}) {
    let url = '/api/devices/' + deviceId + '/events?limit=' + (limit || 200);
    if (eventType) url += '&event_type=' + encodeURIComponent(eventType);
    if (parameter) url += '&parameter=' + encodeURIComponent(parameter);

    const data = await ApiClient.json(url);
    return data?.events || [];
  }

  async function addDevice(deviceId) {
    await ApiClient.request('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    return true;
  }

  return {
    getHealth,
    getDevices,
    getDeviceObjects,
    getSensors,
    getLatest,
    getHistory,
    getEventSummary,
    getEvents,
    addDevice,
  };
})();
