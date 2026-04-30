const validationService = (function () {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\d{10}$/;

  return {
    validateAuthForm(formData, type) {
      const errors = {};
      const { username, password, confirmPassword } = formData;

      if (!username || username.trim() === '') errors.username = 'Username is required.';

      if (!password || password === '') {
        errors.password = 'Password is required.';
      } else if (type === 'signup' && password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }

      if (type === 'signup') {
        if (!confirmPassword || confirmPassword === '') {
          errors.confirmPassword = 'Please confirm your password.';
        } else if (password && confirmPassword !== password) {
          errors.confirmPassword = 'Passwords do not match.';
        }
      }

      return { valid: Object.keys(errors).length === 0, errors };
    },

    validateEmployeeForm(formData, editId = null) {
      const errors = {};
      const { firstName, lastName, email, phone, department, designation, salary, joinDate, status } = formData;

      if (!firstName || firstName.trim() === '')     errors.firstName    = 'First name is required.';
      if (!lastName  || lastName.trim() === '')      errors.lastName     = 'Last name is required.';
      if (!designation || designation.trim() === '') errors.designation  = 'Designation is required.';
      if (!department || department === '')          errors.department   = 'Please select a department.';
      if (!joinDate   || joinDate === '')            errors.joinDate     = 'Join date is required.';
      if (!status     || status === '')              errors.status       = 'Please select a status.';

      if (!email || email.trim() === '') {
        errors.email = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = 'Enter a valid email address.';
      } else if (employeeService.emailExists(email.trim(), editId)) {
        errors.email = 'This email is already in use by another employee.';
      }

      if (!phone || phone.trim() === '') {
        errors.phone = 'Phone number is required.';
      } else if (!PHONE_REGEX.test(phone.trim())) {
        errors.phone = 'Phone must be exactly 10 digits.';
      }

      const salaryNum = Number(salary);
      if (!salary && salary !== 0) {
        errors.salary = 'Salary is required.';
      } else if (isNaN(salaryNum) || salaryNum <= 0) {
        errors.salary = 'Salary must be a positive number.';
      }

      return { valid: Object.keys(errors).length === 0, errors };
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validationService };
}
