/**
 * js/repository/DepartmentRepository.js
 * API access for department administration.
 */
const DepartmentRepository = (() => {
  function buildListUrl({ includeInactive } = {}) {
    return '/api/departments' + (includeInactive ? '?includeInactive=true' : '');
  }

  async function list(options = {}) {
    const data = await ApiClient.json(buildListUrl(options));
    return data?.departments || [];
  }

  async function create(payload) {
    const data = await ApiClient.json('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data?.department || null;
  }

  return {
    list,
    create,
  };
})();
