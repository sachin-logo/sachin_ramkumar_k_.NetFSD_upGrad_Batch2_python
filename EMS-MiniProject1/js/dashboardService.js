const dashboardService = (function () {
  return {
    getSummary() {
      const all = employeeService.getAll();
      return {
        total:       all.length,
        active:      all.filter(e => e.status === 'Active').length,
        inactive:    all.filter(e => e.status === 'Inactive').length,
        departments: new Set(all.map(e => e.department)).size,
      };
    },

    getDepartmentBreakdown() {
      const all   = employeeService.getAll();
      const total = all.length;
      const map   = {};
      all.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
      return Object.entries(map)
        .map(([department, count]) => ({
          department,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },

    getRecentEmployees(n = 5) {
      return employeeService.getAll()
        .sort((a, b) => b.id - a.id)
        .slice(0, n);
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dashboardService };
}
