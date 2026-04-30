$(function () {

  function _boot() {
    uiService.populateDeptFilter(DEPARTMENTS);
    if (authService.isLoggedIn()) {
      _goTo('dashboard');
    } else {
      uiService.switchPage('signup');
    }
  }

  function _goTo(page) {
    if ((page === 'dashboard' || page === 'employees') && !authService.isLoggedIn()) {
      uiService.switchPage('signup');
      return;
    }
    uiService.switchPage(page);
    if (page === 'dashboard') {
      uiService.setNavUser(authService.getCurrentUser());
      _refreshDashboard();
    } else if (page === 'employees') {
      uiService.setNavUser(authService.getCurrentUser());
      _refreshEmployeeTable();
    }
  }

  function _refreshDashboard() {
    uiService.renderDashboardCards(dashboardService.getSummary());
    uiService.renderDepartmentBreakdown(dashboardService.getDepartmentBreakdown());
    uiService.renderRecentEmployees(dashboardService.getRecentEmployees(5));
  }

  let _search = '', _dept = 'All', _status = 'All';
  let _sortField = null, _sortDir = 'asc';

  function _refreshEmployeeTable() {
    uiService.showSpinner();
    setTimeout(function () {
      const filtered = employeeService.applyFilters(_search, _dept, _status);
      const sorted   = _sortField
        ? employeeService.sortBy(filtered, _sortField, _sortDir)
        : filtered;
      uiService.renderEmployeeTable(sorted, employeeService.getAll().length);
    }, 80);
  }

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

  $(document).on('submit', '#signupForm', function (e) {
    e.preventDefault();
    uiService.clearInlineErrors();
    const formData = {
      username:        $('#signupUsername').val().trim(),
      password:        $('#signupPassword').val(),
      confirmPassword: $('#signupConfirmPassword').val(),
    };
    const { valid, errors } = validationService.validateAuthForm(formData, 'signup');
    if (!valid) { uiService.showInlineErrors(errors); return; }
    const result = authService.signup(formData.username, formData.password);
    if (!result.success) { uiService.showInlineErrors(result.errors); return; }
    uiService.showToast('Account created! Please sign in.', 'success');
    $('#signupForm')[0].reset();
    setTimeout(() => _goTo('login'), 1400);
  });

  $(document).on('submit', '#loginForm', function (e) {
    e.preventDefault();
    uiService.clearInlineErrors();
    $('#loginError').hide();
    const formData = {
      username: $('#loginUsername').val().trim(),
      password: $('#loginPassword').val(),
    };
    const { valid, errors } = validationService.validateAuthForm(formData, 'login');
    if (!valid) { uiService.showInlineErrors(errors); return; }
    const result = authService.login(formData.username, formData.password);
    if (!result.success) {
      $('#loginError').text(result.error).show();
      return;
    }
    $('#loginForm')[0].reset();
    _goTo('dashboard');
  });

  $(document).on('click', '#btnLogout, #mBtnLogout', function () {
    authService.logout();
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

  $(document).on('input', '#searchInput', function () {
    _search = $(this).val();
    _refreshEmployeeTable();
  });

  $(document).on('change', '#deptFilter', function () {
    _dept = $(this).val();
    _refreshEmployeeTable();
  });

  $(document).on('click', '.status-btn', function () {
    $('.status-btn').removeClass('status-btn--active active');
    $(this).addClass('status-btn--active');
    _status = $(this).data('status');
    _refreshEmployeeTable();
  });

  $(document).on('click', '.sortable', function () {
    const field = $(this).data('sort');
    _sortDir    = (_sortField === field && _sortDir === 'asc') ? 'desc' : 'asc';
    _sortField  = field;
    $('.sortable .sort-icon').text('\u21c5');
    $(this).find('.sort-icon').text(_sortDir === 'asc' ? '\u25b2' : '\u25bc');
    _refreshEmployeeTable();
  });

  $(document).on('click', '#saveEmployeeBtn', function () {
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
    if (mode === 'add') {
      employeeService.add(formData);
      uiService.showToast('Employee added successfully!', 'success');
    } else {
      employeeService.update(editId, formData);
      uiService.showToast('Employee updated successfully!', 'success');
    }
    bootstrap.Modal.getInstance('#employeeModal').hide();
    uiService.clearForm();
    _refreshDashboard();
    _refreshEmployeeTable();
  });

  $(document).on('click', '.btn-view', function () {
    const emp = employeeService.getById($(this).data('id'));
    if (emp) uiService.showModal('view', emp);
  });

  $(document).on('click', '.btn-edit', function () {
    const emp = employeeService.getById($(this).data('id'));
    if (emp) uiService.showModal('edit', emp);
  });

  $(document).on('click', '.btn-delete', function () {
    const emp = employeeService.getById($(this).data('id'));
    if (emp) uiService.showModal('delete', emp);
  });

  $(document).on('click', '#confirmDeleteBtn', function () {
    employeeService.remove($(this).data('id'));
    bootstrap.Modal.getInstance('#deleteConfirmModal').hide();
    uiService.showToast('Employee removed successfully.', 'danger');
    _refreshDashboard();
    _refreshEmployeeTable();
  });

  $(document).on('input change', '.is-invalid', function () {
    $(this).removeClass('is-invalid');
    const $err = $('#err-' + this.id);
    if ($err.length) $err.text('');
    else $(this).closest('.col-md-6, .mb-3')
      .find('.invalid-feedback').first().hide().text('');
  });

  _boot();
});
