/**
 * js/controller/TelemetryController.js
 * Coordinates devices, KPIs and chart data.
 */
const TelemetryController = (() => {
  async function loadDevices() {
    let devices = [];
    try {
      const remote = await TelemetryService.getDeviceObjects();
      const activeDevices = remote.filter(device => device.id && device.health?.status === 'healthy');
      const otherDevices = remote.filter(device => device.id && device.health?.status !== 'healthy');
      const allIds = new Set([...remote.map(device => device.id).filter(Boolean)]);
      const allDevices = [...activeDevices, ...otherDevices];
      allIds.forEach(id => {
        if (!allDevices.find(device => device.id === id)) allDevices.push({ id });
      });
      devices = allDevices;

      if (!devices.length) {
        TelemetryView.populateDeviceSelector([], '');
        TelemetryView.populateVariableSelector([]);
        TelemetryView.syncTelemetryLayout([]);
        return;
      }

      const existsCurrent = devices.some(device => device.id === AppState.currentDevice);
      if (!existsCurrent) {
        const preferred = activeDevices[0]?.id || devices[0]?.id || '';
        AppState.defaultDevice = preferred;
        AppState.setDevice(preferred);
      }

      const map = {};
      devices.forEach(device => {
        if (device.id) map[device.id] = device;
      });
      AppState.setDeviceMap(map);
    } catch {}

    TelemetryView.populateDeviceSelector(devices, AppState.currentDevice);
    await loadTags();
  }

  async function loadTags() {
    try {
      const tags = await TelemetryService.getVisibleSensors(AppState.currentDevice);

      AppState.setTags(tags);
      TelemetryView.syncTelemetryLayout(tags);

      if (!tags.length) {
        TelemetryView.populateVariableSelector([]);
        TelemetryView.updateKpiCards({});
        AppState.clearChart();
        TelemetryView.updateChartHeader(I18nService.t('telemetry.inactiveVariables'), '', 0);
        TelemetryView.renderTable([]);
        return;
      }

      TelemetryView.populateVariableSelector(tags);
      await Promise.all([updateKpis(), loadChartData()]);
    } catch (error) {
      TelemetryView.setConnStatus('offline');
      console.error('[TelemetryController] loadTags', error);
    }
  }

  async function updateKpis() {
    try {
      const device = AppState.deviceMap[AppState.currentDevice];
      const isInactive = !device || !device.health;
      const data = await TelemetryService.getLatest(AppState.currentDevice);
      TelemetryView.updateKpiCards(data);
      if (isInactive) TelemetryView.setRunningInactive();
      TelemetryView.updateSidebarTime();
    } catch {}
  }

  async function loadChartData() {
    const tag = document.getElementById('variable-selector').value;
    const range = document.getElementById('time-range-selector').value;
    if (!tag) return;

    try {
      const allRows = await TelemetryService.getHistory(AppState.currentDevice, range);
      const rows = allRows.filter(row => row.tag_name === tag);

      const rangeLabelMap = {
        '1min': I18nService.t('telemetry.timeRange1Min'),
        '5min': I18nService.t('telemetry.timeRange5Min'),
        '10min': I18nService.t('telemetry.timeRange10Min'),
        '1hour': I18nService.t('telemetry.timeRange1Hour'),
      };

      TelemetryView.updateChartHeader(tag, rangeLabelMap[range] || range, rows.length);

      if (!rows.length) {
        AppState.clearChart();
        TelemetryView.renderTable([]);
        return;
      }

      TelemetryView.renderChart(rows, tag);
      TelemetryView.renderTable(rows.slice().reverse());
      TelemetryView.updateSidebarTime();
    } catch (error) {
      console.error('[TelemetryController] loadChartData', error);
    }
  }

  return { loadDevices, loadTags, updateKpis, loadChartData };
})();
