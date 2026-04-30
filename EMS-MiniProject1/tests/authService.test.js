global.INITIAL_EMPLOYEES = [];
global.INITIAL_ADMIN = { username: 'admin', password: 'admin123' };
global.DEPARTMENTS = [];

const { authService } = require('../js/authService');

beforeEach(() => authService._reset());

describe('signup', () => {
  test('succeeds with valid new credentials', () => {
    const res = authService.signup('sachin', 'password1');
    expect(res.success).toBe(true);
  });
  test('fails when username is empty', () => {
    const res = authService.signup('', 'password1');
    expect(res.success).toBe(false);
    expect(res.errors.username).toBeDefined();
  });
  test('fails when password is shorter than 6 chars', () => {
    const res = authService.signup('sachin', 'abc');
    expect(res.success).toBe(false);
    expect(res.errors.password).toBeDefined();
  });
  test('fails on duplicate username (case-insensitive)', () => {
    authService.signup('sachin', 'password1');
    const res = authService.signup('SACHIN', 'password2');
    expect(res.success).toBe(false);
    expect(res.errors.username).toMatch(/taken/i);
  });
  test('fails on duplicate with seed admin', () => {
    const res = authService.signup('admin', 'newpass1');
    expect(res.success).toBe(false);
  });
  test('succeeds with exactly 6 character password', () => {
    const res = authService.signup('user2', 'abc123');
    expect(res.success).toBe(true);
  });
  test('fails when password is exactly 5 characters', () => {
    const res = authService.signup('user3', 'abc12');
    expect(res.success).toBe(false);
  });
});

describe('login', () => {
  test('succeeds with seeded admin credentials', () => {
    const res = authService.login('admin', 'admin123');
    expect(res.success).toBe(true);
  });
  test('succeeds after signup', () => {
    authService.signup('sachin', 'securepass');
    const res = authService.login('sachin', 'securepass');
    expect(res.success).toBe(true);
  });
  test('fails with wrong password', () => {
    const res = authService.login('admin', 'wrongpass');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
  test('fails with unknown username', () => {
    const res = authService.login('nobody', 'admin123');
    expect(res.success).toBe(false);
  });
  test('fails when both fields are empty', () => {
    const res = authService.login('', '');
    expect(res.success).toBe(false);
  });
  test('error message does not reveal which field is wrong', () => {
    const res = authService.login('admin', 'wrongpass');
    expect(res.error.toLowerCase()).toContain('invalid');
  });
});

describe('session state', () => {
  test('isLoggedIn is false before login', () => {
    expect(authService.isLoggedIn()).toBe(false);
  });
  test('isLoggedIn is true after successful login', () => {
    authService.login('admin', 'admin123');
    expect(authService.isLoggedIn()).toBe(true);
  });
  test('getCurrentUser returns username after login', () => {
    authService.login('admin', 'admin123');
    expect(authService.getCurrentUser()).toBe('admin');
  });
  test('isLoggedIn is false after logout', () => {
    authService.login('admin', 'admin123');
    authService.logout();
    expect(authService.isLoggedIn()).toBe(false);
  });
  test('getCurrentUser returns null after logout', () => {
    authService.login('admin', 'admin123');
    authService.logout();
    expect(authService.getCurrentUser()).toBeNull();
  });
  test('failed login does not set session', () => {
    authService.login('admin', 'wrongpass');
    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });
});
