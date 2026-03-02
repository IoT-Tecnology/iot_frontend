/**
 * js/controller/AppController.js
 * Punto de entrada. Gestiona tabs, salud del backend y cambios de dispositivo.
 * Depende de: AppState, ApiService, TelemetryView,
 *             TelemetryController, AuditController
 */
const AppController = (() => {

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const TAB_META = {
    telemetry: { title: 'Telemetría',  subtitle: 'Datos continuos de proceso' },
    audit:     { title: 'Auditoría',   subtitle: 'Historial de configuración y alarmas' },
  };

  function setupTabs() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');

        const meta = TAB_META[tab] || {};
        document.getElementById('page-title').textContent    = meta.title    || '';
        document.getElementById('page-subtitle').textContent = meta.subtitle || '';

        if (tab === 'audit') AuditController.refresh();
      });
    });
  }

  // ── Event listeners ──────────────────────────────────────────────────────────
  function setupEventListeners() {
    document.getElementById('device-selector').addEventListener('change', async e => {
      AppState.setDevice(e.target.value);
      document.getElementById('sidebar-device-id').textContent = AppState.currentDevice;
      await TelemetryController.loadTags();
    });

    document.getElementById('load-data-btn').addEventListener('click',
      () => TelemetryController.loadChartData());

    document.getElementById('variable-selector').addEventListener('change',
      () => TelemetryController.loadChartData());

    document.getElementById('time-range-selector').addEventListener('change',
      () => TelemetryController.loadChartData());

    document.getElementById('load-events-btn').addEventListener('click',
      () => AuditController.refresh());

    document.getElementById('refresh-audit-btn').addEventListener('click',
      () => AuditController.refresh());
  }

  // ── Health polling ────────────────────────────────────────────────────────────
  async function checkHealth() {
    try {
      const ok = await ApiService.getHealth();
      TelemetryView.setConnStatus(ok ? 'online' : 'offline');
    } catch {
      TelemetryView.setConnStatus('offline');
    }
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  function init() {
    setupTabs();
    setupEventListeners();
    checkHealth();
    TelemetryController.loadDevices();
    setInterval(checkHealth, 8000);
  }

  return { init };
})();

// ── Arranque ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => AppController.init());
