using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Moq;
using NUnit.Framework;

namespace EMS.Tests.Services
{
    [TestFixture]
    public class EmployeeServiceTests
    {
        private Mock<IEmployeeRepository> _repoMock = null!;
        private EmployeeService _service = null!;

        [SetUp]
        public void Setup()
        {
            _repoMock = new Mock<IEmployeeRepository>();
            _service  = new EmployeeService(_repoMock.Object);
        }

        // ── GetByIdAsync ──────────────────────────────────────────────────────

        [Test]
        public async Task GetByIdAsync_ValidId_ReturnsMappedDto()
        {
            // Arrange
            var fakeEmployee = new Employee
            {
                Id          = 1,
                FirstName   = "Priya",
                LastName    = "Prabhu",
                Email       = "priya.prabhu@hexacore.com",
                Phone       = "9876543210",
                Department  = "Engineering",
                Designation = "Software Engineer",
                Salary      = 850000m,
                JoinDate    = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                Status      = "Active",
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow,
            };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(fakeEmployee);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result!.FirstName, Is.EqualTo("Priya"));
            Assert.That(result.Email, Is.EqualTo("priya.prabhu@hexacore.com"));
            Assert.That(result.Id, Is.EqualTo(1));
            _repoMock.Verify(r => r.GetByIdAsync(1), Times.Once);
        }

        [Test]
        public async Task GetByIdAsync_NonExistentId_ReturnsNull()
        {
            // Arrange
            _repoMock.Setup(r => r.GetByIdAsync(9999)).ReturnsAsync((Employee?)null);

            // Act
            var result = await _service.GetByIdAsync(9999);

            // Assert
            Assert.That(result, Is.Null);
        }

        // ── CreateAsync ───────────────────────────────────────────────────────

        [Test]
        public async Task CreateAsync_NewEmail_CallsAddAsyncAndReturnsDto()
        {
            // Arrange
            var request = new EmployeeRequestDto
            {
                FirstName   = "Test",
                LastName    = "User",
                Email       = "test.user@company.com",
                Phone       = "9876543210",
                Department  = "Engineering",
                Designation = "Tester",
                Salary      = 500000m,
                JoinDate    = DateTime.UtcNow,
                Status      = "Active",
            };

            _repoMock.Setup(r => r.EmailExistsAsync(request.Email, It.IsAny<int?>())).ReturnsAsync(false);
            _repoMock.Setup(r => r.AddAsync(It.IsAny<Employee>()))
                     .ReturnsAsync((Employee e) => { e.Id = 99; return e; });

            // Act
            var (dto, error) = await _service.CreateAsync(request);

            // Assert
            Assert.That(error, Is.Null);
            Assert.That(dto, Is.Not.Null);
            Assert.That(dto!.FirstName, Is.EqualTo("Test"));
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Once);
        }

        [Test]
        public async Task CreateAsync_DuplicateEmail_ReturnsError()
        {
            // Arrange
            var request = new EmployeeRequestDto
            {
                FirstName   = "Dup",
                LastName    = "User",
                Email       = "existing@company.com",
                Phone       = "9876543210",
                Department  = "HR",
                Designation = "Analyst",
                Salary      = 400000m,
                JoinDate    = DateTime.UtcNow,
                Status      = "Active",
            };
            _repoMock.Setup(r => r.EmailExistsAsync(request.Email, It.IsAny<int?>())).ReturnsAsync(true);

            // Act
            var (dto, error) = await _service.CreateAsync(request);

            // Assert
            Assert.That(dto, Is.Null);
            Assert.That(error, Is.EqualTo("Email already exists."));
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Never);
        }

        // ── UpdateAsync ───────────────────────────────────────────────────────

        [Test]
        public async Task UpdateAsync_ValidId_ReturnsUpdatedDto()
        {
            // Arrange
            var request = new EmployeeRequestDto
            {
                FirstName   = "Updated",
                LastName    = "Name",
                Email       = "updated@company.com",
                Phone       = "9000000000",
                Department  = "Finance",
                Designation = "Manager",
                Salary      = 900000m,
                JoinDate    = DateTime.UtcNow,
                Status      = "Active",
            };
            var updated = new Employee { Id = 1, FirstName = "Updated", LastName = "Name", Email = "updated@company.com", Phone = "9000000000", Department = "Finance", Designation = "Manager", Salary = 900000m, JoinDate = DateTime.UtcNow, Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

            _repoMock.Setup(r => r.EmailExistsAsync(request.Email, 1)).ReturnsAsync(false);
            _repoMock.Setup(r => r.UpdateAsync(1, It.IsAny<Employee>())).ReturnsAsync(updated);

            // Act
            var (dto, error) = await _service.UpdateAsync(1, request);

            // Assert
            Assert.That(error, Is.Null);
            Assert.That(dto, Is.Not.Null);
            Assert.That(dto!.FirstName, Is.EqualTo("Updated"));
        }

        // ── DeleteAsync ───────────────────────────────────────────────────────

        [Test]
        public async Task DeleteAsync_ValidId_ReturnsTrue()
        {
            _repoMock.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);
            var result = await _service.DeleteAsync(1);
            Assert.That(result, Is.True);
            _repoMock.Verify(r => r.DeleteAsync(1), Times.Once);
        }

        [Test]
        public async Task DeleteAsync_InvalidId_ReturnsFalse()
        {
            _repoMock.Setup(r => r.DeleteAsync(9999)).ReturnsAsync(false);
            var result = await _service.DeleteAsync(9999);
            Assert.That(result, Is.False);
        }
    }
}
