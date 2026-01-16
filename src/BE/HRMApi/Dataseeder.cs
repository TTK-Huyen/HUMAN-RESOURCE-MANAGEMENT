using Bogus;
using HrmApi.Models;
using HrmApi.Security;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Collections.Generic;

namespace HrmApi.Data
{
    public static class DataSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // 1. If DB already has employees, skip seeding
            if (context.Employees.Any())
            {
                Console.WriteLine("--> Data already exists. Skipping seeding.");
                return;
            }

            Console.WriteLine("--> Starting data creation (29 Employees: 4 Managers, 4 HR, 21 Staff)...");
            Randomizer.Seed = new Random(12345); // Fixed seed for reproducibility

            // --- A. CREATE MASTER DATA (JobTitles, Departments, Roles) ---
            var jobTitles = new List<JobTitle>
            {
                // IT
                new JobTitle { Title = "IT Manager", Level = "Manager" },
                new JobTitle { Title = "IT Senior Developer", Level = "Senior" },
                new JobTitle { Title = "IT Junior Developer", Level = "Staff" },
                new JobTitle { Title = "IT Tester/QC", Level = "Staff" },
                new JobTitle { Title = "IT Intern", Level = "Intern" },

                // HR
                new JobTitle { Title = "HR Manager", Level = "Manager" },
                new JobTitle { Title = "HR Specialist", Level = "Senior" },

                // Sales
                new JobTitle { Title = "Sales Manager", Level = "Manager" },
                new JobTitle { Title = "Sales Senior Executive", Level = "Senior" },
                new JobTitle { Title = "Sales Junior Executive", Level = "Staff" },

                // Accounting
                new JobTitle { Title = "Accounting Manager", Level = "Manager" },
                new JobTitle { Title = "Senior Accountant", Level = "Senior" },
                new JobTitle { Title = "Junior Accountant", Level = "Staff" },
            };
            context.JobTitles.AddRange(jobTitles);

            var departments = new List<Department>
            {
                new Department { DepartmentCode = "IT", Name = "Information Technology" },
                new Department { DepartmentCode = "HR", Name = "Human Resources" },
                new Department { DepartmentCode = "SALE", Name = "Sales" },
                new Department { DepartmentCode = "ACC", Name = "Accounting" }
            };
            context.Departments.AddRange(departments);

            var roles = new List<Role>
            {
                new Role { RoleCode = "ADMIN", RoleName = "Administrator" },      // ID 1
                new Role { RoleCode = "HR", RoleName = "Human Resources" },      // ID 2
                new Role { RoleCode = "MANAGER", RoleName = "Manager" },         // ID 3
                new Role { RoleCode = "EMP", RoleName = "Employee" }             // ID 4
            };
            context.Roles.AddRange(roles);
            context.SaveChanges(); // Save to get IDs

            // Get convenience variables for later use
            var deptIT = departments.First(d => d.DepartmentCode == "IT");
            var deptHR = departments.First(d => d.DepartmentCode == "HR");
            var deptSALE = departments.First(d => d.DepartmentCode == "SALE");
            var deptACC = departments.First(d => d.DepartmentCode == "ACC");
            
            var roleAdmin = roles.First(r => r.RoleCode == "ADMIN");
            var roleManager = roles.First(r => r.RoleCode == "MANAGER");
            var roleHR = roles.First(r => r.RoleCode == "HR");
            var roleEmp = roles.First(r => r.RoleCode == "EMP");
            

            // Password hash chung "123456"
            var passwordHasher = new PasswordHasher();
            string passwordHash = passwordHasher.HashPassword("123456");

            // --- B. CREATE ACCOUNTS (ADMIN + MANAGERS + HR + STAFF) ---

            // 0. CREATE ADMIN ACCOUNT
            var adminEmp = new Employee
            {
                EmployeeCode = "ADMIN",
                FullName = "System Administrator",
                CompanyEmail = "admin@company.com",
                PersonalEmail = "admin@hrm.com",
                PhoneNumber = "0900000000",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title == "HR Manager").Id,
                DirectManagerId = null,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Male",
                DateOfBirth = new DateTime(1980, 1, 1),
                CurrentAddress = "Ho Chi Minh",
                CitizenIdNumber = "0800000000000",
                PersonalTaxCode = "0800000000",
                SocialInsuranceNumber = "8000000000",
                BirthPlaceProvince = "Ho Chi Minh",
                BirthPlaceDistrict = "District 1"
            };
            context.Employees.Add(adminEmp);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "admin",
                PasswordHash = passwordHash,
                EmployeeId = adminEmp.Id,
                RoleId = roleAdmin.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // 1. CREATE MANAGER FOR EACH DEPARTMENT (No direct manager)

            // Manager IT
            var managerIT = new Employee
            {
                EmployeeCode = "EMP001",
                FullName = "Tran Van - IT Manager",
                CompanyEmail = "it.manager@company.com",
                PersonalEmail = "itmanager@hrm.com",
                PhoneNumber = "0901234567",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title == "IT Manager").Id,
                DirectManagerId = null,  // No direct manager
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Male",
                DateOfBirth = new DateTime(1985, 3, 15),
                CurrentAddress = "Ho Chi Minh",
                CitizenIdNumber = "085100123458",
                PersonalTaxCode = "0851001235",
                SocialInsuranceNumber = "8501001235",
                BirthPlaceProvince = "Ho Chi Minh",
                BirthPlaceDistrict = "District 3"
            };
            context.Employees.Add(managerIT);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP001",
                PasswordHash = passwordHash,
                EmployeeId = managerIT.Id,
                RoleId = roleManager.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // Manager HR
            var managerHR = new Employee
            {
                EmployeeCode = "EMP002",
                FullName = "Nguyen Thi - HR Manager",
                CompanyEmail = "hr.manager@company.com",
                PersonalEmail = "hrmanager@hrm.com",
                PhoneNumber = "0909888777",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title == "HR Manager").Id,
                DirectManagerId = null,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1988, 5, 20),
                CurrentAddress = "Hanoi",
                CitizenIdNumber = "088100567901",
                PersonalTaxCode = "0881005678",
                SocialInsuranceNumber = "8801005678",
                BirthPlaceProvince = "Hanoi",
                BirthPlaceDistrict = "Hoan Kiem"
            };
            context.Employees.Add(managerHR);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP002",
                PasswordHash = passwordHash,
                EmployeeId = managerHR.Id,
                RoleId = roleManager.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // Manager SALE
            var managerSALE = new Employee
            {
                EmployeeCode = "EMP003",
                FullName = "Le Van - Sales Manager",
                CompanyEmail = "sale.manager@company.com",
                PersonalEmail = "salemanager@hrm.com",
                PhoneNumber = "0908765432",
                DepartmentId = deptSALE.Id,
                JobTitleId = jobTitles.First(j => j.Title == "Sales Manager").Id,
                DirectManagerId = null,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Male",
                DateOfBirth = new DateTime(1987, 7, 10),
                CurrentAddress = "Da Nang",
                CitizenIdNumber = "087100765321",
                PersonalTaxCode = "0871007654",
                SocialInsuranceNumber = "8701007654",
                BirthPlaceProvince = "Da Nang",
                BirthPlaceDistrict = "Hai Chau"
            };
            context.Employees.Add(managerSALE);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP003",
                PasswordHash = passwordHash,
                EmployeeId = managerSALE.Id,
                RoleId = roleManager.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // 2. CREATE MANAGER FOR ACC DEPARTMENT

            // Manager ACC
            var managerACC = new Employee
            {
                EmployeeCode = "EMP004",
                FullName = "Vo Thi - Accounting Manager",
                CompanyEmail = "acc.manager@company.com",
                PersonalEmail = "accmanager@hrm.com",
                PhoneNumber = "0907654321",
                DepartmentId = deptACC.Id,
                JobTitleId = jobTitles.First(j => j.Title == "Accounting Manager").Id,
                DirectManagerId = null,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1989, 4, 12),
                CurrentAddress = "Ho Chi Minh",
                CitizenIdNumber = "089100124569",
                PersonalTaxCode = "0891001236",
                SocialInsuranceNumber = "8901001236",
                BirthPlaceProvince = "Ho Chi Minh",
                BirthPlaceDistrict = "District 5"
            };
            context.Employees.Add(managerACC);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP004",
                PasswordHash = passwordHash,
                EmployeeId = managerACC.Id,
                RoleId = roleManager.RoleId,
                Status = AccountStatus.ACTIVE
            });

            

            // 3. CREATE HR SPECIALIST FOR EACH DEPARTMENT

            var hrByDepartment = new Dictionary<int, (int empId, string empCode)>();

            // HR for IT
            var hrIT = new Employee
            {
                EmployeeCode = "EMP005",
                FullName = "Truong Thi - IT HR",
                CompanyEmail = "it.hr@company.com",
                PersonalEmail = "ithr@hrm.com",
                PhoneNumber = "0909111222",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerIT.Id,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1993, 3, 8),
                CurrentAddress = "Ho Chi Minh",
                CitizenIdNumber = "093030834561",
                PersonalTaxCode = "0930308234",
                SocialInsuranceNumber = "9303082345",
                BirthPlaceProvince = "Ho Chi Minh",
                BirthPlaceDistrict = "District 2"
            };
            context.Employees.Add(hrIT);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP005",
                PasswordHash = passwordHash,
                EmployeeId = hrIT.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for HR
            var hrHR = new Employee
            {
                EmployeeCode = "EMP006",
                FullName = "Luong Thi - HR HR",
                CompanyEmail = "hr.hr@company.com",
                PersonalEmail = "hrhr@hrm.com",
                PhoneNumber = "0909222333",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerHR.Id,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1992, 8, 25),
                CurrentAddress = "Hanoi",
                CitizenIdNumber = "092082568902",
                PersonalTaxCode = "0920825678",
                SocialInsuranceNumber = "9208256789",
                BirthPlaceProvince = "Hanoi",
                BirthPlaceDistrict = "Dong Da"
            };
            context.Employees.Add(hrHR);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP006",
                PasswordHash = passwordHash,
                EmployeeId = hrHR.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for SALE
            var hrSALE = new Employee
            {
                EmployeeCode = "EMP007",
                FullName = "Dang Thi - SALE HR",
                CompanyEmail = "sale.hr@company.com",
                PersonalEmail = "salehr@hrm.com",
                PhoneNumber = "0909333444",
                DepartmentId = deptSALE.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerSALE.Id,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1991, 11, 10),
                CurrentAddress = "Da Nang",
                CitizenIdNumber = "091110987654",
                PersonalTaxCode = "0911110987",
                SocialInsuranceNumber = "9111109876",
                BirthPlaceProvince = "Da Nang",
                BirthPlaceDistrict = "Hai Chau"
            };
            context.Employees.Add(hrSALE);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP007",
                PasswordHash = passwordHash,
                EmployeeId = hrSALE.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for ACC
            var hrACC = new Employee
            {
                EmployeeCode = "EMP008",
                FullName = "Ho Thi - ACC HR",
                CompanyEmail = "acc.hr@company.com",
                PersonalEmail = "acchr@hrm.com",
                PhoneNumber = "0909444555",
                DepartmentId = deptACC.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerACC.Id,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Female",
                DateOfBirth = new DateTime(1994, 7, 20),
                CurrentAddress = "Ho Chi Minh",
                CitizenIdNumber = "094001234571",
                PersonalTaxCode = "0941001238",
                SocialInsuranceNumber = "9410012345",
                BirthPlaceProvince = "Ho Chi Minh",
                BirthPlaceDistrict = "District 4"
            };
            context.Employees.Add(hrACC);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP008",
                PasswordHash = passwordHash,
                EmployeeId = hrACC.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            
            // 4. CREATE 1 TEST EMPLOYEE (FIXED - USE FOR TESTING)
            var testEmp = new Employee
            {
                EmployeeCode = "EMP009",
                FullName = "Tran Nhan Vien Test",
                CompanyEmail = "emp012@company.com",
                PersonalEmail = "emp012@hrm.com",
                PhoneNumber = "0909888779",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("Developer")).Id,
                DirectManagerId = managerIT.Id,
                Status = "Active",
                Nationality = "Vietnam",
                ContractType = "Permanent",
                Gender = "Male",
                DateOfBirth = new DateTime(1998, 6, 15),
                CurrentAddress = "Hanoi",
                CitizenIdNumber = "098065234567", // 13 digits
                PersonalTaxCode = "0980615234",    // 10 digits
                SocialInsuranceNumber = "9806152345", // 10 digits
                BirthPlaceProvince = "Hanoi",
                BirthPlaceDistrict = "Cau Giay"
            };

            context.Employees.Add(testEmp);
            context.SaveChanges();


            context.UserAccounts.Add(new UserAccount
            {
                Username = testEmp.EmployeeCode,
                PasswordHash = passwordHash,
                EmployeeId = testEmp.Id,
                RoleId = roleEmp.RoleId,
                Status = AccountStatus.ACTIVE
            });

            context.SaveChanges();
            
            // 5. CREATE STAFF FOR DEPARTMENTS (15 IT, 5 HR, 5 SALE, 3 ACC)
            var staffList = new List<Employee>();
            
            // ===== DEFINE VALUE DOMAIN (ENGLISH) =====
            var genderValues = new[] { "Male", "Female" };
            var maritalStatuses = new[] { "Single", "Married", "Divorced" };
            var employmentTypes = new[] { "Full-time", "Part-time", "Contract" };
            var contractTypes = new[] { "Permanent", "Fixed-term" };
            
            // Declare variables for reuse in loops
            string empPasswordHash;
            
            var empFaker = new Faker<Employee>("en")
                .RuleFor(e => e.FullName, f => f.Name.FullName())
                .RuleFor(e => e.PhoneNumber, f => f.Phone.PhoneNumber("09########"))
                .RuleFor(e => e.PersonalEmail, (f, e) => RemoveSign(e.FullName).ToLower().Replace(" ", "") + "@hrm.com")
                .RuleFor(e => e.DateOfBirth, f => f.Date.Past(25, DateTime.Now.AddYears(-22)))
                .RuleFor(e => e.CurrentAddress, f => f.Address.City())
                .RuleFor(e => e.CitizenIdNumber, f => f.Random.ReplaceNumbers("############")) // 13 digits
                .RuleFor(e => e.PersonalTaxCode, f => f.Random.ReplaceNumbers("##########")) // 10 digits
                .RuleFor(e => e.SocialInsuranceNumber, f => f.Random.ReplaceNumbers("##########")) // 10 digits
                .RuleFor(e => e.Gender, f => f.PickRandom(genderValues))
                .RuleFor(e => e.MaritalStatus, f => f.PickRandom(maritalStatuses))
                .RuleFor(e => e.EmploymentType, f => f.PickRandom(employmentTypes))
                .RuleFor(e => e.ContractType, f => f.PickRandom(contractTypes))
                .RuleFor(e => e.Nationality, f => "Vietnam")
                .RuleFor(e => e.Status, f => "Active")
                .RuleFor(e => e.HasChildren, f => f.Random.Bool(0.3f))
                .RuleFor(e => e.BirthPlaceProvince, f => f.PickRandom(new[] { "Ho Chi Minh", "Hanoi", "Da Nang", "Can Tho" }))
                .RuleFor(e => e.BirthPlaceDistrict, f => f.PickRandom(new[] { "District 1", "District 3", "Hoan Kiem", "Hai Chau" }));

            int empCounter = 13; // Start from EMP013 (EMP012 is test employee)
            
            // 15 IT Staff
            for (int i = 0; i < 15; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{empCounter:000}";
                emp.CompanyEmail = ""; // Auto-generated from FullName
                emp.DepartmentId = deptIT.Id;
                emp.JobTitleId = i < 10 
                    ? jobTitles.First(j => j.Title == "IT Senior Developer").Id 
                    : jobTitles.First(j => j.Title == "IT Junior Developer").Id;
                emp.DirectManagerId = managerIT.Id;

                context.Employees.Add(emp);
                context.SaveChanges();
                staffList.Add(emp);
                // Generate password: EMP + last4 CCCD
                // Use default password '123456' for seeded staff (matches console message)
                empPasswordHash = passwordHash;

                context.UserAccounts.Add(new UserAccount
                {
                    Username = emp.EmployeeCode,
                    PasswordHash = empPasswordHash,
                    EmployeeId = emp.Id,
                    RoleId = roleEmp.RoleId,
                    Status = AccountStatus.ACTIVE
                });
                
                empCounter++;
            }

            // 5 HR Staff
            for (int i = 0; i < 5; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{empCounter:000}";
                emp.CompanyEmail = "";
                emp.DepartmentId = deptHR.Id;
                emp.JobTitleId = jobTitles.First(j => j.Title == "HR Specialist").Id;
                emp.DirectManagerId = managerHR.Id;

                context.Employees.Add(emp);
                context.SaveChanges();
                staffList.Add(emp);

                // Use default password '123456' for seeded staff
                empPasswordHash = passwordHash;

                context.UserAccounts.Add(new UserAccount
                {
                    Username = emp.EmployeeCode,
                    PasswordHash = empPasswordHash,
                    EmployeeId = emp.Id,
                    RoleId = roleEmp.RoleId,
                    Status = AccountStatus.ACTIVE
                });
                
                empCounter++;
            }

            // 5 SALE Staff
            for (int i = 0; i < 5; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{empCounter:000}";
                emp.CompanyEmail = "";
                emp.DepartmentId = deptSALE.Id;
                emp.JobTitleId = jobTitles.First(j => j.Title == "Sales Senior Executive").Id; // Use Senior for Sales
                emp.DirectManagerId = managerSALE.Id;

                context.Employees.Add(emp);
                context.SaveChanges();
                staffList.Add(emp);

                // Use default password '123456' for seeded staff
                empPasswordHash = passwordHash;

                context.UserAccounts.Add(new UserAccount
                {
                    Username = emp.EmployeeCode,
                    PasswordHash = empPasswordHash,
                    EmployeeId = emp.Id,
                    RoleId = roleEmp.RoleId,
                    Status = AccountStatus.ACTIVE
                });
                
                empCounter++;
            }

            // 3 ACC Staff
            for (int i = 0; i < 3; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{empCounter:000}";
                emp.CompanyEmail = "";
                emp.DepartmentId = deptACC.Id;
                emp.JobTitleId = jobTitles.First(j => j.Title == "Senior Accountant").Id;
                emp.DirectManagerId = managerACC.Id;

                context.Employees.Add(emp);
                context.SaveChanges();
                staffList.Add(emp);

                // Use default password '123456' for seeded staff
                empPasswordHash = passwordHash;

                context.UserAccounts.Add(new UserAccount
                {
                    Username = emp.EmployeeCode,
                    PasswordHash = empPasswordHash,
                    EmployeeId = emp.Id,
                    RoleId = roleEmp.RoleId,
                    Status = AccountStatus.ACTIVE
                });
                
                empCounter++;
            }
            
            context.SaveChanges();

            // --- Add ContractStartDate and PhoneNumbers/BankAccounts to all employees ---
            Console.WriteLine("--> Adding phone numbers and bank accounts to employees...");
            var allEmps = context.Employees.ToList();
            var contractStartDate = new DateTime(2026, 1, 1);
            var faker = new Faker();
            var bankNames = new[] { "Vietcombank", "BIDV", "VietinBank", "Techcombank", "ACB", "MB Bank" };

            foreach (var emp in allEmps)
            {
                // Set ContractStartDate
                emp.ContractStartDate = contractStartDate;

                // Add phone number to PhoneNumbers collection if not already exists
                if (!emp.PhoneNumbers.Any() && !string.IsNullOrEmpty(emp.PhoneNumber))
                {
                    emp.PhoneNumbers.Add(new EmployeePhoneNumber
                    {
                        EmployeeId = emp.Id,
                        PhoneNumber = emp.PhoneNumber,
                        Description = "Personal"
                    });
                }

                // Add bank account to BankAccounts collection if not already exists
                if (!emp.BankAccounts.Any())
                {
                    emp.BankAccounts.Add(new EmployeeBankAccount
                    {
                        EmployeeId = emp.Id,
                        BankName = faker.PickRandom(bankNames),
                        AccountNumber = faker.Random.ReplaceNumbers("####################"), // 20 digit account
                        IsPrimary = true
                    });
                }
            }
            context.SaveChanges();
            Console.WriteLine("--> ✓ Added ContractStartDate, PhoneNumbers, and BankAccounts to all employees");

            // --- C. CREATE REQUESTS (Sample data for testing) ---
            Console.WriteLine("--> Creating random leave requests...");

            var leaveTypeList = new[] { "Annual Leave", "Sick Leave", "Personal Leave", "Unpaid Leave", "Maternity Leave" };

            // Create 15 leave requests (10 Pending, 5 Approved if has DirectManager)
            for (int i = 0; i < 15; i++)
            {
                var emp = new Faker().PickRandom(staffList);
                // Mark as Approved only if employee has DirectManager
                bool isApproved = i >= 10 && emp.DirectManagerId.HasValue; // Last 5 approved if has manager
                
                // Get the correct direct manager of the employee (no fallback to other manager)
                var approver = (isApproved && emp.DirectManagerId.HasValue)
                    ? context.Employees.Find(emp.DirectManagerId.Value)
                    : null;

                var req = new Request
                {
                    EmployeeId = emp.Id,
                    RequestType = "LEAVE",
                    Status = isApproved ? "Approved" : "Pending",
                    CreatedAt = DateTime.Now.AddDays(-new Random().Next(1, 10)),
                    ApproverId = isApproved ? approver?.Id : null,
                    ApprovedAt = isApproved ? DateTime.Now : null
                };
                context.Requests.Add(req);
                context.SaveChanges();

                context.LeaveRequests.Add(new LeaveRequest
                {
                    Id = req.RequestId,
                    EmployeeId = emp.Id,
                    LeaveType = new Faker().PickRandom(leaveTypeList),
                    StartDate = DateTime.Now.AddDays(new Random().Next(2, 10)),
                    EndDate = DateTime.Now.AddDays(new Random().Next(11, 15)),
                    Reason = "Personal leave request",
                    Status = isApproved ? RequestStatus.Approved : RequestStatus.Pending
                });
            }

            // Create 10 OT requests (Approve only if has DirectManager)
            for (int i = 0; i < 10; i++)
            {
                var emp = new Faker().PickRandom(staffList);
                var approver = emp.DirectManagerId.HasValue
                    ? context.Employees.Find(emp.DirectManagerId.Value)
                    : null;
                bool hasManager = approver != null;
                    
                var req = new Request
                {
                    EmployeeId = emp.Id,
                    RequestType = "OT",
                    Status = hasManager ? "Approved" : "Pending",
                    CreatedAt = DateTime.Now.AddDays(-5),
                    ApproverId = hasManager ? approver?.Id : null,
                    ApprovedAt = hasManager ? DateTime.Now : (DateTime?)null
                };
                context.Requests.Add(req);
                context.SaveChanges();

                context.OvertimeRequests.Add(new OvertimeRequest
                {
                    Id = req.RequestId,
                    EmployeeId = emp.Id,
                    Date = DateTime.Now.AddDays(-2),
                    StartTime = new TimeSpan(18, 0, 0),
                    EndTime = new TimeSpan(21, 0, 0),
                    TotalHours = 3,
                    Reason = "Project deadline",
                    Status = RequestStatus.Approved
                });
            }

            context.SaveChanges();

            // ===== SEED INITIAL POINTS FOR ALL EMPLOYEES =====
            Console.WriteLine("--> Creating initial reward points for all employees...");
            var allEmployees = context.Employees.ToList();
            
            // Check if points already exist to avoid duplicates
            var existingPointBalances = context.PointBalances.Select(p => p.EmployeeId).ToList();
            
            foreach (var employee in allEmployees)
            {
                // Skip if this employee already has a point balance
                if (existingPointBalances.Contains(employee.Id))
                {
                    Console.WriteLine($"   ⏭️  {employee.EmployeeCode} already has points, skipping");
                    continue;
                }

                // Create PointBalance with 5000 points
                var pointBalance = new PointBalance
                {
                    EmployeeId = employee.Id,
                    CurrentBalance = 5000,
                    TotalEarned = 5000,
                    TotalSpent = 0,
                    LastUpdated = DateTime.Now
                };
                context.PointBalances.Add(pointBalance);

                // Create PointTransaction to record initial points
                var initialTransaction = new PointTransaction
                {
                    EmployeeId = employee.Id,
                    TransactionType = "INITIAL",
                    Points = 5000,
                    Description = "System initial reward points",
                    CreatedAt = DateTime.Now
                };
                context.PointTransactions.Add(initialTransaction);
            }
            context.SaveChanges();
            var newPointsCount = allEmployees.Count - existingPointBalances.Count;
            Console.WriteLine($"--> Created 5000 points for {newPointsCount} new employees (total: {allEmployees.Count} employees)");

            Console.WriteLine("--> SEED DATA COMPLETED SUCCESSFULLY!");
            Console.WriteLine("==============================================");
            Console.WriteLine("ACCOUNT LIST (created by seeder)");
            Console.WriteLine("==============================================");

            // Get actual user accounts list from DB to print (ensure data consistency)
            try
            {
                var accounts = context.UserAccounts
                    .Include(u => u.Role)
                    .Include(u => u.Employee)
                    .OrderBy(u => u.UserId)
                    .ToList();

                var grouped = accounts.GroupBy(a => a.Role?.RoleCode ?? "UNKNOWN");
                foreach (var g in grouped)
                {
                    Console.WriteLine($"\nRole: {g.Key} (count: {g.Count()})");
                    foreach (var a in g)
                    {
                        var dept = a.Employee?.Department?.Name ?? "-";
                        Console.WriteLine($"  • Username: {a.Username} | Employee: {a.Employee?.EmployeeCode} - {a.Employee?.FullName} | Department: {dept}");
                    }
                }

                Console.WriteLine("\n==============================================");
                Console.WriteLine("🔒 DEFAULT LOGIN INFORMATION");
                Console.WriteLine("==============================================");
                Console.WriteLine("• All passwords are: 123456");
                Console.WriteLine("• Use any username from the list above");
                Console.WriteLine("• Permissions depend on assigned Role");
                Console.WriteLine("==============================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Could not print accounts list: " + ex.Message);
            }
        }

        // Password is no longer in HRM format, standardized to 123456 for all
        // Keep this function for compatibility if needed
        private static string GeneratePassword(Employee emp)
        {
            var cccd = emp.CitizenIdNumber ?? "0000";
            var digits = new string(cccd.Where(char.IsDigit).ToArray());
            var last4 = digits.Length >= 4 ? digits[^4..] : digits.PadLeft(4, '0');
            return $"EMP{last4}";
        }
        private static string RemoveSign(string str)
        {
            if (string.IsNullOrEmpty(str)) return "";
            string[] VietnameseSigns = new string[]
            {
                "aAeEoOuUiIdDyY",
                "áàạảãâấầậẩẫăắằặẳẵ", "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ", "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ", "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ", "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ", "ÍÌỊỈĨ",
                "đ", "Đ",
                "ýỳỵỷỹ", "ÝỲỴỶỸ"
            };
            for (int i = 1; i < VietnameseSigns.Length; i++)
            {
                for (int j = 0; j < VietnameseSigns[i].Length; j++)
                    str = str.Replace(VietnameseSigns[i][j], VietnameseSigns[0][i - 1]);
            }
            return str;
        }
    }
}