/**
 * js/controller/AppControllerRuntime.js
 * Punto de entrada privado de la app autenticada.
 */
const AppController = (() => {
  let bootstrapped = false;
  let healthIntervalId = null;

  const TAB_META = {
    telemetry: { title: 'Telemetria', subtitle: 'Datos continuos de proceso' },
    audit: { title: 'Auditoria', subtitle: 'Historial de configuracion y alarmas' },
  };

  function setupTabs() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');

        const meta = TAB_META[tab] || {};
        document.getElementById('page-title').textContent = meta.title || '';
        document.getElementById('page-subtitle').textContent = meta.subtitle || '';

        if (tab === 'audit') {
          AuditController.refresh();
        }
      });
    });
  }

  function setupEventListeners() {
    document.getElementById('device-selector').addEventListener('change', async event => {
      AppState.setDevice(event.target.value);
      document.getElementById('sidebar-device-id').textContent = AppState.currentDevice || '—';
      updateSidebarForDevice(AppState.currentDevice);
      await TelemetryController.loadTags();
    });

    document.getElementById('load-data-btn').addEventListener('click', () => TelemetryController.loadChartData());
    document.getElementById('variable-selector').addEventListener('change', () => TelemetryController.loadChartData());
    document.getElementById('time-range-selector').addEventListener('change', () => TelemetryController.loadChartData());
    document.getElementById('load-events-btn').addEventListener('click', () => AuditController.refresh());
    document.getElementById('refresh-audit-btn').addEventListener('click', () => AuditController.refresh());

    document.getElementById('add-device-btn').addEventListener('click', async () => {
      const input = document.getElementById('new-device-id');
      const newId = input.value.trim();
      if (!newId) return;

      try {
        await ApiService.addDevice(newId);
        input.value = '';
        AppState.setDevice(newId);
        await TelemetryController.loadDevices();
      } catch (error) {
        console.error('[AppController] addDevice', error);
      }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await AuthService.logout();
      await leavePrivateApp();
      window.dispatchEvent(new CustomEvent('auth:required', {
        detail: {
          reason: 'logout',
          message: 'La sesion se cerro correctamente.',
        },
      }));
    });
  }

  async function checkHealth() {
    if (!AuthService.getToken()) return;

    try {
      const ok = await ApiService.getHealth();
      if (!ok) {
        TelemetryView.setConnStatus('offline');
        return;
      }

      await refreshDeviceHealth();
    } catch {
      TelemetryView.setConnStatus('offline');
    }
  }

  async function refreshDeviceHealth() {
    try {
      const devices = await ApiService.getDeviceObjects();
      const map = {};
      devices.forEach(device => {
        if (device.id) map[device.id] = device;
      });
      AppState.setDeviceMap(map);
      TelemetryView.refreshDeviceLabels(map);
      updateSidebarForDevice(AppState.currentDevice);
    } catch {}
  }

  function updateSidebarForDevice(deviceId) {
    const device = AppState.deviceMap[deviceId];
    if (!device) {
      TelemetryView.setConnStatus('offline');
      TelemetryView.setRunningInactive();
      return;
    }

    if (device.health?.status === 'healthy') {
      TelemetryView.setConnStatus('online');
      return;
    }

    TelemetryView.setConnStatus(device.status === 'online' ? 'loading' : 'offline');
    TelemetryView.setRunningInactive();
  }

  function startHealthPolling() {
    if (healthIntervalId) return;
    healthIntervalId = window.setInterval(checkHealth, 8000);
  }

  function stopHealthPolling() {
    if (!healthIntervalId) return;
    window.clearInterval(healthIntervalId);
    healthIntervalId = null;
  }

  function resetPrivateView() {
    stopHealthPolling();
    AppState.defaultDevice = '';
    AppState.currentDevice = '';
    AppState.setTags([]);
    AppState.setDeviceMap({});
    AppState.clearChart();

    TelemetryView.setConnStatus('offline');
    TelemetryView.populateDeviceSelector([], '');
    TelemetryView.populateVariableSelector([]);
    TelemetryView.syncTelemetryLayout([]);
    TelemetryView.updateKpiCards({});
    TelemetryView.setRunningInactive();
    TelemetryView.updateChartHeader('Serie temporal', '', 0);
    TelemetryView.renderTable([]);

    AuditView.setSummaryLoading();
    AuditView.setEventsLoading();

    document.getElementById('sidebar-user-email').textContent = '—';
    document.getElementById('sidebar-device-id').textContent = '—';
    document.getElementById('sidebar-last-update').textContent = '—';
  }

  function bootstrap() {
    if (bootstrapped) return;
    bootstrapped = true;
    setupTabs();
    setupEventListeners();
  }

  async function enterPrivateApp() {
    bootstrap();
    document.getElementById('sidebar-user-email').textContent = AppState.currentUser?.email || '—';
    await checkHealth();
    await TelemetryController.loadDevices();
    startHealthPolling();
  }

  async function leavePrivateApp() {
    resetPrivateView();
  }

  function init() {
    bootstrap();
  }

  return { init, enterPrivateApp, leavePrivateApp };
})();
