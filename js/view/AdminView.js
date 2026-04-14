/**
 * js/view/AdminView.js
 * Renders administration UI. No API calls here.
 */
const AdminView = (() => {
  function el(id) {
    return document.getElementById(id);
  }

  function setMessage(targetId, message = '', type = '') {
    const target = el(targetId);
    if (!target) return;
    target.textContent = message;
    target.className = 'admin-message' + (type ? ' ' + type : '');
  }

  function getDepartmentFormData() {
    return {
      name: el('admin-department-name')?.value || '',
    };
  }

  function getUserFormData() {
    return {
      name: el('admin-user-name')?.value || '',
      email: el('admin-user-email')?.value || '',
      password: el('admin-user-password')?.value || '',
      address: el('admin-user-address')?.value || '',
      departmentId: el('admin-user-department')?.value || '',
      role: el('admin-user-role')?.value || 'client',
      status: el('admin-user-status')?.value || 'active',
    };
  }

  function getMachineFormData() {
    return {
      userId: el('admin-machine-user')?.value || '',
      name: el('admin-machine-name')?.value || '',
      deviceKey: el('admin-machine-device-key')?.value || '',
      machineType: el('admin-machine-type')?.value || 'HMI',
      location: el('admin-machine-location')?.value || '',
      description: el('admin-machine-description')?.value || '',
      status: el('admin-machine-status')?.value || 'active',
    };
  }

  function resetDepartmentForm() {
    el('admin-department-form')?.reset();
  }

  function resetUserForm() {
    el('admin-user-form')?.reset();
  }

  function resetMachineForm() {
    el('admin-machine-form')?.reset();
  }

  function setLoading() {
    const rows = '<tr><td colspan="6" class="empty-row">Cargando...</td></tr>';
    if (el('admin-departments-body')) el('admin-departments-body').innerHTML = '<tr><td colspan="3" class="empty-row">Cargando...</td></tr>';
    if (el('admin-users-body')) el('admin-users-body').innerHTML = rows;
    if (el('admin-machines-body')) el('admin-machines-body').innerHTML = rows;
  }

  function renderDepartmentOptions(departments) {
    const options = ['<option value="">Selecciona departamento</option>']
      .concat(departments.map(department =>
        '<option value="' + Helpers.escapeHtml(department.id) + '">' +
          Helpers.escapeHtml(department.name) +
        '</option>'
      ));
    if (el('admin-user-department')) el('admin-user-department').innerHTML = options.join('');
  }

  function renderUserOptions(users) {
    const clients = users.filter(user => ['client', 'public_client'].includes(user.role));
    const options = ['<option value="">Selecciona cliente</option>']
      .concat(clients.map(user =>
        '<option value="' + Helpers.escapeHtml(user.id) + '">' +
          Helpers.escapeHtml(user.name || user.username || user.email) +
        '</option>'
      ));
    if (el('admin-machine-user')) el('admin-machine-user').innerHTML = options.join('');
  }

  function renderDepartments(departments) {
    const tbody = el('admin-departments-body');
    if (!tbody) return;

    if (!departments.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-row">Sin departamentos registrados</td></tr>';
      return;
    }

    tbody.innerHTML = departments.map(department =>
      '<tr>' +
        '<td>' + Helpers.escapeHtml(department.id) + '</td>' +
        '<td>' + Helpers.escapeHtml(department.name) + '</td>' +
        '<td><span class="status-pill status-' + Helpers.escapeHtml(department.status || 'active') + '">' +
          Helpers.escapeHtml(department.status || 'active') +
        '</span></td>' +
      '</tr>'
    ).join('');
  }

  function renderUsers(users) {
    const tbody = el('admin-users-body');
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Sin clientes registrados</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => {
      const status = user.status || (user.isActive ? 'active' : 'inactive');
      const nextStatus = status === 'active' ? 'inactive' : 'active';
      return (
        '<tr>' +
          '<td>' + Helpers.escapeHtml(user.name || user.username || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(user.email || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(user.departmentName || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(user.role || '—') + '</td>' +
          '<td><span class="status-pill status-' + Helpers.escapeHtml(status) + '">' + Helpers.escapeHtml(status) + '</span></td>' +
          '<td><button type="button" class="btn-ghost btn-sm" data-admin-action="toggle-user" ' +
            'data-id="' + Helpers.escapeHtml(user.id) + '" data-status="' + Helpers.escapeHtml(nextStatus) + '">' +
            (nextStatus === 'active' ? 'Activar' : 'Inactivar') +
          '</button></td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderMachines(machines) {
    const tbody = el('admin-machines-body');
    if (!tbody) return;

    if (!machines.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Sin maquinas registradas</td></tr>';
      return;
    }

    tbody.innerHTML = machines.map(machine => {
      const status = machine.status || (machine.is_active ? 'active' : 'inactive');
      const nextStatus = status === 'active' ? 'inactive' : 'active';
      const deviceKey = machine.deviceKey || machine.device_key || machine.device_name || '';
      return (
        '<tr>' +
          '<td>' + Helpers.escapeHtml(machine.name || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(deviceKey || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(machine.user_name || machine.ownerName || machine.user_id || '—') + '</td>' +
          '<td>' + Helpers.escapeHtml(machine.location || '—') + '</td>' +
          '<td><span class="status-pill status-' + Helpers.escapeHtml(status) + '">' + Helpers.escapeHtml(status) + '</span></td>' +
          '<td class="admin-actions">' +
            '<button type="button" class="btn-ghost btn-sm" data-admin-action="toggle-machine" ' +
              'data-id="' + Helpers.escapeHtml(machine.id) + '" data-status="' + Helpers.escapeHtml(nextStatus) + '">' +
              (nextStatus === 'active' ? 'Activar' : 'Inactivar') +
            '</button>' +
            '<button type="button" class="btn-ghost btn-sm" data-admin-action="show-sensors" ' +
              'data-id="' + Helpers.escapeHtml(machine.id) + '">Variables</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderMachineSensors(sensors) {
    const target = el('admin-machine-sensors');
    if (!target) return;

    if (!sensors.length) {
      target.innerHTML = '<div class="summary-empty">Sin variables registradas para esta maquina</div>';
      return;
    }

    target.innerHTML = sensors.map(sensor => {
      const name = sensor.tag_name || sensor.name || sensor.variable_name || sensor;
      const unit = sensor.engineering_unit || sensor.unit || '';
      return (
        '<span class="sensor-chip">' +
          Helpers.escapeHtml(name) +
          (unit ? '<small>' + Helpers.escapeHtml(unit) + '</small>' : '') +
        '</span>'
      );
    }).join('');
  }

  function renderDashboard({ departments, users, machines }) {
    renderDepartmentOptions(departments);
    renderUserOptions(users);
    renderDepartments(departments);
    renderUsers(users);
    renderMachines(machines);
  }

  return {
    setMessage,
    setLoading,
    getDepartmentFormData,
    getUserFormData,
    getMachineFormData,
    resetDepartmentForm,
    resetUserForm,
    resetMachineForm,
    renderDashboard,
    renderMachineSensors,
  };
})();
