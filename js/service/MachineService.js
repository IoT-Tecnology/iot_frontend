/**
 * js/service/MachineService.js
 * Business logic and adapters for machines.
 */
const MachineService = (() => {
  function getDeviceKey(machine) {
    return machine?.device_key || machine?.deviceKey || machine?.device_name || machine?.id || '';
  }

  function normalizeMachineForTelemetry(machine) {
    const deviceKey = getDeviceKey(machine);
    return {
      ...machine,
      id: deviceKey,
      machineId: machine?.id || machine?.machineId || null,
      deviceKey,
      displayName: machine?.name || machine?.device_name || deviceKey,
      location: machine?.location || '',
      pais: machine?.pais || machine?.country || '',
      health: machine?.health || {
        status: machine?.connection_status === 'online' || machine?.status === 'online' ? 'healthy' : 'offline',
      },
    };
  }

  function normalizeCreatePayload(input = {}) {
    const payload = {
      userId: input.userId ? Number(input.userId) : null,
      name: (input.name || '').trim(),
      deviceKey: (input.deviceKey || '').trim(),
      machineType: (input.machineType || 'HMI').trim(),
      location: (input.location || '').trim(),
      pais: (input.pais || input.country || '').trim(),
      latitude: input.latitude === '' ? null : Number(input.latitude),
      longitude: input.longitude === '' ? null : Number(input.longitude),
      description: (input.description || '').trim(),
      status: input.status || 'active',
    };

    if (!payload.userId) throw new ApiClient.ApiError('El cliente propietario es requerido.', 400);
    if (!payload.name) throw new ApiClient.ApiError('El nombre de la maquina es requerido.', 400);
    if (!payload.deviceKey) throw new ApiClient.ApiError('El deviceKey es requerido.', 400);
    if (payload.latitude !== null && !Number.isFinite(payload.latitude)) {
      throw new ApiClient.ApiError('La latitud no es valida.', 400);
    }
    if (payload.longitude !== null && !Number.isFinite(payload.longitude)) {
      throw new ApiClient.ApiError('La longitud no es valida.', 400);
    }

    return payload;
  }

  function normalizeUpdatePayload(input = {}) {
    const payload = { ...input };
    if (payload.userId !== undefined) payload.userId = Number(payload.userId);
    if (payload.name !== undefined) payload.name = (payload.name || '').trim();
    if (payload.deviceKey !== undefined) payload.deviceKey = (payload.deviceKey || '').trim();
    if (payload.machineType !== undefined) payload.machineType = (payload.machineType || '').trim();
    if (payload.location !== undefined) payload.location = (payload.location || '').trim();
    if (payload.pais !== undefined) payload.pais = (payload.pais || '').trim();
    if (payload.country !== undefined) payload.country = (payload.country || '').trim();
    if (payload.latitude !== undefined) payload.latitude = payload.latitude === '' ? null : Number(payload.latitude);
    if (payload.longitude !== undefined) payload.longitude = payload.longitude === '' ? null : Number(payload.longitude);
    if (payload.description !== undefined) payload.description = (payload.description || '').trim();
    return payload;
  }

  async function list(options = {}) {
    return MachineRepository.list(options);
  }

  async function listForTelemetry(options = {}) {
    const machines = await list(options);
    return machines.map(normalizeMachineForTelemetry).filter(machine => machine.deviceKey);
  }

  async function create(input) {
    return MachineRepository.create(normalizeCreatePayload(input));
  }

  async function update(id, input) {
    return MachineRepository.update(id, normalizeUpdatePayload(input));
  }

  async function setStatus(id, status) {
    return MachineRepository.setStatus(id, status);
  }

  async function remove(id) {
    return MachineRepository.remove(id);
  }

  async function listSensors(machineId, options = {}) {
    return MachineRepository.listSensors(machineId, options);
  }

  return {
    getDeviceKey,
    normalizeMachineForTelemetry,
    list,
    listForTelemetry,
    create,
    update,
    setStatus,
    remove,
    listSensors,
  };
})();
