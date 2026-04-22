/**
 * js/service/RoleAccessService.js
 * Role and navigation policy for the private app.
 */
const RoleAccessService = (() => {
  const ROLES = {
    SUPERADMIN: 'superadmin',
    CLIENT: 'client',
  };

  function getRole(user = AppState.currentUser) {
    return user?.role || '';
  }

  function isSuperadmin(user = AppState.currentUser) {
    return getRole(user) === ROLES.SUPERADMIN;
  }

  function isClient(user = AppState.currentUser) {
    return getRole(user) === ROLES.CLIENT;
  }

  function getAllowedTabs(user = AppState.currentUser) {
    if (isSuperadmin(user)) return ['telemetry', 'audit', 'admin'];
    if (isClient(user)) return ['telemetry', 'audit'];
    return ['telemetry'];
  }

  function canViewAudit(user = AppState.currentUser) {
    return getAllowedTabs(user).includes('audit');
  }

  function canViewAdmin(user = AppState.currentUser) {
    return getAllowedTabs(user).includes('admin');
  }

  return {
    ROLES,
    getRole,
    isSuperadmin,
    isClient,
    getAllowedTabs,
    canViewAudit,
    canViewAdmin,
  };
})();
