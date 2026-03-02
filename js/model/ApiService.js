/**
 * js/model/ApiService.js
 * Acceso a la API REST del backend. Devuelve datos crudos.
 * Depende de: AppState
 */
const ApiService = (() => {

  function url(path) {
    return AppState.backendUrl + path;
  }

  async function getHealth() {
    const r = await fetch(url('/api/health'));
    return r.ok;
  }

  async function getDevices() {
    const r = await fetch(url('/api/devices'));
    const d = await r.json();
    return (d.devices || []).map(x => x.id).filter(Boolean);
  }

  async function getSensors(deviceId) {
    const r = await fetch(url('/api/devices/' + deviceId + '/sensors'));
    const d = await r.json();
    return d.tags || [];
  }

  async function getLatest(deviceId) {
    const r = await fetch(url('/api/devices/' + deviceId + '/latest'));
    const d = await r.json();
    return d.data || {};
  }

  async function getHistory(deviceId, range) {
    const r = await fetch(url('/api/devices/' + deviceId + '/history/' + range));
    const d = await r.json();
    return d.data || [];
  }

  async function getEventSummary(deviceId) {
    const r = await fetch(url('/api/devices/' + deviceId + '/events/summary'));
    const d = await r.json();
    return d.summary || {};
  }

  async function getEvents(deviceId, { eventType, parameter, limit } = {}) {
    let u = url('/api/devices/' + deviceId + '/events?limit=' + (limit || 200));
    if (eventType)  u += '&event_type=' + encodeURIComponent(eventType);
    if (parameter)  u += '&parameter='  + encodeURIComponent(parameter);
    const r = await fetch(u);
    const d = await r.json();
    return d.events || [];
  }

  return { getHealth, getDevices, getSensors, getLatest, getHistory, getEventSummary, getEvents };
})();
