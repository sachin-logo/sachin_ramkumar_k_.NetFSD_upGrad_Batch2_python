using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using EMS.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace EMS.Tests.Services
{
    [TestFixture]
    public class AuthServiceTests
    {
        private AppDbContext _db = null!;
        private Mock<IConfiguration> _configMock = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _db = new AppDbContext(options);

            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(c => c["Jwt:Key"]).Returns("TestSecretKey_32Chars_ForNUnit!!");
            _configMock.Setup(c => c["Jwt:Issuer"]).Returns("EMS.API");
            _configMock.Setup(c => c["Jwt:Audience"]).Returns("EMS.Client");
            _configMock.Setup(c => c["Jwt:ExpiryHours"]).Returns("8");

            // Seed one admin user
            _db.Users.Add(new AppUser
            {
                Id           = 1,
                Username     = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123", 4), // low rounds for fast tests
                Role         = "Admin",
                CreatedAt    = DateTime.UtcNow,
            });
            _db.SaveChanges();
        }

        [TearDown]
        public void TearDown() => _db.Dispose();

        // ── LoginAsync ────────────────────────────────────────────────────────

        [Test]
        public async Task LoginAsync_ValidCredentials_ReturnsTokenAndSuccess()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.LoginAsync(new LoginRequestDto { Username = "admin", Password = "admin123" });

            Assert.That(result.Success, Is.True);
            Assert.That(result.Token, Is.Not.Null.And.Not.Empty);
            Assert.That(result.Role, Is.EqualTo("Admin"));
        }

        [Test]
        public async Task LoginAsync_WrongPassword_ReturnsFailure()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.LoginAsync(new LoginRequestDto { Username = "admin", Password = "wrongpass" });

            Assert.That(result.Success, Is.False);
            Assert.That(result.Token, Is.Null);
        }

        [Test]
        public async Task LoginAsync_UnknownUser_ReturnsFailure()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.LoginAsync(new LoginRequestDto { Username = "ghost", Password = "anything" });

            Assert.That(result.Success, Is.False);
        }

        // ── RegisterAsync ─────────────────────────────────────────────────────

        [Test]
        public async Task RegisterAsync_NewUsername_ReturnsSuccess()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.RegisterAsync(new RegisterRequestDto
            {
                Username = "newuser",
                Password = "password123",
                Role     = "Viewer",
            });

            Assert.That(result.Success, Is.True);
            Assert.That(result.Username, Is.EqualTo("newuser"));
            Assert.That(result.Role, Is.EqualTo("Viewer"));
        }

        [Test]
        public async Task RegisterAsync_DuplicateUsername_ReturnsFailure()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.RegisterAsync(new RegisterRequestDto
            {
                Username = "admin",     // already seeded
                Password = "anypass123",
                Role     = "Viewer",
            });

            Assert.That(result.Success, Is.False);
            Assert.That(result.Message, Does.Contain("already taken"));
        }

        [Test]
        public async Task RegisterAsync_InvalidRole_DefaultsToViewer()
        {
            var svc    = new AuthService(_db, _configMock.Object);
            var result = await svc.RegisterAsync(new RegisterRequestDto
            {
                Username = "roletest",
                Password = "password123",
                Role     = "SuperAdmin",    // invalid role
            });

            Assert.That(result.Success, Is.True);
            Assert.That(result.Role, Is.EqualTo("Viewer"));
        }
    }
}
