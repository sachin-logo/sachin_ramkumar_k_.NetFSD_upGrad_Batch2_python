using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EMS.API.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Salary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    JoinDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "CreatedAt", "Department", "Designation", "Email", "FirstName", "JoinDate", "LastName", "Phone", "Salary", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2021, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "Software Engineer", "priya.prabhu@hexacore.com", "Priya", new DateTime(2021, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Prabhu", "9876543210", 850000m, "Active", new DateTime(2021, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2020, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Marketing", "Marketing Executive", "arjun.sharma@hexacore.com", "Arjun", new DateTime(2020, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sharma", "9123456780", 620000m, "Active", new DateTime(2020, 7, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2019, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc), "HR", "HR Executive", "neha.kapoor@hexacore.com", "Neha", new DateTime(2019, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Kapoor", "9988776655", 550000m, "Active", new DateTime(2019, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2022, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Finance", "Financial Analyst", "rahul.verma@hexacore.com", "Rahul", new DateTime(2022, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Verma", "9876512340", 720000m, "Active", new DateTime(2022, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2018, 6, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Operations", "Operations Manager", "sneha.prasad@hexacore.com", "Sneha", new DateTime(2018, 6, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Prasad", "9001234567", 950000m, "Active", new DateTime(2018, 6, 5, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2017, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "Senior Developer", "vikram.nair@hexacore.com", "Vikram", new DateTime(2017, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Raj", "9871234560", 1100000m, "Active", new DateTime(2017, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2023, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Marketing", "Content Strategist", "ananya.singh@hexacore.com", "Ananya", new DateTime(2023, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Singh", "9765432100", 580000m, "Inactive", new DateTime(2023, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2020, 4, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Finance", "Accounts Manager", "karthik.rajan@hexacore.com", "Karthik", new DateTime(2020, 4, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Rajan", "9654321098", 800000m, "Active", new DateTime(2020, 4, 17, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2021, 8, 22, 0, 0, 0, 0, DateTimeKind.Utc), "HR", "Talent Acquisition Lead", "divya.kumar@hexacore.com", "Divya", new DateTime(2021, 8, 22, 0, 0, 0, 0, DateTimeKind.Utc), "Kumar", "9543210987", 690000m, "Inactive", new DateTime(2021, 8, 22, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2019, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Finance", "Tax Consultant", "suresh.babu@hexacore.com", "Suresh", new DateTime(2019, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Babu", "9432109876", 760000m, "Inactive", new DateTime(2019, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2022, 10, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "QA Engineer", "meera.krishnan@hexacore.com", "Meera", new DateTime(2022, 10, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Krishnan", "9321098765", 730000m, "Active", new DateTime(2022, 10, 11, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2020, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Marketing", "Brand Manager", "lakshmi.chandran@hexacore.com", "Lakshmi", new DateTime(2020, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Chandran", "9210987654", 870000m, "Active", new DateTime(2020, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2021, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Operations", "Supply Chain Analyst", "amit.joshi@hexacore.com", "Amit", new DateTime(2021, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Joshi", "9109876543", 640000m, "Active", new DateTime(2021, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2023, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Engineering", "DevOps Engineer", "pooja.ghosh@hexacore.com", "Pooja", new DateTime(2023, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Ghosh", "9098765432", 980000m, "Active", new DateTime(2023, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2020, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Operations", "Logistics Coordinator", "ravi.menon@hexacore.com", "Ravi", new DateTime(2020, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Menon", "8987654321", 590000m, "Active", new DateTime(2020, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "PasswordHash", "Role", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "$2b$12$jei01JjrfO5xWk9y9awMEO8AjahTa7DspG9eGCgzBnVJ4S4pbeUUe", "Admin", "admin" },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "$2b$12$wlln8Oe9N1fsvoD6kS6Me.vPqoVxaYCdqAMpejhB0nq2r//T31W1S", "Viewer", "viewer" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Email",
                table: "Employees",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
