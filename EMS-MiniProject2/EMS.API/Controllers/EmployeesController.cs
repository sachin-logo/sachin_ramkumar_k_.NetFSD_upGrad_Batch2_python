using EMS.API.DTOs;
using EMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/employees")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _service;

        public EmployeesController(EmployeeService service)
        {
            _service = service;
        }

        // GET /api/employees?search=&department=&status=&sortBy=name&sortDir=asc&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] EmployeeQueryParams queryParams)
        {
            var result = await _service.GetAllAsync(queryParams);
            return Ok(result);
        }

        // GET /api/employees/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var summary = await _service.GetDashboardAsync();
            return Ok(summary);
        }

        // GET /api/employees/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var emp = await _service.GetByIdAsync(id);
            if (emp == null) return NotFound(new { message = $"Employee with id {id} not found." });
            return Ok(emp);
        }

        // POST /api/employees  (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] EmployeeRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (dto, error) = await _service.CreateAsync(request);
            if (dto == null)
                return Conflict(new { message = error });

            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        // PUT /api/employees/{id}  (Admin only)
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (dto, error) = await _service.UpdateAsync(id, request);
            if (dto == null && error == "Not found.")
                return NotFound(new { message = $"Employee with id {id} not found." });
            if (dto == null)
                return Conflict(new { message = error });

            return Ok(dto);
        }

        // DELETE /api/employees/{id}  (Admin only)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = $"Employee with id {id} not found." });
            return Ok(new { message = "Employee deleted successfully." });
        }
    }
}
