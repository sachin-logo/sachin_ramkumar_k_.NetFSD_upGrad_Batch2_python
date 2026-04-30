using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace EMS.Tests.Integration
{
    /// <summary>
    /// Integration tests using EF Core InMemory database.
    /// Tests EmployeeRepository + AppDbContext together without a real SQL Server.
    /// </summary>
    [TestFixture]
    public class EmployeeIntegrationTests
    {
        private AppDbContext _db = null!;
        private EmployeeRepository _repo = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _db   = new AppDbContext(options);
            _repo = new EmployeeRepository(_db);
        }

        [TearDown]
        public void TearDown() => _db.Dispose();

        private static Employee MakeEmployee(string first = "Test", string last = "User",
            string email = "test@company.com", string dept = "Engineering") => new()
        {
            FirstName   = first,
            LastName    = last,
            Email       = email,
            Phone       = "9876543210",
            Department  = dept,
            Designation = "Engineer",
            Salary      = 500000m,
            JoinDate    = DateTime.UtcNow,
            Status      = "Active",
            CreatedAt   = DateTime.UtcNow,
            UpdatedAt   = DateTime.UtcNow,
        };

        // ── Add & Retrieve ────────────────────────────────────────────────────

        [Test]
        public async Task AddAsync_EmployeePersistsAndIsRetrievable()
        {
            var emp     = MakeEmployee();
            var created = await _repo.AddAsync(emp);
            var fetched = await _repo.GetByIdAsync(created.Id);

            Assert.That(fetched, Is.Not.Null);
            Assert.That(fetched!.Email, Is.EqualTo("test@company.com"));
        }

        // ── Delete ────────────────────────────────────────────────────────────

        [Test]
        public async Task DeleteAsync_RemovesRecord()
        {
            var emp     = await _repo.AddAsync(MakeEmployee());
            var deleted = await _repo.DeleteAsync(emp.Id);
            var fetched = await _repo.GetByIdAsync(emp.Id);

            Assert.That(deleted, Is.True);
            Assert.That(fetched, Is.Null);
        }

        // ── Email uniqueness ──────────────────────────────────────────────────

        [Test]
        public async Task EmailExistsAsync_ReturnsTrueForDuplicate()
        {
            await _repo.AddAsync(MakeEmployee(email: "dup@company.com"));
            var exists = await _repo.EmailExistsAsync("dup@company.com");
            Assert.That(exists, Is.True);
        }

        [Test]
        public async Task EmailExistsAsync_ExcludesCurrentEmployee()
        {
            var emp    = await _repo.AddAsync(MakeEmployee(email: "mine@company.com"));
            var exists = await _repo.EmailExistsAsync("mine@company.com", emp.Id);
            Assert.That(exists, Is.False);
        }

        // ── Dashboard counts ──────────────────────────────────────────────────

        [Test]
        public async Task GetDashboardSummaryAsync_CountsAreCorrect()
        {
            await _repo.AddAsync(MakeEmployee(first: "A", email: "a@c.com", dept: "Engineering"));
            await _repo.AddAsync(MakeEmployee(first: "B", email: "b@c.com", dept: "HR"));
            var active = MakeEmployee(first: "C", email: "c@c.com", dept: "Finance");
            active.Status = "Inactive";
            await _repo.AddAsync(active);

            var summary = await _repo.GetDashboardSummaryAsync();

            Assert.That(summary.Total,       Is.EqualTo(3));
            Assert.That(summary.Active,      Is.EqualTo(2));
            Assert.That(summary.Inactive,    Is.EqualTo(1));
            Assert.That(summary.Departments, Is.EqualTo(3));
        }

        // ── Pagination ────────────────────────────────────────────────────────

        [Test]
        public async Task GetAllAsync_PaginationReturnsCorrectPage()
        {
            for (int i = 1; i <= 15; i++)
                await _repo.AddAsync(MakeEmployee(first: $"Emp{i}", email: $"emp{i}@c.com"));

            var result = await _repo.GetAllAsync(new EmployeeQueryParams { Page = 1, PageSize = 5 });

            Assert.That(result.TotalCount, Is.EqualTo(15));
            Assert.That(result.Data.Count(), Is.EqualTo(5));
            Assert.That(result.TotalPages,   Is.EqualTo(3));
        }

        // ── Search ────────────────────────────────────────────────────────────

        [Test]
        public async Task GetAllAsync_SearchFiltersByName()
        {
            await _repo.AddAsync(MakeEmployee(first: "Priya",  last: "Prabhu", email: "p@c.com"));
            await _repo.AddAsync(MakeEmployee(first: "Arjun",  last: "Sharma", email: "a@c.com"));

            var result = await _repo.GetAllAsync(new EmployeeQueryParams { Search = "priya", PageSize = 10 });

            Assert.That(result.TotalCount, Is.EqualTo(1));
            Assert.That(result.Data.First().FirstName, Is.EqualTo("Priya"));
        }
    }
}
