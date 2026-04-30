global.INITIAL_EMPLOYEES = [
  { id: 1, firstName: 'Sachin',    lastName: 'Ramkumar',  email: 'sachin@test.com',  phone: '9876541230', department: 'Engineering', designation: 'Dev',     salary: 850000, joinDate: '2021-03-15', status: 'Active'   },
  { id: 2, firstName: 'Kavitha',   lastName: 'Sundaram',  email: 'kavitha@test.com', phone: '9123456781', department: 'Marketing',   designation: 'Exec',    salary: 620000, joinDate: '2020-07-01', status: 'Active'   },
  { id: 3, firstName: 'Deepak',    lastName: 'Natarajan', email: 'deepak@test.com',  phone: '9988776644', department: 'HR',          designation: 'HR Exec', salary: 550000, joinDate: '2019-11-20', status: 'Inactive' },
  { id: 4, firstName: 'Preethi',   lastName: 'Balaji',    email: 'preethi@test.com', phone: '9876512341', department: 'Finance',     designation: 'Analyst', salary: 720000, joinDate: '2022-01-10', status: 'Active'   },
  { id: 5, firstName: 'Aravind',   lastName: 'Selvam',    email: 'aravind@test.com', phone: '9001234568', department: 'Operations',  designation: 'Mgr',     salary: 950000, joinDate: '2018-06-05', status: 'Active'   },
];
global.INITIAL_ADMIN = { username: 'admin', password: 'admin123' };
global.DEPARTMENTS   = ['Engineering','Marketing','HR','Finance','Operations'];

const { storageService } = require('../js/storageService');
global.storageService = storageService;
const { employeeService } = require('../js/employeeService');

beforeEach(() => storageService._reset());

describe('getAll', () => {
  test('returns all 5 seed employees', () => {
    expect(employeeService.getAll()).toHaveLength(5);
  });
  test('returns a copy — mutations do not affect store', () => {
    const all = employeeService.getAll();
    all[0].firstName = 'MUTATED';
    expect(employeeService.getById(1).firstName).toBe('Sachin');
  });
  test('returns array type', () => {
    expect(Array.isArray(employeeService.getAll())).toBe(true);
  });
});

describe('getById', () => {
  test('returns correct employee for valid id', () => {
    expect(employeeService.getById(2).email).toBe('kavitha@test.com');
  });
  test('returns a copy — mutations do not affect store', () => {
    const emp = employeeService.getById(1);
    emp.firstName = 'CHANGED';
    expect(employeeService.getById(1).firstName).toBe('Sachin');
  });
  test('returns undefined for non-existent id', () => {
    expect(employeeService.getById(999)).toBeUndefined();
  });
  test('returns undefined for negative id', () => {
    expect(employeeService.getById(-1)).toBeUndefined();
  });
  test('returns undefined for id zero', () => {
    expect(employeeService.getById(0)).toBeUndefined();
  });
});

describe('add', () => {
  const newEmp = {
    firstName: 'Test', lastName: 'User', email: 'test@test.com',
    phone: '9000000001', department: 'HR', designation: 'Tester',
    salary: 500000, joinDate: '2024-01-01', status: 'Active',
  };
  test('adds employee and returns record with auto-incremented id', () => {
    const added = employeeService.add(newEmp);
    expect(added.id).toBe(6);
    expect(added.firstName).toBe('Test');
  });
  test('total count increases by 1 after add', () => {
    employeeService.add(newEmp);
    expect(employeeService.getAll()).toHaveLength(6);
  });
  test('added employee is retrievable by id', () => {
    const added = employeeService.add(newEmp);
    expect(employeeService.getById(added.id)).toBeDefined();
  });
  test('ids never duplicate after multiple adds', () => {
    const a = employeeService.add({ ...newEmp, email: 'a@t.com' });
    const b = employeeService.add({ ...newEmp, email: 'b@t.com' });
    expect(a.id).not.toBe(b.id);
  });
  test('id does not reuse a deleted id', () => {
    employeeService.remove(5);
    const added = employeeService.add(newEmp);
    expect(added.id).toBe(6);
  });
});

describe('update', () => {
  test('updates salary and keeps other fields intact', () => {
    const updated = employeeService.update(1, { salary: 999999 });
    expect(updated.salary).toBe(999999);
    expect(updated.firstName).toBe('Sachin');
  });
  test('updated value is reflected in getById', () => {
    employeeService.update(1, { designation: 'Senior Dev' });
    expect(employeeService.getById(1).designation).toBe('Senior Dev');
  });
  test('updated value is reflected in getAll', () => {
    employeeService.update(1, { status: 'Inactive' });
    const emp = employeeService.getAll().find(e => e.id === 1);
    expect(emp.status).toBe('Inactive');
  });
  test('returns null for non-existent id', () => {
    expect(employeeService.update(999, { salary: 1 })).toBeNull();
  });
  test('id cannot be changed via update', () => {
    const updated = employeeService.update(1, { id: 99 });
    expect(updated.id).toBe(1);
  });
});

describe('remove', () => {
  test('removes employee and returns true', () => {
    expect(employeeService.remove(1)).toBe(true);
    expect(employeeService.getAll()).toHaveLength(4);
  });
  test('removed employee is not in getAll', () => {
    employeeService.remove(1);
    const ids = employeeService.getAll().map(e => e.id);
    expect(ids).not.toContain(1);
  });
  test('removed employee is not in getById', () => {
    employeeService.remove(1);
    expect(employeeService.getById(1)).toBeUndefined();
  });
  test('returns false for non-existent id', () => {
    expect(employeeService.remove(999)).toBe(false);
  });
  test('removing same id twice returns false on second attempt', () => {
    employeeService.remove(1);
    expect(employeeService.remove(1)).toBe(false);
  });
});

describe('search', () => {
  test('finds by partial firstName', () => {
    expect(employeeService.search('sach')).toHaveLength(1);
  });
  test('finds by exact email', () => {
    expect(employeeService.search('kavitha@test.com')).toHaveLength(1);
  });
  test('is case-insensitive', () => {
    const result = employeeService.search('DEEPAK');
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('Deepak');
  });
  test('empty query returns all employees', () => {
    expect(employeeService.search('')).toHaveLength(5);
  });
  test('null query returns all employees', () => {
    expect(employeeService.search(null)).toHaveLength(5);
  });
  test('no match returns empty array', () => {
    expect(employeeService.search('zzznomatch')).toHaveLength(0);
  });
  test('does not match partial within word', () => {
    const result = employeeService.search('avind');
    expect(result).toHaveLength(0);
  });
});

describe('filterByDepartment', () => {
  test('filters Engineering correctly', () => {
    expect(employeeService.filterByDepartment('Engineering')).toHaveLength(1);
  });
  test('All returns everyone', () => {
    expect(employeeService.filterByDepartment('All')).toHaveLength(5);
  });
  test('non-existent department returns empty', () => {
    expect(employeeService.filterByDepartment('Legal')).toHaveLength(0);
  });
});

describe('filterByStatus', () => {
  test('filters Active', () => {
    expect(employeeService.filterByStatus('Active')).toHaveLength(4);
  });
  test('filters Inactive', () => {
    expect(employeeService.filterByStatus('Inactive')).toHaveLength(1);
  });
  test('All returns everyone', () => {
    expect(employeeService.filterByStatus('All')).toHaveLength(5);
  });
});

describe('applyFilters', () => {
  test('AND logic: search + dept + status', () => {
    const res = employeeService.applyFilters('sachin', 'Engineering', 'Active');
    expect(res).toHaveLength(1);
    expect(res[0].firstName).toBe('Sachin');
  });
  test('no results when no match', () => {
    expect(employeeService.applyFilters('sachin', 'Marketing', 'All')).toHaveLength(0);
  });
  test('empty filters return all', () => {
    expect(employeeService.applyFilters('', 'All', 'All')).toHaveLength(5);
  });
  test('dept filter alone works', () => {
    expect(employeeService.applyFilters('', 'Finance', 'All')).toHaveLength(1);
  });
  test('status filter alone works', () => {
    expect(employeeService.applyFilters('', 'All', 'Inactive')).toHaveLength(1);
  });
});

describe('sortBy', () => {
  test('sort by name asc', () => {
    const sorted = employeeService.sortBy(employeeService.getAll(), 'name', 'asc');
    expect(sorted[0].lastName).toBe('Balaji');
  });
  test('sort by salary desc', () => {
    const sorted = employeeService.sortBy(employeeService.getAll(), 'salary', 'desc');
    expect(sorted[0].salary).toBe(950000);
  });
  test('sort by joinDate asc (oldest first)', () => {
    const sorted = employeeService.sortBy(employeeService.getAll(), 'joinDate', 'asc');
    expect(sorted[0].joinDate).toBe('2018-06-05');
  });
  test('sort by name desc', () => {
    const sorted = employeeService.sortBy(employeeService.getAll(), 'name', 'desc');
    expect(sorted[0].lastName).toBe('Sundaram');
  });
  test('sort by salary asc', () => {
    const sorted = employeeService.sortBy(employeeService.getAll(), 'salary', 'asc');
    expect(sorted[0].salary).toBe(550000);
  });
  test('does not mutate original array', () => {
    const original = employeeService.getAll();
    employeeService.sortBy(original, 'salary', 'desc');
    expect(original[0].id).toBe(1);
  });
});

describe('emailExists', () => {
  test('returns true for existing email', () => {
    expect(employeeService.emailExists('sachin@test.com')).toBe(true);
  });
  test('returns false when excluding same id', () => {
    expect(employeeService.emailExists('sachin@test.com', 1)).toBe(false);
  });
  test('returns false for unknown email', () => {
    expect(employeeService.emailExists('new@test.com')).toBe(false);
  });
  test('case-insensitive email check', () => {
    expect(employeeService.emailExists('SACHIN@TEST.COM')).toBe(true);
  });
});
