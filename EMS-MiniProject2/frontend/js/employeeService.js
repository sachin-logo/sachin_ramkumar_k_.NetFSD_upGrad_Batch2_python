// employeeService.js — UPDATED in Mini Project 2
// All methods are now async/await delegates to storageService.
// applyFilters() is REMOVED — filtering/sorting now happen server-side.

const employeeService = (function () {
  return {
    // Returns PagedResult envelope from API
    async getAll(queryParams = {}) {
      return storageService.getAll(queryParams);
    },

    async getById(id) {
      return storageService.getById(id);
    },

    async add(data) {
      return storageService.add(data);
    },

    async update(id, data) {
      return storageService.update(id, data);
    },

    async remove(id) {
      return storageService.remove(id);
    },

    // email uniqueness is now checked server-side (409 Conflict)
    // kept as no-op so validationService.js doesn't break
    emailExists(email, excludeId = null) {
      return false;
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { employeeService };
}
