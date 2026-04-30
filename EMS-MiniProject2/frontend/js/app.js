// app.js — UPDATED in Mini Project 2
// All data operations are now async/await.
// Pagination state (_state.page, _state.pageSize) tracked and sent with every request.
// Debounced search (350ms). Server-side filter/sort/pagination.

$(function () {

  const DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];

  // ── Application state ─────────────────────────────────────────────────────
  const _state = {
    search:   '',
    dept:     '',
    status:   '',
    sortBy:   'name',
    sortDir:  'asc',
    page:     1,
    pageSize: PAGE_SIZE,  // from config.js
  };

  // ── Boot ──────────────────────────────────────────────────────────────────
  function _boot() {
    uiService.populateDeptFilter(DEPARTMENTS);
    if (AuthService.isLoggedIn()) {
      _goTo('dashboard');
    } else {
      uiService.switchPage('signup');
    }
  }

  function _goTo(page) {
    if ((page === 'dashboard' || page === 'employees') && !AuthService.isLoggedIn()) {
      uiService.switchPage('signup');
      return;
    }
    uiService.switchPage(page);
    if (page === 'dashboard') {
      uiService.setNavUser(AuthService.getCurrentUser());
      uiService.applyRoleUI();
      _refreshDashboard();
    } else if (page === 'employees') {
      uiService.setNavUser(AuthService.getCurrentUser());
      uiService.applyRoleUI();
      _state.page = 1;
      _refreshEmployeeTable();
    }
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  async function _refreshDashboard() {
    try {
      const data = await dashboardService.getSummary();
      uiService.renderDashboardCards(data);
      uiService.renderDepartmentBreakdown(data.departmentBreakdown);
      uiService.renderRecentEmployees(data.recentEmployees);
    } catch (err) {
      _handleAuthError(err);
      uiService.showToast('Failed to load dashboard.', 'danger');
    }
  }

  // ── Employee table ────────────────────────────────────────────────────────
  async function _refreshEmployeeTable() {
    uiService.showSpinner();
    try {
      const pagedResult = await employeeService.getAll({
        search:   _state.search,
        department: _state.dept,
        status:   _state.status,
        sortBy:   _state.sortBy,
        sortDir:  _state.sortDir,
        page:     _state.page,
        pageSize: _state.pageSize,
      });
      uiService.renderEmployeeTable(pagedResult, (newPage) => {
        _state.page = newPage;
        _refreshEmployeeTable();
      });
    } catch (err) {
      _handleAuthError(err);
      uiService.showToast('Failed to load employees.', 'danger');
    }
  }

  // ── Auth error redirect ───────────────────────────────────────────────────
  function _handleAuthError(err) {
    if (err?.status === 401) {
      AuthService.logout();
      uiService.showToast('Session expired. Please log in again.', 'warning');
      _goTo('signup');
    }
  }

  // ── Debounce helper ───────────────────────────────────────────────────────
  function _debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  $(document).on('click', '#goToLogin', function (e) {
    e.preventDefault();
    $('#signupForm')[0].reset();
    _goTo('login');
  });

  $(document).on('click', '#goToSignup', function (e) {
    e.preventDefault();
    $('#loginForm')[0].reset();
    _goTo('signup');
  });

  $(document).on('click', '#navDashboard, #mNavDashboard', function (e) {
    e.preventDefault();
    $('#navMobileMenu').hide();
    _goTo('dashboard');
  });

  $(document).on('click', '#navEmployees, #mNavEmployees', function (e) {
    e.preventDefault();
    $('#navMobileMenu').hide();
    _goTo('employees');
  });

  $(document).on('click', '#navHamburger', function () {
    $('#navMobileMenu').toggle();
  });

  $(document).on('click', '#navAddEmployee, #mNavAddEmployee, #dashAddEmployee, #empAddEmployee', function () {
    $('#navMobileMenu').hide();
    uiService.showModal('add', null);
  });

  // ── Auth forms ────────────────────────────────────────────────────────────
  $(document).on('submit', '#signupForm', async function (e) {
    e.preventDefault();
    uiService.clearInlineErrors();

    const formData = {
      username:        $('#signupUsername').val().trim(),
      password:        $('#signupPassword').val(),
      confirmPassword: $('#signupConfirmPassword').val(),
    };

    const { valid, errors } = validationService.validateAuthForm(formData, 'signup');
    if (!valid) { uiService.showInlineErrors(errors); return; }

    // Determine role from optional role select (if present), default Viewer
    const role = $('#signupRole').val() || 'Viewer';

    const result = await AuthService.signup(formData.username, formData.password, role);
    if (!result.success) { uiService.showInlineErrors(result.errors); return; }

    uiService.showToast('Account created! Please sign in.', 'success');
    $('#signupForm')[0].reset();
    setTimeout(() => _goTo('login'), 1400);
  });

  $(document).on('submit', '#loginForm', async function (e) {
    e.preventDefault();
    uiService.clearInlineErrors();
    $('#loginError').hide();

    const formData = {
      username: $('#loginUsername').val().trim(),
      password: $('#loginPassword').val(),
    };

    const { valid, errors } = validationService.validateAuthForm(formData, 'login');
    if (!valid) { uiService.showInlineErrors(errors); return; }

    const result = await AuthService.login(formData.username, formData.password);
    if (!result.success) {
      $('#loginError').text(result.error).show();
      return;
    }

    $('#loginForm')[0].reset();
    _goTo('dashboard');
  });

  $(document).on('click', '#btnLogout, #mBtnLogout', function () {
    AuthService.logout();
    _goTo('signup');
  });

  // ── Search / filter / sort ────────────────────────────────────────────────
  $(document).on('input', '#searchInput', _debounce(function () {
    _state.search = $(this).val();
    _state.page   = 1;
    _refreshEmployeeTable();
  }, 350));

  $(document).on('change', '#deptFilter', function () {
    _state.dept = $(this).val();
    _state.page = 1;
    _refreshEmployeeTable();
  });

  $(document).on('click', '.status-btn', function () {
    $('.status-btn').removeClass('status-btn--active active');
    $(this).addClass('status-btn--active');
    _state.status = $(this).data('status') === 'All' ? '' : $(this).data('status');
    _state.page   = 1;
    _refreshEmployeeTable();
  });

  $(document).on('click', '.sortable', function () {
    const field = $(this).data('sort');
    _state.sortDir = (_state.sortBy === field && _state.sortDir === 'asc') ? 'desc' : 'asc';
    _state.sortBy  = field;
    _state.page    = 1;
    $('.sortable .sort-icon').text('⇅');
    $(this).find('.sort-icon').text(_state.sortDir === 'asc' ? '▲' : '▼');
    _refreshEmployeeTable();
  });

  // ── CRUD ──────────────────────────────────────────────────────────────────
  $(document).on('click', '#saveEmployeeBtn', async function () {
    uiService.clearInlineErrors();
    const mode   = $(this).data('mode');
    const editId = $(this).data('id');

    const formData = {
      firstName:   $('#empFirstName').val().trim(),
      lastName:    $('#empLastName').val().trim(),
      email:       $('#empEmail').val().trim(),
      phone:       $('#empPhone').val().trim(),
      department:  $('#empDepartment').val(),
      designation: $('#empDesignation').val().trim(),
      salary:      Number($('#empSalary').val()),
      joinDate:    $('#empJoinDate').val(),
      status:      $('#empStatus').val(),
    };

    const { valid, errors } = validationService.validateEmployeeForm(
      formData, mode === 'edit' ? editId : null
    );
    if (!valid) { uiService.showInlineErrors(errors); return; }

    try {
      if (mode === 'add') {
        await employeeService.add(formData);
        uiService.showToast('Employee added successfully!', 'success');
      } else {
        await employeeService.update(editId, formData);
        uiService.showToast('Employee updated successfully!', 'success');
      }
      bootstrap.Modal.getInstance('#employeeModal').hide();
      uiService.clearForm();
      _state.page = 1;
      await _refreshDashboard();
      await _refreshEmployeeTable();
    } catch (err) {
      if (err.status === 409) {
        uiService.showInlineErrors(validationService.mapServerErrors(err.body));
      } else {
        _handleAuthError(err);
        uiService.showToast(err.message || 'Operation failed.', 'danger');
      }
    }
  });

  $(document).on('click', '.btn-view', async function () {
    try {
      const emp = await employeeService.getById($(this).data('id'));
      if (emp) uiService.showModal('view', emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'danger'); }
  });

  $(document).on('click', '.btn-edit', async function () {
    try {
      const emp = await employeeService.getById($(this).data('id'));
      if (emp) uiService.showModal('edit', emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'danger'); }
  });

  $(document).on('click', '.btn-delete', async function () {
    try {
      const emp = await employeeService.getById($(this).data('id'));
      if (emp) uiService.showModal('delete', emp);
    } catch (err) { uiService.showToast('Could not load employee.', 'danger'); }
  });

  $(document).on('click', '#confirmDeleteBtn', async function () {
    const id = $(this).data('id');
    try {
      await employeeService.remove(id);
      bootstrap.Modal.getInstance('#deleteConfirmModal').hide();
      uiService.showToast('Employee removed successfully.', 'danger');
      // Navigate to page 1 if the deleted record was the last on current page
      _state.page = 1;
      await _refreshDashboard();
      await _refreshEmployeeTable();
    } catch (err) {
      _handleAuthError(err);
      uiService.showToast('Failed to delete employee.', 'danger');
    }
  });

  $(document).on('input change', '.is-invalid', function () {
    $(this).removeClass('is-invalid');
    const $err = $('#err-' + this.id);
    if ($err.length) $err.text('');
    else $(this).closest('.col-md-6, .mb-3').find('.invalid-feedback').first().hide().text('');
  });

  _boot();
});
