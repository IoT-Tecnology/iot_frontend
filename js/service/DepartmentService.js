/**
 * js/service/DepartmentService.js
 * Business logic for department administration.
 */
const DepartmentService = (() => {
  function normalizePayload(input = {}) {
    const name = (input.name || '').trim();
    if (!name) {
      throw new ApiClient.ApiError('El nombre del departamento es requerido.', 400);
    }
    return { name };
  }

  async function list(options = {}) {
    return DepartmentRepository.list(options);
  }

  async function create(input) {
    return DepartmentRepository.create(normalizePayload(input));
  }

  return {
    list,
    create,
  };
})();
