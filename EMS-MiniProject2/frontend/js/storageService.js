// storageService.js — REPLACED in Mini Project 2
// All methods now make real fetch() calls to the .NET 8 API.
// The public interface (getAll, getById, add, update, remove) is IDENTICAL
// to Mini Project 1, so all upstream services require zero changes.

const storageService = (function () {

  // ── Private: build auth headers ──────────────────────────────────────────
  function _headers(withAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth) {
      const token = AuthService.getToken?.();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ── Private: handle API response ─────────────────────────────────────────
  async function _handleResponse(res) {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err  = new Error(body.message || body.title || `HTTP ${res.status}`);
      err.status = res.status;
      err.body   = body;
      throw err;
    }
    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
  }

  return {
    // GET /api/employees  (paginated)
    async getAll(queryParams = {}) {
      const params = new URLSearchParams();
      if (queryParams.search)     params.set('search',     queryParams.search);
      if (queryParams.department) params.set('department', queryParams.department);
      if (queryParams.status)     params.set('status',     queryParams.status);
      if (queryParams.sortBy)     params.set('sortBy',     queryParams.sortBy);
      if (queryParams.sortDir)    params.set('sortDir',    queryParams.sortDir);
      if (queryParams.page)       params.set('page',       queryParams.page);
      if (queryParams.pageSize)   params.set('pageSize',   queryParams.pageSize);

      const url = `${API_BASE_URL}/employees?${params.toString()}`;
      const res = await fetch(url, { headers: _headers() });
      return _handleResponse(res);  // returns PagedResult envelope
    },

    // GET /api/employees/:id
    async getById(id) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, { headers: _headers() });
      return _handleResponse(res);
    },

    // POST /api/employees
    async add(data) {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method:  'POST',
        headers: _headers(),
        body:    JSON.stringify(data),
      });
      return _handleResponse(res);
    },

    // PUT /api/employees/:id
    async update(id, data) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method:  'PUT',
        headers: _headers(),
        body:    JSON.stringify(data),
      });
      return _handleResponse(res);
    },

    // DELETE /api/employees/:id
    async remove(id) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method:  'DELETE',
        headers: _headers(),
      });
      return _handleResponse(res);
    },

    // POST /api/auth/login
    async login(credentials) {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      });
      return _handleResponse(res);
    },

    // POST /api/auth/register
    async register(data) {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      return _handleResponse(res);
    },

    // GET /api/employees/dashboard
    async getDashboard() {
      const res = await fetch(`${API_BASE_URL}/employees/dashboard`, { headers: _headers() });
      return _handleResponse(res);
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService };
}
