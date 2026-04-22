/**
 * js/repository/PublicRepository.js
 * Public API access without authenticated session.
 */
const PublicRepository = (() => {
  async function listMachinesForMap() {
    const data = await ApiClient.json('/api/public/machines/map', {}, {
      requiresAuth: false,
    });

    return data?.machines || data?.items || data?.data || [];
  }

  return {
    listMachinesForMap,
  };
})();
