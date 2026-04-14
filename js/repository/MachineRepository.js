/**
 * js/repository/MachineRepository.js
 * API access for machine administration and machine sensors.
 */
const MachineRepository = (() => {
  function buildListUrl({ includeInactive } = {}) {
    return '/api/machines' + (includeInactive ? '?includeInactive=true' : '');
  }

  function buildSensorsUrl(machineId, { includeInactive } = {}) {
    const suffix = includeInactive ? '?includeInactive=true' : '';
    return '/api/machines/' + encodeURIComponent(machineId) + '/sensors' + suffix;
  }

  async function list(options = {}) {
    const data = await ApiClient.json(buildListUrl(options));
    return data?.machines || [];
  }

  async function create(payload) {
    const data = await ApiClient.json('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data?.machine || null;
  }

  async function update(id, payload) {
    const data = await ApiClient.json('/api/machines/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data?.machine || data || null;
  }

  async function setStatus(id, status) {
    const data = await ApiClient.json('/api/machines/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return data?.machine || data || null;
  }

  async function remove(id) {
    return ApiClient.json('/api/machines/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  async function listSensors(machineId, options = {}) {
    const data = await ApiClient.json(buildSensorsUrl(machineId, options));
    return data?.sensors || data?.variables || data?.tags || [];
  }

  async function createSensor(machineId, payload) {
    return ApiClient.json('/api/machines/' + encodeURIComponent(machineId) + '/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  return {
    list,
    create,
    update,
    setStatus,
    remove,
    listSensors,
    createSensor,
  };
})();
