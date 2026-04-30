                   EMPLOYEE MANAGEMENT SYSTEM
                         Mini Project 1
================================================================================

NAME    : Sachin Ramkumar K
BATCH   : Batch-2(.Net with python)
PROJECT : Employee Management System — Frontend Only (HTML, CSS, JS)

================================================================================
PROJECT OVERVIEW


A browser-based Employee Management System built using HTML5, CSS3,
Bootstrap 5, JavaScript ES6+, and jQuery 3.x.

The application allows an Admin to:
  - Sign up and log in with in-memory authentication
  - View a dashboard with KPI cards and department breakdown
  - Add, View, Edit, and Delete employee records
  - Search employees by name or email
  - Filter by department and status
  - Sort by name, salary, or join date

All data is stored in memory using data.js — no backend or database required.

================================================================================
PROJECT STRUCTURE

employee-management-dashboard/
  index.html                  Main entry point — open this to run the app
  README.txt                  This file
  package.json                Node project config (for running tests only)
  jest.config.js              Jest test configuration

  css/
    styles.css                All custom styles

  js/
    data.js                   Seed data — 15 employees + admin credentials
    storageService.js         In-memory data store (only file that touches data)
    authService.js            Signup, login, logout, session management
    employeeService.js        Employee business logic — CRUD, search, filter, sort
    validationService.js      Form validation logic
    dashboardService.js       Dashboard KPI and breakdown computations
    uiService.js              All DOM rendering and page switching
    app.js                    Event orchestrator — wires everything together

  tests/
    employeeService.test.js   Unit tests for employeeService
    authService.test.js       Unit tests for authService
    dashboardService.test.js  Unit tests for dashboardService

================================================================================
HOW TO RUN THE APP

STEP 1 — Unzip the project folder

STEP 2 — Open index.html in your browser
          Simply double-click or run with the browser the index.html file
          It will open in Chrome, Firefox, or Edge automatically

STEP 3 — The Signup page appears first
          Create a new account OR use the default credentials below

DEFAULT LOGIN CREDENTIALS:
  Username : admin
  Password : admin123

That is all — no terminal, no server, no build step needed.

================================================================================
HOW TO RUN THE TESTS

REQUIREMENT: Node.js must be installed on your computer
             Download from https://nodejs.org (choose LTS version)

STEP 1 — Open a terminal inside the project folder(employee-management-dashboard)

          Windows : Right-click inside the folder and click
                    "Open in Terminal" or "Open PowerShell here"

          Mac     : Right-click folder and click "New Terminal at Folder"
                    or open Terminal and type: cd path/to/folder

STEP 2 — Install dependencies (only needed once)

          npm install

STEP 3 — Run all tests

          npm test

EXPECTED OUTPUT:
  Tests Suites : 3 passed
  Tests        : 59 passed
  All tests should show green checkmarks with no failures

================================================================================
TECHNOLOGY STACK

  HTML5          Single-page application structure
  CSS3           Custom styling, flexbox, grid, animations, responsive design
  Bootstrap 5    Navbar, modals, form controls, grid system
  JavaScript     ES6+ — const/let, arrow functions, template literals,
                 destructuring, spread operator, IIFE modules
  jQuery 3.x     DOM events, show/hide, form handling
  Bootstrap Icons Icon library used throughout the UI
  Jest           Unit testing framework (for npm test only)

================================================================================
ARCHITECTURE NOTES

The project follows a modular service-oriented architecture:

  data.js           Never modified at runtime — source of truth only
        |
  storageService    Only module that reads/writes employee array
        |
  employeeService   Business logic (search, filter, sort, CRUD)
  authService       Authentication logic (signup, login, session)
  validationService Form validation rules
  dashboardService  KPI and breakdown calculations
        |
  uiService         All DOM rendering — receives data, displays it
        |
  app.js            Event orchestrator — no business logic, no raw DOM

================================================================================
END OF README.....

