using EMS.API.Controllers;
using EMS.API.DTOs;
using EMS.API.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace EMS.Tests.Controllers
{
    [TestFixture]
    public class EmployeesControllerTests
    {
        private Mock<EmployeeService> _serviceMock = null!;
        private EmployeesController _controller = null!;

        // We cannot easily mock EmployeeService directly without an interface,
        // so we test the controller via integration-style with a real service + mocked repo.

        private Mock<IEmployeeRepository> _repoMock = null!;
        private EmployeeService _service = null!;

        [SetUp]
        public void Setup()
        {
            _repoMock   = new Mock<IEmployeeRepository>();
            _service    = new EmployeeService(_repoMock.Object);
            _controller = new EmployeesController(_service);
        }

        [Test]
        public async Task GetById_ExistingEmployee_ReturnsOk()
        {
            // Arrange
            var fakeEmployee = new EMS.API.Models.Employee
            {
                Id          = 1,
                FirstName   = "Priya",
                LastName    = "Prabhu",
                Email       = "priya@hexacore.com",
                Phone       = "9876543210",
                Department  = "Engineering",
                Designation = "Software Engineer",
                Salary      = 850000m,
                JoinDate    = new DateTime(2021, 3, 15),
                Status      = "Active",
            };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(fakeEmployee);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            Assert.That(okResult!.StatusCode, Is.EqualTo(200));

            var dto = okResult.Value as EmployeeResponseDto;
            Assert.That(dto, Is.Not.Null);
            Assert.That(dto!.FirstName, Is.EqualTo("Priya"));
        }

        [Test]
        public async Task GetById_NonExistentEmployee_ReturnsNotFound()
        {
            // Arrange
            _repoMock.Setup(r => r.GetByIdAsync(9999)).ReturnsAsync((EMS.API.Models.Employee?)null);

            // Act
            var result = await _controller.GetById(9999);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task Delete_ExistingEmployee_ReturnsOk()
        {
            // Arrange
            _repoMock.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task Delete_NonExistentEmployee_ReturnsNotFound()
        {
            // Arrange
            _repoMock.Setup(r => r.DeleteAsync(9999)).ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(9999);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task Create_DuplicateEmail_ReturnsConflict()
        {
            // Arrange
            var request = new EmployeeRequestDto
            {
                FirstName   = "Test",
                LastName    = "User",
                Email       = "existing@hexacore.com",
                Phone       = "9000000001",
                Department  = "HR",
                Designation = "Analyst",
                Salary      = 500000m,
                JoinDate    = DateTime.UtcNow,
                Status      = "Active",
            };
            _repoMock.Setup(r => r.EmailExistsAsync(request.Email, It.IsAny<int?>())).ReturnsAsync(true);

            // Act
            var result = await _controller.Create(request);

            // Assert
            Assert.That(result, Is.InstanceOf<ConflictObjectResult>());
        }
    }
}
