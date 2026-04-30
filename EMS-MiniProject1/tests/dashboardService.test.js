global.INITIAL_EMPLOYEES = [
  { id: 1, firstName: 'Sachin',    lastName: 'Ramkumar',  email: 's@t.com', phone: '9000000001', department: 'Engineering', designation: 'Dev',  salary: 850000, joinDate: '2021-03-15', status: 'Active'   },
  { id: 2, firstName: 'Kavitha',   lastName: 'Sundaram',  email: 'k@t.com', phone: '9000000002', department: 'Marketing',   designation: 'Exec', salary: 620000, joinDate: '2020-07-01', status: 'Active'   },
  { id: 3, firstName: 'Deepak',    lastName: 'Natarajan', email: 'd@t.com', phone: '9000000003', department: 'HR',          designation: 'HR',   salary: 550000, joinDate: '2019-11-20', status: 'Inactive' },
  { id: 4, firstName: 'Preethi',   lastName: 'Balaji',    email: 'p@t.com', phone: '9000000004', department: 'Engineering', designation: 'Snr',  salary: 720000, joinDate: '2022-01-10', status: 'Active'   },
  { id: 5, firstName: 'Aravind',   lastName: 'Selvam',    email: 'a@t.com', phone: '9000000005', department: 'Operations',  designation: 'Mgr',  salary: 950000, joinDate: '2018-06-05', status: 'Inactive' },
  { id: 6, firstName: 'Nithyasri', lastName: 'Mohan',     email: 'n@t.com', phone: '9000000006', department: 'Finance',     designation: 'FA',   salary: 800000, joinDate: '2023-08-20', status: 'Active'   },
];
global.INITIAL_ADMIN = { username: 'admin', password: 'admin123' };
global.DEPARTMENTS = ['Engineering','Marketing','HR','Finance','Operations'];

const { storageService } = require('../js/storageService');
global.storageService = storageService;
const { employeeService } = require('../js/employeeService');
global.employeeService = employeeService;
const { dashboardService } = require('../js/dashboardService');

beforeEach(() => storageService._reset());

describe('getSummary', () => {
  test('returns correct total', () => {
    expect(dashboardService.getSummary().total).toBe(6);
  });
  test('returns correct active count', () => {
    expect(dashboardService.getSummary().active).toBe(4);
  });
  test('returns correct inactive count', () => {
    expect(dashboardService.getSummary().inactive).toBe(2);
  });
  test('returns correct department count', () => {
    expect(dashboardService.getSummary().departments).toBe(5);
  });
  test('updates after adding an employee', () => {
    employeeService.add({ firstName: 'X', lastName: 'Y', email: 'xy@t.com', phone: '9000000099', department: 'HR', designation: 'T', salary: 100000, joinDate: '2024-01-01', status: 'Active' });
    expect(dashboardService.getSummary().total).toBe(7);
    expect(dashboardService.getSummary().active).toBe(5);
  });
  test('updates after removing an employee', () => {
    employeeService.remove(1);
    expect(dashboardService.getSummary().total).toBe(5);
  });
});

describe('getDepartmentBreakdown', () => {
  test('returns entry for each department', () => {
    const breakdown = dashboardService.getDepartmentBreakdown();
    const depts = breakdown.map(d => d.department);
    expect(depts).toContain('Engineering');
    expect(depts).toContain('Marketing');
    expect(depts).toContain('HR');
    expect(depts).toContain('Finance');
    expect(depts).toContain('Operations');
  });
  test('Engineering count is 2', () => {
    const eng = dashboardService.getDepartmentBreakdown().find(d => d.department === 'Engineering');
    expect(eng.count).toBe(2);
  });
  test('percent of Engineering is 33 of 6', () => {
    const eng = dashboardService.getDepartmentBreakdown().find(d => d.department === 'Engineering');
    expect(eng.percent).toBe(33);
  });
  test('sorted by count descending', () => {
    const breakdown = dashboardService.getDepartmentBreakdown();
    for (let i = 0; i < breakdown.length - 1; i++) {
      expect(breakdown[i].count).toBeGreaterThanOrEqual(breakdown[i + 1].count);
    }
  });
});

describe('getRecentEmployees', () => {
  test('returns last n added (by id desc)', () => {
    const recent = dashboardService.getRecentEmployees(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].id).toBe(6);
    expect(recent[1].id).toBe(5);
    expect(recent[2].id).toBe(4);
  });
  test('defaults to 5 employees', () => {
    expect(dashboardService.getRecentEmployees()).toHaveLength(5);
  });
  test('includes newly added employee', () => {
    const newEmp = employeeService.add({ firstName: 'Z', lastName: 'Z', email: 'zz@t.com', phone: '9000000099', department: 'HR', designation: 'T', salary: 100000, joinDate: '2024-01-01', status: 'Active' });
    const recent = dashboardService.getRecentEmployees(1);
    expect(recent[0].id).toBe(newEmp.id);
  });
  test('n larger than total returns all', () => {
    expect(dashboardService.getRecentEmployees(100)).toHaveLength(6);
  });
});
