// authService.js — UPDATED in Mini Project 2
// login() and signup() now call real API endpoints.
// JWT token and role stored in-memory (never localStorage — XSS risk).
// Exposes getToken() so storageService can attach Authorization: Bearer header.

const AuthService = (function () {
  let _session = null;  // { username, role, token }

  return {
    // Called by app.js on signup form submit
    async signup(username, password, role = 'Viewer') {
      try {
        const result = await storageService.register({ username, password, role });
        return { success: true, data: result };
      } catch (err) {
        if (err.status === 409) {
          return { success: false, errors: { username: err.message || 'Username already taken.' } };
        }
        return { success: false, errors: { username: err.message || 'Registration failed.' } };
      }
    },

    // Called by app.js on login form submit
    async login(username, password) {
      try {
        const result = await storageService.login({ username, password });
        _session = { username: result.username, role: result.role, token: result.token };
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Invalid credentials. Please try again.' };
      }
    },

    logout() {
      _session = null;
    },

    isLoggedIn()     { return _session !== null; },
    getCurrentUser() { return _session?.username ?? null; },
    getRole()        { return _session?.role ?? null; },
    isAdmin()        { return _session?.role === 'Admin'; },

    // Used by storageService to attach Bearer token
    getToken()       { return _session?.token ?? null; },
  };
})();

// Keep backward-compat alias used in app.js
const authService = AuthService;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authService: AuthService };
}
