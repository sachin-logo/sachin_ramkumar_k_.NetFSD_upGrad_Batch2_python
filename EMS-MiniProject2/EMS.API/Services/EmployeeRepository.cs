using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Services
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _db;

        public EmployeeRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<Employee>> GetAllAsync(EmployeeQueryParams q)
        {
            var query = _db.Employees.AsQueryable();

            // Search: firstName + ' ' + lastName LIKE '%term%' OR email LIKE '%term%'
            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                var term = q.Search.Trim().ToLower();
                query = query.Where(e =>
                    (e.FirstName.ToLower() + " " + e.LastName.ToLower()).Contains(term) ||
                    e.Email.ToLower().Contains(term));
            }

            // Department filter
            if (!string.IsNullOrWhiteSpace(q.Department))
                query = query.Where(e => e.Department == q.Department);

            // Status filter
            if (!string.IsNullOrWhiteSpace(q.Status))
                query = query.Where(e => e.Status == q.Status);

            // Sort
            query = q.SortBy?.ToLower() switch
            {
                "salary"   => q.SortDir == "desc" ? query.OrderByDescending(e => e.Salary)   : query.OrderBy(e => e.Salary),
                "joindate" => q.SortDir == "desc" ? query.OrderByDescending(e => e.JoinDate)  : query.OrderBy(e => e.JoinDate),
                _          => q.SortDir == "desc"
                    ? query.OrderByDescending(e => e.LastName).ThenByDescending(e => e.FirstName)
                    : query.OrderBy(e => e.LastName).ThenBy(e => e.FirstName),
            };

            var totalCount = await query.CountAsync();

            // Clamp pageSize
            var pageSize = Math.Min(Math.Max(q.PageSize, 1), 100);
            var page     = Math.Max(q.Page, 1);

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Employee>
            {
                Data       = data,
                TotalCount = totalCount,
                Page       = page,
                PageSize   = pageSize,
            };
        }

        public async Task<Employee?> GetByIdAsync(int id)
            => await _db.Employees.FindAsync(id);

        public async Task<Employee> AddAsync(Employee employee)
        {
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;
            _db.Employees.Add(employee);
            await _db.SaveChangesAsync();
            return employee;
        }

        public async Task<Employee?> UpdateAsync(int id, Employee updated)
        {
            var existing = await _db.Employees.FindAsync(id);
            if (existing == null) return null;

            existing.FirstName   = updated.FirstName;
            existing.LastName    = updated.LastName;
            existing.Email       = updated.Email;
            existing.Phone       = updated.Phone;
            existing.Department  = updated.Department;
            existing.Designation = updated.Designation;
            existing.Salary      = updated.Salary;
            existing.JoinDate    = updated.JoinDate;
            existing.Status      = updated.Status;
            existing.UpdatedAt   = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var emp = await _db.Employees.FindAsync(id);
            if (emp == null) return false;
            _db.Employees.Remove(emp);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
        {
            var q = _db.Employees.Where(e => e.Email.ToLower() == email.ToLower());
            if (excludeId.HasValue)
                q = q.Where(e => e.Id != excludeId.Value);
            return await q.AnyAsync();
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var all    = await _db.Employees.ToListAsync();
            var total  = all.Count;
            var active = all.Count(e => e.Status == "Active");

            var deptBreakdown = all
                .GroupBy(e => e.Department)
                .Select(g => new DepartmentBreakdownDto
                {
                    Department = g.Key,
                    Count      = g.Count(),
                    Percent    = total > 0 ? (int)Math.Round((double)g.Count() / total * 100) : 0,
                })
                .OrderBy(d => d.Department)
                .ToList();

            var recent = all
                .OrderByDescending(e => e.CreatedAt)
                .ThenByDescending(e => e.Id)
                .Take(5)
                .Select(MapToDto)
                .ToList();

            return new DashboardSummaryDto
            {
                Total               = total,
                Active              = active,
                Inactive            = total - active,
                Departments         = all.Select(e => e.Department).Distinct().Count(),
                DepartmentBreakdown = deptBreakdown,
                RecentEmployees     = recent,
            };
        }

        private static EmployeeResponseDto MapToDto(Employee e) => new()
        {
            Id          = e.Id,
            FirstName   = e.FirstName,
            LastName    = e.LastName,
            Email       = e.Email,
            Phone       = e.Phone,
            Department  = e.Department,
            Designation = e.Designation,
            Salary      = e.Salary,
            JoinDate    = e.JoinDate,
            Status      = e.Status,
            CreatedAt   = e.CreatedAt,
            UpdatedAt   = e.UpdatedAt,
        };
    }
}
