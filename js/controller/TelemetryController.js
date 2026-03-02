/**
 * js/controller/TelemetryController.js
 * Orquesta la pestaña Telemetría: dispositivos, etiquetas, KPIs y gráfico.
 * Depende de: AppState, ApiService, TelemetryView
 */
const TelemetryController = (() => {

  async function loadDevices() {
    let ids = [AppState.defaultDevice];
    try {
      const remote = await ApiService.getDevices();
      ids = Array.from(new Set([AppState.defaultDevice, ...remote]));
    } catch {}
    TelemetryView.populateDeviceSelector(ids, AppState.currentDevice);
    await loadTags();
  }

  async function loadTags() {
    try {
      let tags = await ApiService.getSensors(AppState.currentDevice);
      tags = tags.filter(t => t.startsWith('telemetry_'));

      // Fallback: derivar etiquetas del endpoint /latest
      if (!tags.length) {
        const data = await ApiService.getLatest(AppState.currentDevice);
        tags = Object.keys(data).filter(t => t.startsWith('telemetry_'));
      }

      AppState.setTags(tags);

      if (!tags.length) {
        TelemetryView.populateVariableSelector([]);
        TelemetryView.updateKpiCards({});
        return;
      }

      TelemetryView.populateVariableSelector(tags);
      TelemetryView.setConnStatus('online');
      await Promise.all([updateKpis(), loadChartData()]);
    } catch (err) {
      TelemetryView.setConnStatus('offline');
      console.error('[TelemetryController] loadTags', err);
    }
  }

  async function updateKpis() {
    try {
      const data = await ApiService.getLatest(AppState.currentDevice);
      TelemetryView.updateKpiCards(data);
      TelemetryView.updateSidebarTime();
    } catch {}
  }

  async function loadChartData() {
    const tag   = document.getElementById('variable-selector').value;
    const range = document.getElementById('time-range-selector').value;
    if (!tag) return;

    try {
      const allRows = await ApiService.getHistory(AppState.currentDevice, range);
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
