/**
 * js/controller/AdminController.js
 * Wires administration UI events to domain services.
 */
const AdminController = (() => {
  let eventsBound = false;
  let hasLoaded = false;

  function showError(target, error, fallback) {
    AdminView.setMessage(target, error?.message || fallback, 'err');
    console.error('[AdminController]', error);
  }

  async function refresh() {
    if (!RoleAccessService.canViewAdmin()) return;

    try {
      AdminView.setLoading();
      const data = await AdminDashboardService.loadAll({ includeInactive: true });
      AdminView.renderDashboard(data);
      hasLoaded = true;
    } catch (error) {
      showError('admin-global-message', error, 'No fue posible cargar administracion.');
    }
  }

  async function handleDepartmentSubmit(event) {
    event.preventDefault();
    try {
      AdminView.setMessage('admin-department-message', 'Creando departamento...');
      await DepartmentService.create(AdminView.getDepartmentFormData());
      AdminView.resetDepartmentForm();
      AdminView.setMessage('admin-department-message', 'Departamento guardado.', 'ok');
      await refresh();
    } catch (error) {
      showError('admin-department-message', error, 'No fue posible crear el departamento.');
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    try {
      AdminView.setMessage('admin-user-message', 'Creando cliente...');
      await UserService.createClient(AdminView.getUserFormData());
      AdminView.resetUserForm();
      AdminView.setMessage('admin-user-message', 'Cliente guardado.', 'ok');
      await refresh();
    } catch (error) {
      showError('admin-user-message', error, 'No fue posible crear el cliente.');
    }
  }

  async function handleMachineSubmit(event) {
    event.preventDefault();
    try {
      AdminView.setMessage('admin-machine-message', 'Creando maquina...');
      await MachineService.create(AdminView.getMachineFormData());
      AdminView.resetMachineForm();
      AdminView.setMessage('admin-machine-message', 'Maquina guardada.', 'ok');
      await refresh();
    } catch (error) {
      showError('admin-machine-message', error, 'No fue posible crear la maquina.');
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
        AdminView.setMessage('admin-machine-message', 'Cargando variables...');
        const sensors = await MachineService.listSensors(id, { includeInactive: true });
        AdminView.renderMachineSensors(sensors);
        AdminView.setMessage('admin-machine-message', '');
      }
    } catch (error) {
      showError('admin-global-message', error, 'No fue posible completar la accion.');
    }
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.getElementById('admin-department-form')?.addEventListener('submit', handleDepartmentSubmit);
    document.getElementById('admin-user-form')?.addEventListener('submit', handleUserSubmit);
    document.getElementById('admin-machine-form')?.addEventListener('submit', handleMachineSubmit);
    document.getElementById('tab-admin')?.addEventListener('click', handleAdminAction);
  }

  async function activate() {
    bindEvents();
    if (!hasLoaded) await refresh();
  }

  function reset() {
    hasLoaded = false;
    AdminView.setMessage('admin-global-message', '');
  }

  return {
    bindEvents,
    activate,
    refresh,
    reset,
  };
})();
