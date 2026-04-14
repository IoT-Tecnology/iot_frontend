/**
 * js/repository/UserRepository.js
 * API access for user/client administration.
 */
const UserRepository = (() => {
  function buildListUrl({ includeInactive } = {}) {
    return '/api/users' + (includeInactive ? '?includeInactive=true' : '');
  }

  async function list(options = {}) {
    const data = await ApiClient.json(buildListUrl(options));
    return data?.users || [];
  }

  async function create(payload) {
    const data = await ApiClient.json('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data?.user || null;
  }

  async function update(id, payload) {
    const data = await ApiClient.json('/api/users/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data?.user || data || null;
  }

  async function setStatus(id, status) {
    const data = await ApiClient.json('/api/users/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return data?.user || data || null;
  }

  async function remove(id) {
    return ApiClient.json('/api/users/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  return {
    list,
    create,
    update,
    setStatus,
    remove,
  };
})();
