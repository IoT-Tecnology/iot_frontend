/**
 * js/service/PublicService.js
 * Normalizes public machine data for secure map rendering.
 */
const PublicService = (() => {
  function pickNumber(...values) {
    for (const value of values) {
      const num = Number(value);
      if (Number.isFinite(num)) return num;
    }
    return null;
  }

  function pickText(...values) {
    for (const value of values) {
      if (value === null || value === undefined) continue;
      const text = String(value).trim();
      if (text) return text;
    }
    return '';
  }

  function pickProductsPerHour(machine = {}) {
    const productsPerHour = pickNumber(
      machine.products_per_hour,
      machine.productsPerHour,
      machine.metrics?.products_per_hour,
      machine.metrics?.productsPerHour
    );

    return productsPerHour === null ? null : productsPerHour;
  }

  function normalizeMachine(machine = {}, index = 0) {
    const latitude = pickNumber(machine.latitude, machine.lat, machine.coordinates?.lat, machine.location?.lat);
    const longitude = pickNumber(
      machine.longitude,
      machine.lng,
      machine.lon,
      machine.coordinates?.lng,
      machine.coordinates?.lon,
      machine.location?.lng,
      machine.location?.lon
    );

    if (latitude === null || longitude === null) return null;

    const name = pickText(machine.name, machine.displayName, machine.machine_name)
      || I18nService.t('public.machineWithoutName');
    const description = pickText(machine.description, machine.summary, machine.machine_description)
      || I18nService.t('public.machineWithoutDescription');

    return {
      id: pickText(machine.id, machine.machineId, machine.deviceKey, machine.device_key) || 'public-machine-' + index,
      name,
      description,
      latitude,
      longitude,
      productsPerHour: pickProductsPerHour(machine),
      status: pickText(machine.status, machine.machine_status, machine.visibility_status) || '',
    };
  }

  async function listMachinesForMap() {
    const machines = await PublicRepository.listMachinesForMap();
    return machines
      .map(normalizeMachine)
      .filter(Boolean);
  }

  return {
    normalizeMachine,
    listMachinesForMap,
  };
})();
