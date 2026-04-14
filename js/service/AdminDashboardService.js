/**
 * js/service/AdminDashboardService.js
 * Aggregates admin domain data for future admin views.
 */
const AdminDashboardService = (() => {
  async function loadAll({ includeInactive = false } = {}) {
    if (!RoleAccessService.canViewAdmin()) {
      throw new ApiClient.ApiError('Permisos insuficientes para administracion.', 403);
    }

    const [departments, users, machines] = await Promise.all([
      DepartmentService.list({ includeInactive }),
      UserService.list({ includeInactive }),
      MachineService.list({ includeInactive }),
    ]);

    return {
      departments,
      users,
      machines: machines.map(machine => ({
        ...machine,
        deviceKey: MachineService.getDeviceKey(machine),
      })),
    };
  }

  return {
    loadAll,
  };
})();
