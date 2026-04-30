const storageService = (function () {
  let _store = INITIAL_EMPLOYEES.map(e => ({ ...e }));
  let _nextId = _store.length ? Math.max(..._store.map(e => e.id)) + 1 : 1;

  return {
    getAll() {
      return _store.map(e => ({ ...e }));
    },

    getById(id) {
      const emp = _store.find(e => e.id === id);
      return emp ? { ...emp } : undefined;
    },

    add(data) {
      const emp = { ...data, id: _nextId++ };
      _store.push(emp);
      return { ...emp };
    },

    update(id, data) {
      const idx = _store.findIndex(e => e.id === id);
      if (idx === -1) return null;
      _store[idx] = { ..._store[idx], ...data, id };
      return { ..._store[idx] };
    },

    remove(id) {
      const idx = _store.findIndex(e => e.id === id);
      if (idx === -1) return false;
      _store.splice(idx, 1);
      return true;
    },

    nextId() { return _nextId; },

    _reset() {
      _store = INITIAL_EMPLOYEES.map(e => ({ ...e }));
      _nextId = Math.max(..._store.map(e => e.id)) + 1;
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService };
}
