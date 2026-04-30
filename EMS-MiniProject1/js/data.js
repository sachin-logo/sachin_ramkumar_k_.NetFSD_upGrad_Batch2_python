const INITIAL_EMPLOYEES = [
  { id: 1,  firstName: 'Sachin',    lastName: 'Ramkumar',  email: 'sachin.ramkumar@hexacore.com',   phone: '9876541230', department: 'Engineering', designation: 'Software Engineer',       salary: 850000,  joinDate: '2021-03-15', status: 'Active'   },
  { id: 2,  firstName: 'Kavitha',   lastName: 'Sundaram',  email: 'kavitha.sundaram@hexacore.com',  phone: '9123456781', department: 'Marketing',   designation: 'Marketing Executive',     salary: 620000,  joinDate: '2020-07-01', status: 'Active'   },
  { id: 3,  firstName: 'Deepak',    lastName: 'Natarajan', email: 'deepak.natarajan@hexacore.com',  phone: '9988776644', department: 'HR',          designation: 'HR Executive',            salary: 550000,  joinDate: '2019-11-20', status: 'Active'   },
  { id: 4,  firstName: 'Preethi',   lastName: 'Balaji',    email: 'preethi.balaji@hexacore.com',    phone: '9876512341', department: 'Finance',     designation: 'Financial Analyst',       salary: 720000,  joinDate: '2022-01-10', status: 'Active'   },
  { id: 5,  firstName: 'Aravind',   lastName: 'Selvam',    email: 'aravind.selvam@hexacore.com',    phone: '9001234568', department: 'Operations',  designation: 'Operations Manager',      salary: 950000,  joinDate: '2018-06-05', status: 'Active'   },
  { id: 6,  firstName: 'Nithyasri', lastName: 'Mohan',     email: 'nithyasri.mohan@hexacore.com',   phone: '9871234561', department: 'Engineering', designation: 'Senior Developer',        salary: 1100000, joinDate: '2017-09-12', status: 'Active'   },
  { id: 7,  firstName: 'Kalaivani', lastName: 'Rajan',     email: 'kalaivani.rajan@hexacore.com',   phone: '9765432101', department: 'Marketing',   designation: 'Content Strategist',      salary: 580000,  joinDate: '2023-02-28', status: 'Inactive' },
  { id: 8,  firstName: 'Murugesan', lastName: 'Pillai',    email: 'murugesan.pillai@hexacore.com',  phone: '9654321089', department: 'Finance',     designation: 'Accounts Manager',        salary: 800000,  joinDate: '2020-04-17', status: 'Active'   },
  { id: 9,  firstName: 'Saranya',   lastName: 'Krishnan',  email: 'saranya.krishnan@hexacore.com',  phone: '9543210978', department: 'HR',          designation: 'Talent Acquisition Lead', salary: 690000,  joinDate: '2021-08-22', status: 'Inactive' },
  { id: 10, firstName: 'Balamurugan',lastName: 'Srinivasan',email: 'balamurugan.srinivasan@hexacore.com', phone: '9432109867', department: 'Finance', designation: 'Tax Consultant',       salary: 760000,  joinDate: '2019-03-30', status: 'Inactive' },
  { id: 11, firstName: 'Tamilselvi',lastName: 'Pandian',   email: 'tamilselvi.pandian@hexacore.com',phone: '9321098756', department: 'Engineering', designation: 'QA Engineer',             salary: 730000,  joinDate: '2022-10-11', status: 'Active'   },
  { id: 12, firstName: 'Senthilkumar',lastName: 'Arumugam',email: 'senthilkumar.arumugam@hexacore.com',phone: '9210987645', department: 'Marketing', designation: 'Brand Manager',          salary: 870000,  joinDate: '2020-12-05', status: 'Active'   },
  { id: 13, firstName: 'Vijayalakshmi',lastName: 'Durai',  email: 'vijayalakshmi.durai@hexacore.com',phone: '9109876534', department: 'Operations', designation: 'Supply Chain Analyst',   salary: 640000,  joinDate: '2021-05-18', status: 'Active'   },
  { id: 14, firstName: 'Palaniswamy',lastName: 'Gounder',  email: 'palaniswamy.gounder@hexacore.com',phone: '9098765423', department: 'Engineering', designation: 'DevOps Engineer',        salary: 980000,  joinDate: '2023-01-09', status: 'Active'   },
  { id: 15, firstName: 'Mahalakshmi',lastName: 'Subramanian',email: 'mahalakshmi.subramanian@hexacore.com',phone: '8987654312', department: 'Operations', designation: 'Logistics Coordinator', salary: 590000, joinDate: '2020-08-14', status: 'Active' },
];

const INITIAL_ADMIN = {
  username: 'admin',
  password: 'admin123',
};

const DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations'];
