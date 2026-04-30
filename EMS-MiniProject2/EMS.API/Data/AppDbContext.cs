using EMS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<AppUser> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique index on Employee Email
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            // Unique index on AppUser Username
            modelBuilder.Entity<AppUser>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Seed 15 employees (identical to Mini Project 1 data.js)
            modelBuilder.Entity<Employee>().HasData(
                new Employee { Id = 1,  FirstName = "Priya",   LastName = "Prabhu",   Email = "priya.prabhu@hexacore.com",    Phone = "9876543210", Department = "Engineering", Designation = "Software Engineer",       Salary = 850000m,  JoinDate = new DateTime(2021, 3, 15,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2021, 3, 15,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2021, 3, 15,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 2,  FirstName = "Arjun",   LastName = "Sharma",   Email = "arjun.sharma@hexacore.com",    Phone = "9123456780", Department = "Marketing",   Designation = "Marketing Executive",     Salary = 620000m,  JoinDate = new DateTime(2020, 7, 1,   0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2020, 7, 1,   0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2020, 7, 1,   0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 3,  FirstName = "Neha",    LastName = "Kapoor",   Email = "neha.kapoor@hexacore.com",     Phone = "9988776655", Department = "HR",          Designation = "HR Executive",            Salary = 550000m,  JoinDate = new DateTime(2019, 11, 20, 0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2019, 11, 20, 0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2019, 11, 20, 0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 4,  FirstName = "Rahul",   LastName = "Verma",    Email = "rahul.verma@hexacore.com",     Phone = "9876512340", Department = "Finance",     Designation = "Financial Analyst",       Salary = 720000m,  JoinDate = new DateTime(2022, 1, 10,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2022, 1, 10,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2022, 1, 10,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 5,  FirstName = "Sneha",   LastName = "Prasad",   Email = "sneha.prasad@hexacore.com",    Phone = "9001234567", Department = "Operations",  Designation = "Operations Manager",      Salary = 950000m,  JoinDate = new DateTime(2018, 6, 5,   0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2018, 6, 5,   0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2018, 6, 5,   0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 6,  FirstName = "Vikram",  LastName = "Raj",      Email = "vikram.nair@hexacore.com",     Phone = "9871234560", Department = "Engineering", Designation = "Senior Developer",        Salary = 1100000m, JoinDate = new DateTime(2017, 9, 12,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2017, 9, 12,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2017, 9, 12,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 7,  FirstName = "Ananya",  LastName = "Singh",    Email = "ananya.singh@hexacore.com",    Phone = "9765432100", Department = "Marketing",   Designation = "Content Strategist",      Salary = 580000m,  JoinDate = new DateTime(2023, 2, 28,  0,0,0,DateTimeKind.Utc), Status = "Inactive", CreatedAt = new DateTime(2023, 2, 28,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2023, 2, 28,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 8,  FirstName = "Karthik", LastName = "Rajan",    Email = "karthik.rajan@hexacore.com",   Phone = "9654321098", Department = "Finance",     Designation = "Accounts Manager",        Salary = 800000m,  JoinDate = new DateTime(2020, 4, 17,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2020, 4, 17,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2020, 4, 17,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 9,  FirstName = "Divya",   LastName = "Kumar",    Email = "divya.kumar@hexacore.com",     Phone = "9543210987", Department = "HR",          Designation = "Talent Acquisition Lead", Salary = 690000m,  JoinDate = new DateTime(2021, 8, 22,  0,0,0,DateTimeKind.Utc), Status = "Inactive", CreatedAt = new DateTime(2021, 8, 22,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2021, 8, 22,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 10, FirstName = "Suresh",  LastName = "Babu",     Email = "suresh.babu@hexacore.com",     Phone = "9432109876", Department = "Finance",     Designation = "Tax Consultant",          Salary = 760000m,  JoinDate = new DateTime(2019, 3, 30,  0,0,0,DateTimeKind.Utc), Status = "Inactive", CreatedAt = new DateTime(2019, 3, 30,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2019, 3, 30,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 11, FirstName = "Meera",   LastName = "Krishnan", Email = "meera.krishnan@hexacore.com",  Phone = "9321098765", Department = "Engineering", Designation = "QA Engineer",             Salary = 730000m,  JoinDate = new DateTime(2022, 10, 11, 0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2022, 10, 11, 0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2022, 10, 11, 0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 12, FirstName = "Lakshmi", LastName = "Chandran", Email = "lakshmi.chandran@hexacore.com",Phone = "9210987654", Department = "Marketing",   Designation = "Brand Manager",           Salary = 870000m,  JoinDate = new DateTime(2020, 12, 5,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2020, 12, 5,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2020, 12, 5,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 13, FirstName = "Amit",    LastName = "Joshi",    Email = "amit.joshi@hexacore.com",      Phone = "9109876543", Department = "Operations",  Designation = "Supply Chain Analyst",    Salary = 640000m,  JoinDate = new DateTime(2021, 5, 18,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2021, 5, 18,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2021, 5, 18,  0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 14, FirstName = "Pooja",   LastName = "Ghosh",    Email = "pooja.ghosh@hexacore.com",     Phone = "9098765432", Department = "Engineering", Designation = "DevOps Engineer",         Salary = 980000m,  JoinDate = new DateTime(2023, 1, 9,   0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2023, 1, 9,   0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2023, 1, 9,   0,0,0,DateTimeKind.Utc) },
                new Employee { Id = 15, FirstName = "Ravi",    LastName = "Menon",    Email = "ravi.menon@hexacore.com",      Phone = "8987654321", Department = "Operations",  Designation = "Logistics Coordinator",   Salary = 590000m,  JoinDate = new DateTime(2020, 8, 14,  0,0,0,DateTimeKind.Utc), Status = "Active",   CreatedAt = new DateTime(2020, 8, 14,  0,0,0,DateTimeKind.Utc), UpdatedAt = new DateTime(2020, 8, 14,  0,0,0,DateTimeKind.Utc) }
            );

            // Seed 2 default users (passwords are BCrypt hashed with 12 rounds)
            // admin / admin123  →  Role: Admin
            // viewer / viewer123 → Role: Viewer
            // NOTE: BCrypt.Net-Next accepts both $2a$ and $2b$ prefixes.
            modelBuilder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id           = 1,
                    Username     = "admin",
                    PasswordHash = "$2b$12$jei01JjrfO5xWk9y9awMEO8AjahTa7DspG9eGCgzBnVJ4S4pbeUUe",
                    Role         = "Admin",
                    CreatedAt    = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new AppUser
                {
                    Id           = 2,
                    Username     = "viewer",
                    PasswordHash = "$2b$12$wlln8Oe9N1fsvoD6kS6Me.vPqoVxaYCdqAMpejhB0nq2r//T31W1S",
                    Role         = "Viewer",
                    CreatedAt    = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
