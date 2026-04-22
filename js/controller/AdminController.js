/**
 * js/controller/AdminController.js
 * Wires administration UI events to domain services.
 */
const AdminController = (() => {
  let eventsBound = false;
  let hasLoaded = false;
  let editingMachineId = null;
  let cachedMachines = [];

  function t(key, params = {}, fallback = '') {
    return I18nService.t(key, params, fallback);
  }

  function showError(target, error, fallbackKey) {
    AdminView.setMessage(target, error?.message || t(fallbackKey), 'err');
    console.error('[AdminController]', error);
  }

  async function refresh() {
    if (!RoleAccessService.canViewAdmin()) return;

    try {
      AdminView.setLoading();
      const data = await AdminDashboardService.loadAll({ includeInactive: true });
      cachedMachines = data.machines || [];
      AdminView.renderDashboard(data);
      hasLoaded = true;
    } catch (error) {
      showError('admin-global-message', error, 'admin.loadAdminError');
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    try {
      AdminView.setMessage('admin-user-message', t('admin.createClientLoading'));
      await UserService.createClient(AdminView.getUserFormData());
      AdminView.resetUserForm();
      AdminView.setMessage('admin-user-message', t('admin.createClientSuccess'), 'ok');
      await refresh();
    } catch (error) {
      showError('admin-user-message', error, 'admin.createClientError');
    }
  }

  async function handleMachineSubmit(event) {
    event.preventDefault();
    try {
      AdminView.setMessage('admin-machine-message', t('admin.createMachineLoading'));
      const payload = AdminView.getMachineFormData();
      if (editingMachineId) {
        AdminView.setMessage('admin-machine-message', t('admin.saveMachineLoading'));
        await MachineService.update(editingMachineId, payload);
        editingMachineId = null;
      } else {
        await MachineService.create(payload);
      }
      AdminView.resetMachineForm();
      AdminView.setMessage('admin-machine-message', t('admin.createMachineSuccess'), 'ok');
      await refresh();
    } catch (error) {
      showError('admin-machine-message', error, 'admin.createMachineError');
    }
  }

  async function handleAdminAction(event) {
    const button = event.target.closest('[data-admin-action]');
    if (!button) return;

    const action = button.dataset.adminAction;
    const id = button.dataset.id;

    try {
      if (action === 'toggle-user') {
        await UserService.setStatus(id, button.dataset.status);
        await refresh();
      }

      if (action === 'toggle-machine') {
        await MachineService.setStatus(id, button.dataset.status);
        await refresh();
        await TelemetryController.loadDevices();
      }

      if (action === 'show-sensors') {
        AdminView.setMessage('admin-machine-message', t('admin.loadingSensors'));
        const sensors = await MachineService.listSensors(id, { includeInactive: true });
        AdminView.renderMachineSensors(sensors);
        AdminView.setMessage('admin-machine-message', '');
      }

      if (action === 'locate-machine') {
        const machine = cachedMachines.find(item => String(item.id) === String(id));
        if (!machine) return;
        editingMachineId = id;
        AdminView.fillMachineForm(machine);
        AdminView.setMessage('admin-machine-message', t('admin.locateMachineMessage'));
      }
    } catch (error) {
      showError('admin-global-message', error, 'admin.completeActionError');
    }
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.getElementById('admin-user-form')?.addEventListener('submit', handleUserSubmit);
    document.getElementById('admin-machine-form')?.addEventListener('submit', handleMachineSubmit);
    document.getElementById('tab-admin')?.addEventListener('click', handleAdminAction);
  }

  async function activate() {
    bindEvents();
    AdminView.initMachineLocationPicker();
    if (!hasLoaded) await refresh();
  }

  function reset() {
    hasLoaded = false;
    editingMachineId = null;
    cachedMachines = [];
    AdminView.setMessage('admin-global-message', '');
    AdminView.resetMachineForm();
  }

  return {
    bindEvents,
    activate,
    refresh,
    reset,
  };
})();
