/**
 * js/controller/TelemetryController.js
 * Orquesta la pestaña Telemetría: dispositivos, etiquetas, KPIs y gráfico.
 * Depende de: AppState, TelemetryService, TelemetryView
 */
const TelemetryController = (() => {

  async function loadDevices() {
    let devices = [];
    try {
      const remote = await TelemetryService.getDeviceObjects();
      // IDs activos (con health) van primero
      const activeDevs = remote.filter(d => d.id && d.health?.status === 'healthy');
      const otherDevs  = remote.filter(d => d.id && d.health?.status !== 'healthy');
      // Consolidar IDs disponibles en backend
      const allIds = new Set([...remote.map(d => d.id).filter(Boolean)]);
      const allDevs = [...activeDevs, ...otherDevs];
      allIds.forEach(id => {
        if (!allDevs.find(d => d.id === id)) allDevs.push({ id });
      });
      devices = allDevs;

      if (!devices.length) {
        TelemetryView.populateDeviceSelector([], '');
        TelemetryView.populateVariableSelector([]);
        TelemetryView.syncTelemetryLayout([]);
        return;
      }

      // Si el actual no existe, escoger uno automático (healthy primero)
      const existsCurrent = devices.some(d => d.id === AppState.currentDevice);
      if (!existsCurrent) {
        const preferred = activeDevs[0]?.id || devices[0]?.id || '';
        AppState.defaultDevice = preferred;
        AppState.setDevice(preferred);
      }

      // Guardar mapa en estado
      const map = {};
      devices.forEach(d => { if (d.id) map[d.id] = d; });
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
        TelemetryView.updateChartHeader('Sin variables activas', '', 0);
        TelemetryView.renderTable([]);
        return;
      }

      TelemetryView.populateVariableSelector(tags);
      await Promise.all([updateKpis(), loadChartData()]);
    } catch (err) {
      TelemetryView.setConnStatus('offline');
      console.error('[TelemetryController] loadTags', err);
    }
  }

  async function updateKpis() {
    try {
      const dev = AppState.deviceMap[AppState.currentDevice];
      const isInactive = !dev || !dev.health;
      const data = await TelemetryService.getLatest(AppState.currentDevice);
      TelemetryView.updateKpiCards(data);
      if (isInactive) {
        TelemetryView.setRunningInactive();
      }
      TelemetryView.updateSidebarTime();
    } catch {}
  }

  async function loadChartData() {
    const tag   = document.getElementById('variable-selector').value;
    const range = document.getElementById('time-range-selector').value;
    if (!tag) return;

    try {
      const allRows = await TelemetryService.getHistory(AppState.currentDevice, range);
      const rows    = allRows.filter(row => row.tag_name === tag);

      TelemetryView.updateChartHeader(tag, range, rows.length);

      if (!rows.length) {
        AppState.clearChart();
        TelemetryView.renderTable([]);
        return;
      }

      TelemetryView.renderChart(rows, tag);
      TelemetryView.renderTable(rows.slice().reverse());
      TelemetryView.updateSidebarTime();
    } catch (err) {
      console.error('[TelemetryController] loadChartData', err);
    }
  }

  return { loadDevices, loadTags, updateKpis, loadChartData };
})();
