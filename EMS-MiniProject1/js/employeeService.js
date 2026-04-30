const employeeService = (function () {
  return {
    getAll() { return storageService.getAll(); },

    getById(id) { return storageService.getById(id); },

    add(data) { return storageService.add(data); },

    update(id, data) { return storageService.update(id, data); },

    remove(id) { return storageService.remove(id); },

    search(query) {
      if (!query || query.trim() === '') return storageService.getAll();
      const q = query.trim().toLowerCase();
      return storageService.getAll().filter(e => {
        const firstName  = e.firstName.toLowerCase();
        const lastName   = e.lastName.toLowerCase();
        const fullName   = firstName + ' ' + lastName;
        const emailUser  = e.email.toLowerCase().split('@')[0];
        const emailFull  = e.email.toLowerCase();
        return firstName.startsWith(q)    ||
               lastName.startsWith(q)     ||
               fullName.startsWith(q)     ||
               fullName.includes(' ' + q) ||
               emailUser.startsWith(q)    ||
               emailFull === q;
      });
    },

    filterByDepartment(dept) {
      if (!dept || dept === 'All') return storageService.getAll();
      return storageService.getAll().filter(e => e.department === dept);
    },

    filterByStatus(status) {
      if (!status || status === 'All') return storageService.getAll();
      return storageService.getAll().filter(e => e.status === status);
    },

    applyFilters(search, dept, status) {
      let results = storageService.getAll();
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        results = results.filter(e => {
          const fn        = e.firstName.toLowerCase();
          const ln        = e.lastName.toLowerCase();
          const fullName  = fn + ' ' + ln;
          const emailUser = e.email.toLowerCase().split('@')[0];
          const emailFull = e.email.toLowerCase();
          return fn.startsWith(q)           ||
                 ln.startsWith(q)           ||
                 fullName.startsWith(q)     ||
                 fullName.includes(' ' + q) ||
                 emailUser.startsWith(q)    ||
                 emailFull === q;
        });
      }
      if (dept && dept !== 'All')     results = results.filter(e => e.department === dept);
      if (status && status !== 'All') results = results.filter(e => e.status === status);
      return results;
    },

    sortBy(employees, field, direction) {
      return [...employees].sort((a, b) => {
        let vA, vB;
        if      (field === 'name')     { vA = a.lastName.toLowerCase(); vB = b.lastName.toLowerCase(); }
        else if (field === 'salary')   { vA = a.salary;                 vB = b.salary; }
        else if (field === 'joinDate') { vA = new Date(a.joinDate);     vB = new Date(b.joinDate); }
        else return 0;
        if (vA < vB) return direction === 'asc' ? -1 : 1;
        if (vA > vB) return direction === 'asc' ?  1 : -1;
        return 0;
      });
    },

    getDepartments() {
      return [...new Set(storageService.getAll().map(e => e.department))].sort();
    },

    emailExists(email, excludeId = null) {
      return storageService.getAll().some(
        e => e.email.toLowerCase() === email.toLowerCase() && e.id !== excludeId
      );
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { employeeService };
}
