using EMS.API.DTOs;
using EMS.API.Models;

namespace EMS.API.Services
{
    public class EmployeeService
    {
        private readonly IEmployeeRepository _repo;

        public EmployeeService(IEmployeeRepository repo)
        {
            _repo = repo;
        }

        public async Task<PagedResult<EmployeeResponseDto>> GetAllAsync(EmployeeQueryParams queryParams)
        {
            var result = await _repo.GetAllAsync(queryParams);
            return new PagedResult<EmployeeResponseDto>
            {
                Data       = result.Data.Select(MapToDto),
                TotalCount = result.TotalCount,
                Page       = result.Page,
                PageSize   = result.PageSize,
            };
        }

        public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
        {
            var emp = await _repo.GetByIdAsync(id);
            return emp == null ? null : MapToDto(emp);
        }

        public async Task<(EmployeeResponseDto? dto, string? error)> CreateAsync(EmployeeRequestDto request)
        {
            if (await _repo.EmailExistsAsync(request.Email))
                return (null, "Email already exists.");

            var emp = MapFromRequest(request);
            var created = await _repo.AddAsync(emp);
            return (MapToDto(created), null);
        }

        public async Task<(EmployeeResponseDto? dto, string? error)> UpdateAsync(int id, EmployeeRequestDto request)
        {
            if (await _repo.EmailExistsAsync(request.Email, id))
                return (null, "Email already exists.");

            var emp = MapFromRequest(request);
            var updated = await _repo.UpdateAsync(id, emp);
            return updated == null ? (null, "Not found.") : (MapToDto(updated), null);
        }

        public async Task<bool> DeleteAsync(int id)
            => await _repo.DeleteAsync(id);

        public async Task<DashboardSummaryDto> GetDashboardAsync()
            => await _repo.GetDashboardSummaryAsync();

        // ── Mapping helpers ───────────────────────────────────────────────────
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

        private static Employee MapFromRequest(EmployeeRequestDto r) => new()
        {
            FirstName   = r.FirstName.Trim(),
            LastName    = r.LastName.Trim(),
            Email       = r.Email.Trim(),
            Phone       = r.Phone.Trim(),
            Department  = r.Department,
            Designation = r.Designation.Trim(),
            Salary      = r.Salary,
            JoinDate    = r.JoinDate,
            Status      = r.Status,
        };
    }
}
