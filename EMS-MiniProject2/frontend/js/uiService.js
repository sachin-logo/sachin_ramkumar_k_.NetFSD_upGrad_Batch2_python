// uiService.js — UPDATED in Mini Project 2
// renderEmployeeTable() now accepts a PagedResult envelope and renders
// a Bootstrap pagination bar. applyRoleUI() shows/hides write buttons
// based on Admin/Viewer role from AuthService.

const uiService = (function () {

  function _initials(f, l) {
    return ((f[0] || '') + (l[0] || '')).toUpperCase();
  }

  function _avatarColor(name) {
    const palette = ['#4a90d9','#e07b54','#5cb85c','#d9534f','#f0ad4e','#5bc0de','#9b59b6','#1abc9c'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }

  function _formatSalary(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function _formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function _deptClass(dept) {
    const m = {
      Engineering: 'badge-engineering', Marketing: 'badge-marketing',
      HR: 'badge-hr', Finance: 'badge-finance', Operations: 'badge-operations',
    };
    return m[dept] || 'bg-secondary';
  }

  function switchPage(page) {
    $('#signupView').hide();
    $('#loginView').hide();
    $('#appView').hide();

    if (page === 'signup') {
      $('#signupView').show();
      clearInlineErrors();
    } else if (page === 'login') {
      $('#loginView').show();
      $('#loginError').hide().text('');
      clearInlineErrors();
    } else if (page === 'dashboard') {
      $('#appView').show();
      $('#dashboardSection').show();
      $('#employeesSection').hide();
      $('#navDashboard').addClass('active');
      $('#navEmployees').removeClass('active');
      $('#mNavDashboard').addClass('active');
      $('#mNavEmployees').removeClass('active');
    } else if (page === 'employees') {
      $('#appView').show();
      $('#dashboardSection').hide();
      $('#employeesSection').show();
      $('#navEmployees').addClass('active');
      $('#navDashboard').removeClass('active');
      $('#mNavEmployees').addClass('active');
      $('#mNavDashboard').removeClass('active');
    }
  }

  function setNavUser(username) {
    $('#navUsername').text(username);
  }

  function showSpinner() {
    $('#employeeTableBody').html(`
      <tr>
        <td colspan="10" style="text-align:center;padding:32px 0;">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span style="color:#94a3b8;font-size:13px;">Loading employees…</span>
        </td>
      </tr>`);
  }

  // Accepts a PagedResult envelope from the API
  function renderEmployeeTable(pagedResult, onPageChange) {
    const employees  = pagedResult?.data  || [];
    const totalCount = pagedResult?.totalCount || 0;
    const page       = pagedResult?.page       || 1;
    const pageSize   = pagedResult?.pageSize   || 10;
    const totalPages = pagedResult?.totalPages  || 1;
    const isAdmin    = AuthService.isAdmin();

    const $tbody = $('#employeeTableBody');

    if (!employees || employees.length === 0) {
      $tbody.html(`
        <tr>
          <td colspan="10" style="text-align:center;padding:40px 0;">
            <i class="bi bi-person-x" style="font-size:40px;color:#cbd5e0;display:block;margin-bottom:8px;"></i>
            <div style="font-weight:600;color:#94a3b8;">No employees found</div>
            <div style="font-size:12px;color:#a0aec0;margin-top:4px;">Try adjusting your search or filters</div>
          </td>
        </tr>`);
      $('#showingCount').text('Showing 0 employees');
      _renderPagination(page, totalPages, onPageChange);
      return;
    }

    const rows = employees.map((e, idx) => {
      const bg       = _avatarColor(e.firstName + e.lastName);
      const rowClass = idx % 2 !== 0 ? 'row-alt' : '';
      const adminBtns = isAdmin
        ? `<button class="btn-edit"   data-id="${e.id}" title="Edit"><i class="bi bi-pencil"></i></button>
           <button class="btn-delete" data-id="${e.id}" title="Delete"><i class="bi bi-trash"></i></button>`
        : '';
      return `
        <tr class="${rowClass}">
          <td style="color:#94a3b8;font-size:12px;">#${e.id}</td>
          <td>
            <div class="emp-avatar" style="background:${bg};">
              ${_initials(e.firstName, e.lastName)}
            </div>
          </td>
          <td style="font-weight:600;">${e.firstName} ${e.lastName}</td>
          <td style="color:#718096;font-size:12px;">${e.email}</td>
          <td><span class="dept-badge ${_deptClass(e.department)}">${e.department}</span></td>
          <td>${e.designation}</td>
          <td style="font-weight:600;">${_formatSalary(e.salary)}</td>
          <td style="color:#718096;font-size:12px;">${_formatDate(e.joinDate)}</td>
          <td>
            <span class="status-badge ${e.status === 'Active' ? 'status-active' : 'status-inactive'}">
              ${e.status}
            </span>
          </td>
          <td>
            <div class="action-btns">
              <button class="btn-view" data-id="${e.id}" title="View"><i class="bi bi-eye"></i></button>
              ${adminBtns}
            </div>
          </td>
        </tr>`;
    }).join('');

    $tbody.html(rows);
    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, totalCount);
    $('#showingCount').text(`Showing ${start}–${end} of ${totalCount} employees`);
    _renderPagination(page, totalPages, onPageChange);
  }

  function _renderPagination(page, totalPages, onPageChange) {
    const $bar = $('#paginationBar');
    if (!$bar.length) return;
    if (totalPages <= 1) { $bar.html(''); return; }

    let html = '<ul class="pagination pagination-sm mb-0 justify-content-center">';

    // Prev
    html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page - 1}">‹ Prev</a></li>`;

    // Page numbers (show max 5 around current)
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    if (start > 1) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    if (end < totalPages) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;

    // Next
    html += `<li class="page-item ${page >= totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page + 1}">Next ›</a></li>`;

    html += '</ul>';
    $bar.html(html);

    // Bind click events
    $bar.off('click').on('click', '.page-link', function (e) {
      e.preventDefault();
      const p = parseInt($(this).data('page'), 10);
      if (p && p !== page && p >= 1 && p <= totalPages && typeof onPageChange === 'function') {
        onPageChange(p);
      }
    });
  }

  // NEW: show/hide Admin-only UI elements based on role
  function applyRoleUI() {
    const isAdmin = AuthService.isAdmin();
    // Role badge in navbar
    const roleBadgeClass = isAdmin ? 'badge bg-danger ms-1' : 'badge bg-secondary ms-1';
    $('#navRoleBadge').attr('class', roleBadgeClass).text(isAdmin ? 'Admin' : 'Viewer');
    // Add Employee button
    if (isAdmin) {
      $('#navAddEmployee, #mNavAddEmployee, #dashAddEmployee, #empAddEmployee').show();
      $('#viewerNotice').hide();
    } else {
      $('#navAddEmployee, #mNavAddEmployee, #dashAddEmployee, #empAddEmployee').hide();
      $('#viewerNotice').show();
    }
  }

  function renderDashboardCards(summary) {
    $('#kpiTotal').text(summary.total);
    $('#kpiActive').text(summary.active);
    $('#kpiInactive').text(summary.inactive);
    $('#kpiDepts').text(summary.departments);
  }

  function renderDepartmentBreakdown(data) {
    if (!data || data.length === 0) {
      $('#deptBreakdownBody').html(
        '<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No data</td></tr>'
      );
      return;
    }
    $('#deptBreakdownBody').html(data.map(d => `
      <tr>
        <td><span class="dept-badge ${_deptClass(d.department)}">${d.department}</span></td>
        <td style="font-weight:600;">${d.count}</td>
        <td style="min-width:120px;">
          <div class="dept-bar-wrap">
            <div class="dept-bar-fill ${_deptClass(d.department)}" style="width:${d.percent}%;"></div>
          </div>
        </td>
        <td style="color:#718096;font-size:12px;">${d.percent}%</td>
      </tr>`).join(''));
  }

  function renderRecentEmployees(employees) {
    if (!employees || employees.length === 0) {
      $('#recentEmployeesList').html('<p style="padding:16px;color:#94a3b8;font-size:13px;">No employees yet.</p>');
      return;
    }
    $('#recentEmployeesList').html(employees.map(e => {
      const bg = _avatarColor(e.firstName + e.lastName);
      return `
        <div class="recent-item">
          <div class="emp-avatar" style="background:${bg};">
            ${_initials(e.firstName, e.lastName)}
          </div>
          <div class="recent-item-info">
            <div class="recent-item-name">${e.firstName} ${e.lastName}</div>
            <div class="recent-item-role">${e.designation}</div>
          </div>
          <div class="recent-item-badges">
            <span class="dept-badge ${_deptClass(e.department)}">${e.department}</span>
            <span class="status-badge ${e.status === 'Active' ? 'status-active' : 'status-inactive'}">${e.status}</span>
          </div>
        </div>`;
    }).join(''));
  }

  function showModal(type, data) {
    if (type === 'add') {
      clearForm();
      $('#employeeModalLabel').html('<i class="bi bi-person-plus me-2"></i>Add Employee');
      $('#saveEmployeeBtn').text('Save Employee').data('mode', 'add').data('id', null);
      new bootstrap.Modal('#employeeModal').show();
    } else if (type === 'edit') {
      populateForm(data);
      $('#employeeModalLabel').html('<i class="bi bi-pencil me-2"></i>Edit Employee');
      $('#saveEmployeeBtn').text('Update Employee').data('mode', 'edit').data('id', data.id);
      new bootstrap.Modal('#employeeModal').show();
    } else if (type === 'view') {
      _populateViewModal(data);
      new bootstrap.Modal('#viewEmployeeModal').show();
    } else if (type === 'delete') {
      $('#deleteEmployeeName').text(data.firstName + ' ' + data.lastName);
      $('#confirmDeleteBtn').data('id', data.id);
      new bootstrap.Modal('#deleteConfirmModal').show();
    }
  }

  function _populateViewModal(e) {
    const bg = _avatarColor(e.firstName + e.lastName);
    $('#viewAvatar').css('background', bg).text(_initials(e.firstName, e.lastName));
    $('#viewFullName').text(e.firstName + ' ' + e.lastName);
    $('#viewDeptBadge').attr('class', `dept-badge ${_deptClass(e.department)}`).text(e.department);
    $('#viewEmail').text(e.email);
    $('#viewPhone').text(e.phone);
    $('#viewDesignation').text(e.designation);
    $('#viewSalary').text(_formatSalary(e.salary));
    $('#viewJoinDate').text(_formatDate(e.joinDate));
    $('#viewStatus').attr('class', `status-badge ${e.status === 'Active' ? 'status-active' : 'status-inactive'}`).text(e.status);
  }

  function populateForm(e) {
    $('#empFirstName').val(e.firstName);
    $('#empLastName').val(e.lastName);
    $('#empEmail').val(e.email);
    $('#empPhone').val(e.phone);
    $('#empDepartment').val(e.department);
    $('#empDesignation').val(e.designation);
    $('#empSalary').val(e.salary);
    // Format date as YYYY-MM-DD for date input
    const d = e.joinDate ? new Date(e.joinDate) : null;
    $('#empJoinDate').val(d ? d.toISOString().split('T')[0] : '');
    $('#empStatus').val(e.status);
  }

  function clearForm() {
    $('#employeeForm')[0].reset();
    clearInlineErrors();
  }

  function showToast(message, type = 'success') {
    const iconMap = {
      success: 'bi-check-circle-fill toast-icon-success',
      danger:  'bi-x-circle-fill toast-icon-danger',
      warning: 'bi-exclamation-triangle-fill toast-icon-warning',
      info:    'bi-info-circle-fill toast-icon-info',
    };
    $('#toastMessage').text(message);
    $('#toastIcon').attr('class', `bi ${iconMap[type] || iconMap.success}`);
    const $toast = $('#appToast');
    $toast.stop(true).fadeIn(200);
    setTimeout(() => $toast.fadeOut(400), 3200);
  }

  function showInlineErrors(errors) {
    clearInlineErrors();
    const idMap = {
      firstName: '#empFirstName', lastName: '#empLastName', email: '#empEmail',
      phone: '#empPhone', department: '#empDepartment', designation: '#empDesignation',
      salary: '#empSalary', joinDate: '#empJoinDate', status: '#empStatus',
      username: '#signupUsername, #loginUsername', password: '#signupPassword, #loginPassword',
      confirmPassword: '#signupConfirmPassword',
    };
    Object.entries(errors).forEach(([field, msg]) => {
      if (field === '_general') { showToast(msg, 'danger'); return; }
      const sel = idMap[field];
      if (!sel) return;
      $(sel).each(function () {
        if ($(this).is(':visible')) {
          $(this).addClass('is-invalid');
          const $authErr = $('#err-' + this.id);
          if ($authErr.length) {
            $authErr.text(msg);
          } else {
            $(this).closest('.col-md-6, .mb-3').find('.invalid-feedback').first().text(msg).show();
          }
        }
      });
    });
  }

  function clearInlineErrors() {
    $('.is-invalid').removeClass('is-invalid');
    $('.invalid-feedback').hide().text('');
    $('[id^="err-"]').text('');
  }

  function populateDeptFilter(departments) {
    const opts = departments.map(d => `<option value="${d}">${d}</option>`).join('');
    $('#deptFilter').html('<option value="">All Departments</option>' + opts);
  }

  return {
    switchPage, setNavUser, showSpinner,
    renderEmployeeTable, applyRoleUI,
    renderDashboardCards, renderDepartmentBreakdown, renderRecentEmployees,
    showModal, populateForm, clearForm,
    showToast, showInlineErrors, clearInlineErrors, populateDeptFilter,
  };
})();
