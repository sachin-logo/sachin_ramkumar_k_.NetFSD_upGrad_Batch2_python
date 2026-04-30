// dashboardService.js — UPDATED in Mini Project 2
// getSummary() now calls /api/employees/dashboard — single API call
// returns KPIs, department breakdown, and recent employees together.

const dashboardService = (function () {
  return {
    // Returns full dashboard DTO from API
    async getSummary() {
      return storageService.getDashboard();
    },

    // Kept for backward compat — data now arrives from getSummary()
    getDepartmentBreakdown() { return []; },
    getRecentEmployees()     { return []; },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dashboardService };
}
