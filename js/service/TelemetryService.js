/**
 * js/service/TelemetryService.js
 * Telemetry business logic and legacy device compatibility.
 */
const TelemetryService = (() => {
  async function getHealth() {
    return TelemetryRepository.getHealth();
  }

  async function listDevices() {
    if (RoleAccessService.isClient() || RoleAccessService.isPublicClient()) {
      return MachineService.listForTelemetry();
    }

    const legacyDevices = await TelemetryRepository.listLegacyDevices();
    return legacyDevices.map(device => {
      const deviceKey = device.device_name || device.deviceKey || device.device_key || device.id;
      return {
        ...device,
        id: deviceKey,
        deviceKey,
        displayName: device.name || device.device_name || deviceKey,
        location: device.location || '',
        pais: device.pais || device.country || '',
      };
    });
  }

  async function getDeviceObjects() {
    return listDevices();
  }

  async function getSensors(deviceKey) {
    return TelemetryRepository.getSensors(deviceKey);
  }

  async function getVisibleSensors(deviceKey) {
    let tags = await getSensors(deviceKey);
    tags = Helpers.filterVisibleVariableTags(tags);

    if (!tags.length) {
      const data = await getLatest(deviceKey);
      tags = Helpers.filterVisibleVariableTags(Object.keys(data));
    }

    return tags;
  }

  async function getLatest(deviceKey) {
    return TelemetryRepository.getLatest(deviceKey);
  }

  async function getHistory(deviceKey, range) {
    return TelemetryRepository.getHistory(deviceKey, range);
  }

  async function addLegacyDevice(deviceId) {
    return TelemetryRepository.addLegacyDevice(deviceId);
  }

  return {
    getHealth,
    listDevices,
    getDeviceObjects,
    getSensors,
    getVisibleSensors,
    getLatest,
    getHistory,
    addLegacyDevice,
  };
})();
