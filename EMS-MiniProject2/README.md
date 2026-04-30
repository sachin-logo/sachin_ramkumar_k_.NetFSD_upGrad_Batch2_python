# Employee Management System — Mini Project 2

**Name:** Sachin Ramkumar  
**Batch:** Batch 2  

---

## Overview

Mini Project 2 evolves the Mini Project 1 frontend into a true full-stack application by replacing the static in-memory data layer with a **.NET 10 Web API** backed by **SQL Server 2022**, managed through **Entity Framework Core (Code First)**.

---

## Tech Stack

| Layer            | Technology                                    |
|------------------|-----------------------------------------------|
| Backend          | .NET 10 Web API                               |
| ORM              | Entity Framework Core 9.x (Code First)        |
| Database         | SQL Server 2022 (local)                       |
| Password Hashing | BCrypt.Net-Next v4.0.3                        |
| API Docs         | Swagger / Swashbuckle 7.x (OpenAPI 3.0)       |
| Frontend         | HTML5, CSS3, Bootstrap 5, jQuery 3            |
| Testing          | NUnit 4 + Moq + EF Core InMemory              |

---

## Default Login Credentials (seeded automatically)

| Username | Password   | Role   | Access                     |
|----------|------------|--------|----------------------------|
| admin    | admin123   | Admin  | Full CRUD access           |
| viewer   | viewer123  | Viewer | Read-only access           |

---

## Project Structure

```
EMS-MiniProject2/
├── EMS.API/
│   ├── Controllers/
│   │   ├── EmployeesController.cs   ← GET/POST/PUT/DELETE + /dashboard
│   │   └── AuthController.cs        ← POST /auth/register + /auth/login
│   ├── Data/
│   │   └── AppDbContext.cs          ← DbContext + 15 employees + 2 users seeded
│   ├── DTOs/
│   │   └── EmployeeDtos.cs          ← All request/response/paged DTOs
│   ├── Models/
│   │   ├── Employee.cs
│   │   └── AppUser.cs
│   ├── Services/
│   │   ├── IEmployeeRepository.cs   ← Interface (enables Moq unit tests)
│   │   ├── EmployeeRepository.cs    ← EF Core SQL implementation
│   │   ├── EmployeeService.cs       ← Business logic
│   │   └── AuthService.cs           ← BCrypt + JWT token generation
│   ├── appsettings.json             ← Connection string + JWT config
│   ├── Program.cs                   ← DI, CORS, JWT, Swagger setup
│   └── EMS.API.csproj               ← .NET 10 project file
├── EMS.Tests/
│   ├── Services/
│   │   ├── EmployeeServiceTests.cs  ← Pure unit tests with Moq
│   │   └── AuthServiceTests.cs      ← Auth tests (Moq + InMemory DB)
│   ├── Controllers/
│   │   └── EmployeesControllerTests.cs
│   ├── Integration/
│   │   └── EmployeeIntegrationTests.cs ← EF Core InMemory integration tests
│   └── EMS.Tests.csproj             ← .NET 10 test project
├── frontend/
│   ├── index.html                   ← Updated: pagination, role badge, viewer notice
│   ├── css/styles.css
│   └── js/
│       ├── config.js                ← NEW: API_BASE_URL constant
│       ├── storageService.js        ← REPLACED: real fetch() calls
│       ├── authService.js           ← UPDATED: JWT stored in-memory
│       ├── employeeService.js       ← UPDATED: async/await delegates
│       ├── validationService.js     ← MINOR: mapServerErrors() added
│       ├── dashboardService.js      ← UPDATED: single API call
│       ├── uiService.js             ← UPDATED: pagination + role UI
│       └── app.js                   ← UPDATED: async/await + pagination state
├── EMS.sln
└── README.md
```

---

## HOW TO RUN — Step by Step

### Prerequisites — Install these first

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | **10.0** | https://dotnet.microsoft.com/download |
| SQL Server | 2022 (Express is free) | https://www.microsoft.com/en-us/sql-server/sql-server-downloads |
| dotnet-ef CLI tool | Latest | Run: `dotnet tool install --global dotnet-ef` |
| VS Code + Live Server extension | Any | VS Code Marketplace |

---

### STEP 1 — Verify .NET 10 is installed

Open a terminal and run:
```bash
dotnet --version
```
You should see `10.x.x`. If not, install .NET 10 SDK from the link above.

---

### STEP 2 — Configure the Database Connection String

Open `EMS.API/appsettings.json` and check:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=EMSDashboard;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**If you use SQL Server Express**, change it to:
```json
"Server=localhost\\SQLEXPRESS;Database=EMSDashboard;Trusted_Connection=True;TrustServerCertificate=True;"
```

---

### STEP 3 — Install NuGet Packages

Open terminal inside the `EMS-MiniProject2/` folder:

```bash
cd EMS.API
dotnet restore
```

This downloads all packages automatically (EF Core 9, JWT Bearer 9, BCrypt, Swagger).

---

### STEP 4 — Run EF Core Migrations (Creates the Database + Seeds Data)

Still inside `EMS.API/` folder:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This will:
- Create the `EMSDashboard` database in SQL Server
- Create `Employees` and `Users` tables
- Seed **15 employees** and **2 users** (admin/admin123 and viewer/viewer123)

> **Note:** Run `dotnet ef database update` every time before the first run. Do NOT auto-run on startup — this is intentional.

If you get "dotnet ef not found", install it first:
```bash
dotnet tool install --global dotnet-ef
```

---

### STEP 5 — Start the API

```bash
cd EMS.API
dotnet run
```

You should see output like:
```
Now listening on: http://localhost:5000
```

**API Base URL:** http://localhost:5000/api  
**Swagger UI:**   http://localhost:5000/swagger  

Keep this terminal running.

---

### STEP 6 — Open the Frontend

Open a **new terminal** or use VS Code:

1. In VS Code, right-click `frontend/index.html`
2. Select **"Open with Live Server"**
3. It opens at `http://localhost:5500` (or `http://127.0.0.1:5500`)

Both origins are whitelisted in the API's CORS policy.

**Or** simply open `frontend/index.html` directly in Chrome — file:// origin is also whitelisted.

---

### STEP 7 — Login and Test

- Go to `http://localhost:5500`
- Login with **admin / admin123** → Full access (Add, Edit, Delete)
- Login with **viewer / viewer123** → Read-only (View only, no write buttons)

---

### STEP 8 — Run Tests

Open a new terminal inside `EMS-MiniProject2/`:

```bash
dotnet test EMS.Tests
```

Expected output: **16 tests passing** (unit + integration)

---

## API Endpoints Reference

### Authentication (no token required)

| Method | Endpoint            | Body                          | Returns                    |
|--------|---------------------|-------------------------------|----------------------------|
| POST   | /api/auth/register  | `{username, password, role}`  | `{success, username, role}` |
| POST   | /api/auth/login     | `{username, password}`        | `{success, username, role, token}` |

### Employees (JWT Bearer token required)

| Method | Endpoint                  | Role     | Description                            |
|--------|---------------------------|----------|----------------------------------------|
| GET    | /api/employees            | All      | Paginated list (search/filter/sort)    |
| GET    | /api/employees/{id}       | All      | Single employee by ID                  |
| GET    | /api/employees/dashboard  | All      | KPIs + dept breakdown + recent 5 emps  |
| POST   | /api/employees            | Admin    | Create new employee                    |
| PUT    | /api/employees/{id}       | Admin    | Update employee                        |
| DELETE | /api/employees/{id}       | Admin    | Delete employee                        |

### GET /api/employees — Query Parameters

| Param      | Default | Description                                   |
|------------|---------|-----------------------------------------------|
| search     | —       | Searches firstName+lastName and email         |
| department | —       | Engineering / Marketing / HR / Finance / Operations |
| status     | —       | Active / Inactive                             |
| sortBy     | name    | name / salary / joinDate                      |
| sortDir    | asc     | asc / desc                                    |
| page       | 1       | 1-based page number                           |
| pageSize   | 10      | Records per page (max 100)                    |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `dotnet ef` not found | Run `dotnet tool install --global dotnet-ef` |
| SQL Server connection refused | Start SQL Server service; check connection string |
| CORS error in browser | Make sure API is running on port 5000 |
| 401 Unauthorized | Token expired — log out and log in again |
| Migration already exists | Run `dotnet ef database update` (skip add-migration) |
| Port 5000 in use | Change port in `appsettings.json` and update `config.js` |

---

## Submission Rule

Before submitting:
1. `dotnet ef database update` — in EMS.API directory
2. `dotnet run` — start the API  
3. Open `frontend/index.html` with Live Server  
4. Verify login works end-to-end against SQL Server
