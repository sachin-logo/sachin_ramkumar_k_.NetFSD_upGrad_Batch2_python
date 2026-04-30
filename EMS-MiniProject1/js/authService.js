const authService = (function () {
  let _registeredUsers = [{ ...INITIAL_ADMIN }];
  let _isLoggedIn = false;
  let _currentUser = null;

  return {
    signup(username, password) {
      const errors = {};
      if (!username || username.trim() === '') errors.username = 'Username is required.';
      if (!password || password.length < 6)    errors.password = 'Password must be at least 6 characters.';
      if (Object.keys(errors).length) return { success: false, errors };

      const exists = _registeredUsers.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (exists) return { success: false, errors: { username: 'Username already taken. Please choose another.' } };

      _registeredUsers.push({ username: username.trim(), password });
      return { success: true };
    },

    login(username, password) {
      if (!username || !password) return { success: false, error: 'Both fields are required.' };
      const user = _registeredUsers.find(u => u.username === username.trim() && u.password === password);
      if (!user) return { success: false, error: 'Invalid credentials. Please try again.' };
      _isLoggedIn = true;
      _currentUser = user.username;
      return { success: true };
    },

    logout() {
      _isLoggedIn = false;
      _currentUser = null;
    },

    isLoggedIn()     { return _isLoggedIn; },
    getCurrentUser() { return _currentUser; },

    _reset() {
      _registeredUsers = [{ ...INITIAL_ADMIN }];
      _isLoggedIn = false;
      _currentUser = null;
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authService };
}
