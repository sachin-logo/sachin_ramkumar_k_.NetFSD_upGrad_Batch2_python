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
    return '\u20b9' + Number(n).toLocaleString('en-IN');
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
          <span style="color:#94a3b8;font-size:13px;">Loading employees\u2026</span>
        </td>
      </tr>`);
  }

  function renderEmployeeTable(employees, totalCount) {
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
      return;
    }

    const rows = employees.map((e, idx) => {
      const bg       = _avatarColor(e.firstName + e.lastName);
      const rowClass = idx % 2 !== 0 ? 'row-alt' : '';
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
              <button class="btn-view"   data-id="${e.id}" title="View"><i class="bi bi-eye"></i></button>
              <button class="btn-edit"   data-id="${e.id}" title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="btn-delete" data-id="${e.id}" title="Delete"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');

    $tbody.html(rows);
    $('#showingCount').text(`Showing ${employees.length} of ${totalCount} employees`);
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
      $('#recentEmployeesList').html(
        '<p style="padding:16px;color:#94a3b8;font-size:13px;">No employees yet.</p>'
      );
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
            <span class="status-badge ${e.status === 'Active' ? 'status-active' : 'status-inactive'}">
              ${e.status}
            </span>
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
    $('#viewStatus')
      .attr('class', `status-badge ${e.status === 'Active' ? 'status-active' : 'status-inactive'}`)
      .text(e.status);
  }

  function populateForm(e) {
    $('#empFirstName').val(e.firstName);
    $('#empLastName').val(e.lastName);
    $('#empEmail').val(e.email);
    $('#empPhone').val(e.phone);
    $('#empDepartment').val(e.department);
    $('#empDesignation').val(e.designation);
    $('#empSalary').val(e.salary);
    $('#empJoinDate').val(e.joinDate);
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
      firstName:       '#empFirstName',
      lastName:        '#empLastName',
      email:           '#empEmail',
      phone:           '#empPhone',
      department:      '#empDepartment',
      designation:     '#empDesignation',
      salary:          '#empSalary',
      joinDate:        '#empJoinDate',
      status:          '#empStatus',
      username:        '#signupUsername, #loginUsername',
      password:        '#signupPassword, #loginPassword',
      confirmPassword: '#signupConfirmPassword',
    };
    Object.entries(errors).forEach(([field, msg]) => {
      const sel = idMap[field];
      if (!sel) return;
      $(sel).each(function () {
        if ($(this).is(':visible')) {
          $(this).addClass('is-invalid');
          const $authErr = $('#err-' + this.id);
          if ($authErr.length) {
            $authErr.text(msg);
          } else {
            $(this).closest('.col-md-6, .mb-3')
              .find('.invalid-feedback').first().text(msg).show();
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
    $('#deptFilter').html('<option value="All">All Departments</option>' + opts);
  }

  return {
    switchPage,
    setNavUser,
    showSpinner,
    renderEmployeeTable,
    renderDashboardCards,
    renderDepartmentBreakdown,
    renderRecentEmployees,
    showModal,
    populateForm,
    clearForm,
    showToast,
    showInlineErrors,
    clearInlineErrors,
    populateDeptFilter,
  };
})();
