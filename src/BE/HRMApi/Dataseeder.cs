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
            // 1. Nếu DB đã có nhân viên thì thôi
            if (context.Employees.Any())
            {
                Console.WriteLine("--> Dữ liệu đã tồn tại. Bỏ qua seeding.");
                return;
            }

            Console.WriteLine("--> Bắt đầu tạo dữ liệu (29 Employees: 4 Managers, 4 HR, 21 Staff)...");
            Randomizer.Seed = new Random(12345); // Seed cố định

            // --- A. TẠO DANH MỤC (JobTitles, Departments, Roles) ---
            var jobTitles = new List<JobTitle>
            {
                // IT
                new JobTitle { Title = "IT Manager", Level = "Quản lý" },
                new JobTitle { Title = "IT Senior Developer", Level = "Chuyên viên" },
                new JobTitle { Title = "IT Junior Developer", Level = "Nhân viên" },
                new JobTitle { Title = "IT Tester/QC", Level = "Nhân viên" },
                new JobTitle { Title = "IT Intern", Level = "Thực tập sinh" },

                // HR
                new JobTitle { Title = "HR Manager", Level = "Quản lý" },
                new JobTitle { Title = "HR Specialist", Level = "Chuyên viên" },

                // Sales
                new JobTitle { Title = "Sales Manager", Level = "Quản lý" },
                new JobTitle { Title = "Sales Senior Executive", Level = "Chuyên viên" },
                new JobTitle { Title = "Sales Junior Executive", Level = "Nhân viên" },

                // Accounting
                new JobTitle { Title = "Accounting Manager", Level = "Quản lý" },
                new JobTitle { Title = "Senior Accountant", Level = "Chuyên viên" },
                new JobTitle { Title = "Junior Accountant", Level = "Nhân viên" },
            };
            context.JobTitles.AddRange(jobTitles);

            var departments = new List<Department>
            {
                new Department { DepartmentCode = "IT", Name = "Phòng Công nghệ Thông tin" },
                new Department { DepartmentCode = "HR", Name = "Phòng Nhân Sự" },
                new Department { DepartmentCode = "SALE", Name = "Phòng Kinh Doanh" },
                new Department { DepartmentCode = "ACC", Name = "Phòng Kế toán" }
            };
            context.Departments.AddRange(departments);

            var roles = new List<Role>
            {
                new Role { RoleCode = "HR", RoleName = "Nhân sự" },              // ID 1
                new Role { RoleCode = "MANAGER", RoleName = "Quản lý" },         // ID 2
                new Role { RoleCode = "EMP", RoleName = "Nhân viên" }            // ID 3
            };
            context.Roles.AddRange(roles);
            context.SaveChanges(); // Lưu để lấy ID

            // Lấy các biến tiện dùng sau này
            var deptIT = departments.First(d => d.DepartmentCode == "IT");
            var deptHR = departments.First(d => d.DepartmentCode == "HR");
            var deptSALE = departments.First(d => d.DepartmentCode == "SALE");
            var deptACC = departments.First(d => d.DepartmentCode == "ACC");
            
            var roleManager = roles.First(r => r.RoleCode == "MANAGER");
            var roleHR = roles.First(r => r.RoleCode == "HR");
            var roleEmp = roles.First(r => r.RoleCode == "EMP");
            

            // Password hash chung "123456"
            var passwordHasher = new PasswordHasher();
            string passwordHash = passwordHasher.HashPassword("123456");

            // --- B. TẠO TÀI KHOẢN (BỎ CEO, BẮT ĐẦU TỪ MANAGER) ---

            // 1. TẠO MANAGER CHO MỖI PHÒNG BAN (Không có người báo cáo)

            // Manager IT
            var managerIT = new Employee
            {
                EmployeeCode = "EMP001",
                FullName = "Trần Văn IT Manager",
                CompanyEmail = "it.manager@company.com",
                PersonalEmail = "itmanager@hrm.com",
                PhoneNumber = "0901234567",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title == "IT Manager").Id,
                DirectManagerId = null,  // Không có người báo cáo
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nam",
                DateOfBirth = new DateTime(1985, 3, 15),
                CurrentAddress = "TP.HCM",
                CitizenIdNumber = "0851001234568",
                PersonalTaxCode = "0851001235",
                SocialInsuranceNumber = "8501001235",
                BirthPlaceProvince = "Hồ Chí Minh",
                BirthPlaceDistrict = "Quận 3"
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
                FullName = "Nguyễn Thị HR Manager",
                CompanyEmail = "hr.manager@company.com",
                PersonalEmail = "hrmanager@hrm.com",
                PhoneNumber = "0909888777",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title == "HR Manager").Id,
                DirectManagerId = null,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1988, 5, 20),
                CurrentAddress = "Hà Nội",
                CitizenIdNumber = "0881005678901",
                PersonalTaxCode = "0881005678",
                SocialInsuranceNumber = "8801005678",
                BirthPlaceProvince = "Hà Nội",
                BirthPlaceDistrict = "Hoàn Kiếm"
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
                FullName = "Lê Văn Sales Manager",
                CompanyEmail = "sale.manager@company.com",
                PersonalEmail = "salemanager@hrm.com",
                PhoneNumber = "0908765432",
                DepartmentId = deptSALE.Id,
                JobTitleId = jobTitles.First(j => j.Title == "Sales Manager").Id,
                DirectManagerId = null,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nam",
                DateOfBirth = new DateTime(1987, 7, 10),
                CurrentAddress = "Đà Nẵng",
                CitizenIdNumber = "0871007654321",
                PersonalTaxCode = "0871007654",
                SocialInsuranceNumber = "8701007654",
                BirthPlaceProvince = "Đà Nẵng",
                BirthPlaceDistrict = "Hải Châu"
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

            // 2. TẠO MANAGER CHO ACC DEPARTMENT

            // Manager ACC
            var managerACC = new Employee
            {
                EmployeeCode = "EMP004",
                FullName = "Võ Thị ACC Manager",
                CompanyEmail = "acc.manager@company.com",
                PersonalEmail = "accmanager@hrm.com",
                PhoneNumber = "0907654321",
                DepartmentId = deptACC.Id,
                JobTitleId = jobTitles.First(j => j.Title == "Accounting Manager").Id,
                DirectManagerId = null,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1989, 4, 12),
                CurrentAddress = "TP.HCM",
                CitizenIdNumber = "0891001234569",
                PersonalTaxCode = "0891001236",
                SocialInsuranceNumber = "8901001236",
                BirthPlaceProvince = "TP.HCM",
                BirthPlaceDistrict = "Quận 5"
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

            // 3. TẠO HR SPECIALIST CHO MỖI PHÒNG BAN

            var hrByDepartment = new Dictionary<int, (int empId, string empCode)>();

            // HR for IT
            var hrIT = new Employee
            {
                EmployeeCode = "EMP006",
                FullName = "Trương Thị IT HR",
                CompanyEmail = "it.hr@company.com",
                PersonalEmail = "ithr@hrm.com",
                PhoneNumber = "0909111222",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerIT.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1993, 3, 8),
                CurrentAddress = "TP.HCM",
                CitizenIdNumber = "0930308234561",
                PersonalTaxCode = "0930308234",
                SocialInsuranceNumber = "9303082345",
                BirthPlaceProvince = "TP.HCM",
                BirthPlaceDistrict = "Quận 2"
            };
            context.Employees.Add(hrIT);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP006",
                PasswordHash = passwordHash,
                EmployeeId = hrIT.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for HR
            var hrHR = new Employee
            {
                EmployeeCode = "EMP007",
                FullName = "Lương Thị HR HR",
                CompanyEmail = "hr.hr@company.com",
                PersonalEmail = "hrhr@hrm.com",
                PhoneNumber = "0909222333",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerHR.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1992, 8, 25),
                CurrentAddress = "Hà Nội",
                CitizenIdNumber = "0920825678902",
                PersonalTaxCode = "0920825678",
                SocialInsuranceNumber = "9208256789",
                BirthPlaceProvince = "Hà Nội",
                BirthPlaceDistrict = "Đống Đa"
            };
            context.Employees.Add(hrHR);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP007",
                PasswordHash = passwordHash,
                EmployeeId = hrHR.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for SALE
            var hrSALE = new Employee
            {
                EmployeeCode = "EMP008",
                FullName = "Đặng Thị SALE HR",
                CompanyEmail = "sale.hr@company.com",
                PersonalEmail = "salehr@hrm.com",
                PhoneNumber = "0909333444",
                DepartmentId = deptSALE.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerSALE.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1991, 11, 10),
                CurrentAddress = "Đà Nẵng",
                CitizenIdNumber = "0911110987654",
                PersonalTaxCode = "0911110987",
                SocialInsuranceNumber = "9111109876",
                BirthPlaceProvince = "Đà Nẵng",
                BirthPlaceDistrict = "Hải Châu"
            };
            context.Employees.Add(hrSALE);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP008",
                PasswordHash = passwordHash,
                EmployeeId = hrSALE.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // HR for ACC
            var hrACC = new Employee
            {
                EmployeeCode = "EMP009",
                FullName = "Hồ Thị ACC HR",
                CompanyEmail = "acc.hr@company.com",
                PersonalEmail = "acchr@hrm.com",
                PhoneNumber = "0909444555",
                DepartmentId = deptACC.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                DirectManagerId = managerACC.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nữ",
                DateOfBirth = new DateTime(1994, 7, 20),
                CurrentAddress = "TP.HCM",
                CitizenIdNumber = "0941001234571",
                PersonalTaxCode = "0941001238",
                SocialInsuranceNumber = "9410012345",
                BirthPlaceProvince = "TP.HCM",
                BirthPlaceDistrict = "Quận 4"
            };
            context.Employees.Add(hrACC);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP009",
                PasswordHash = passwordHash,
                EmployeeId = hrACC.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });

            
            // 4. TẠO 1 TEST EMPLOYEE (CỐ ĐỊNH – DÙNG ĐỂ TEST)
            var testEmp = new Employee
            {
                EmployeeCode = "EMP012",
                FullName = "Trần Nhân Viên Test",
                CompanyEmail = "emp012@company.com",
                PersonalEmail = "emp012@hrm.com",
                PhoneNumber = "0909888779",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("Developer")).Id,
                DirectManagerId = managerIT.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                Gender = "Nam",
                DateOfBirth = new DateTime(1998, 6, 15),
                CurrentAddress = "Hà Nội",
                CitizenIdNumber = "0980615234567", // 13 chữ số
                PersonalTaxCode = "0980615234",    // 10 chữ số
                SocialInsuranceNumber = "9806152345", // 10 chữ số
                BirthPlaceProvince = "Hà Nội",
                BirthPlaceDistrict = "Cầu Giấy"
            };

            context.Employees.Add(testEmp);
            context.SaveChanges();


            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP011",
                PasswordHash = passwordHash,
                EmployeeId = testEmp.Id,
                RoleId = roleEmp.RoleId,
                Status = AccountStatus.ACTIVE
            });

            context.SaveChanges();
            
            // 5. TẠO NHÂN VIÊN CHO CÁC PHÒNG BAN (15 IT, 5 HR, 5 SALE, 3 ACC)
            var staffList = new List<Employee>();
            
            // ===== ĐỊNH NGHĨA MIỀN GIÁ TRỊ (TIẾNG VIỆT) =====
            var genderValues = new[] { "Nam", "Nữ" };
            var maritalStatuses = new[] { "Độc thân", "Đã kết hôn", "Đã ly hôn" };
            var employmentTypes = new[] { "Toàn thời gian", "Bán thời gian", "Theo hợp đồng" };
            var contractTypes = new[] { "Vĩnh viễn", "Có thời hạn" };
            
            // Khai báo biến để tái sử dụng trong các vòng lặp
            string ccid;
            string rawPassword;
            string empPasswordHash;
            
            var empFaker = new Faker<Employee>("vi")
                .RuleFor(e => e.FullName, f => f.Name.FullName())
                .RuleFor(e => e.PhoneNumber, f => f.Phone.PhoneNumber("09########"))
                .RuleFor(e => e.PersonalEmail, (f, e) => RemoveSign(e.FullName).ToLower().Replace(" ", "") + "@hrm.com")
                .RuleFor(e => e.DateOfBirth, f => f.Date.Past(25, DateTime.Now.AddYears(-22)))
                .RuleFor(e => e.CurrentAddress, f => f.Address.City())
                .RuleFor(e => e.CitizenIdNumber, f => f.Random.ReplaceNumbers("#############")) // 13 chữ số
                .RuleFor(e => e.PersonalTaxCode, f => f.Random.ReplaceNumbers("##########")) // 10 chữ số
                .RuleFor(e => e.SocialInsuranceNumber, f => f.Random.ReplaceNumbers("##########")) // 10 chữ số
                .RuleFor(e => e.Gender, f => f.PickRandom(genderValues))
                .RuleFor(e => e.MaritalStatus, f => f.PickRandom(maritalStatuses))
                .RuleFor(e => e.EmploymentType, f => f.PickRandom(employmentTypes))
                .RuleFor(e => e.ContractType, f => f.PickRandom(contractTypes))
                .RuleFor(e => e.Nationality, f => "Việt Nam")
                .RuleFor(e => e.Status, f => "Đang làm việc")
                .RuleFor(e => e.HasChildren, f => f.Random.Bool(0.3f))
                .RuleFor(e => e.BirthPlaceProvince, f => f.PickRandom(new[] { "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ" }))
                .RuleFor(e => e.BirthPlaceDistrict, f => f.PickRandom(new[] { "Quận 1", "Quận 3", "Hoàn Kiếm", "Hải Châu" }));

            int empCounter = 12; // Start from EMP012 (EMP011 is test employee)
            
            // 15 IT Staff
            for (int i = 0; i < 15; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{empCounter:000}";
                emp.CompanyEmail = ""; // Sẽ tự tạo từ FullName
                emp.DepartmentId = deptIT.Id;
                emp.JobTitleId = i < 10 
                    ? jobTitles.First(j => j.Title == "IT Senior Developer").Id 
                    : jobTitles.First(j => j.Title == "IT Junior Developer").Id;
                emp.DirectManagerId = managerIT.Id;

                context.Employees.Add(emp);
                context.SaveChanges();
                staffList.Add(emp);
                // Generate password: EMP + last4 CCCD
                ccid = emp.CitizenIdNumber ?? "0000";
                rawPassword = $"EMP{ccid.Substring(ccid.Length - 4)}";
                empPasswordHash = passwordHasher.HashPassword(rawPassword);

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

                ccid = emp.CitizenIdNumber ?? "0000";
                rawPassword = $"EMP{ccid.Substring(ccid.Length - 4)}";
                empPasswordHash = passwordHasher.HashPassword(rawPassword);

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

                ccid = emp.CitizenIdNumber ?? "0000";
                rawPassword = $"EMP{ccid.Substring(ccid.Length - 4)}";
                empPasswordHash = passwordHasher.HashPassword(rawPassword);

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

                ccid = emp.CitizenIdNumber ?? "0000";
                rawPassword = $"EMP{ccid.Substring(ccid.Length - 4)}";
                empPasswordHash = passwordHasher.HashPassword(rawPassword);

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

            // --- C. TẠO REQUEST (Dữ liệu mẫu để test) ---
            Console.WriteLine("--> Tạo Requests ngẫu nhiên...");

            var leaveTypeList = new[] { "Phép năm", "Phép bệnh", "Phép cá nhân", "Nghỉ không lương", "Phép thai sản" };

            // Tạo 15 đơn xin nghỉ phép (10 Pending, 5 Approved nếu có DirectManager)
            for (int i = 0; i < 15; i++)
            {
                var emp = new Faker().PickRandom(staffList);
                // Chỉ đánh dấu Approved nếu nhân viên có DirectManager
                bool isApproved = i >= 10 && emp.DirectManagerId.HasValue; // 5 đơn cuối đã duyệt nếu có manager
                
                // Lấy đúng manager trực tiếp của nhân viên (không fallback sang manager khác)
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
                    Reason = "Nghỉ phép cá nhân",
                    Status = isApproved ? RequestStatus.Approved : RequestStatus.Pending
                });
            }

            // Tạo 10 đơn OT (Chỉ duyệt nếu có DirectManager)
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
                    Reason = "Deadline dự án",
                    Status = RequestStatus.Approved
                });
            }

            context.SaveChanges();

            // ===== SEED INITIAL POINTS FOR ALL EMPLOYEES =====
            Console.WriteLine("--> Tạo điểm thưởng ban đầu cho tất cả nhân viên...");
            var allEmployees = context.Employees.ToList();
            
            // Check if points already exist to avoid duplicates
            var existingPointBalances = context.PointBalances.Select(p => p.EmployeeId).ToList();
            
            foreach (var employee in allEmployees)
            {
                // Skip if this employee already has a point balance
                if (existingPointBalances.Contains(employee.Id))
                {
                    Console.WriteLine($"   ⏭️  {employee.EmployeeCode} đã có điểm, bỏ qua");
                    continue;
                }

                // Tạo PointBalance với 5000 điểm
                var pointBalance = new PointBalance
                {
                    EmployeeId = employee.Id,
                    CurrentBalance = 5000,
                    TotalEarned = 5000,
                    TotalSpent = 0,
                    LastUpdated = DateTime.Now
                };
                context.PointBalances.Add(pointBalance);

                // Tạo PointTransaction để ghi nhận điểm ban đầu
                var initialTransaction = new PointTransaction
                {
                    EmployeeId = employee.Id,
                    TransactionType = "INITIAL",
                    Points = 5000,
                    Description = "Điểm thưởng khởi tạo hệ thống",
                    CreatedAt = DateTime.Now
                };
                context.PointTransactions.Add(initialTransaction);
            }
            context.SaveChanges();
            var newPointsCount = allEmployees.Count - existingPointBalances.Count;
            Console.WriteLine($"--> Đã tạo 5000 điểm cho {newPointsCount} nhân viên mới (tổng: {allEmployees.Count} nhân viên)");

            Console.WriteLine("--> SEED DATA THÀNH CÔNG!");
            Console.WriteLine("==============================================");
            Console.WriteLine("DANH SÁCH TÀI KHOẢN TEST");
            Console.WriteLine("==============================================");
            Console.WriteLine("");
            Console.WriteLine("📋 QUẢN LÝ PHÒNG BAN (Role: MANAGER)");
            Console.WriteLine("  • Username: EMP001 | Password: 123456 | Department: IT");
            Console.WriteLine("  • Username: EMP002 | Password: 123456 | Department: HR");
            Console.WriteLine("  • Username: EMP003 | Password: 123456 | Department: SALE");
            Console.WriteLine("  • Username: EMP004 | Password: 123456 | Department: ACC");
            Console.WriteLine("");
            Console.WriteLine("👥 NHÂN VIÊN NHÂN SỰ (Role: HR)");
            Console.WriteLine("  • Username: EMP005 | Password: 123456 | Department: IT");
            Console.WriteLine("  • Username: EMP006 | Password: 123456 | Department: HR");
            Console.WriteLine("  • Username: EMP007 | Password: 123456 | Department: SALE");
            Console.WriteLine("  • Username: EMP008 | Password: 123456 | Department: ACC");
            Console.WriteLine("");
            Console.WriteLine("👨‍💼 NHÂN VIÊN (Role: EMP)");
            Console.WriteLine("  • Username: EMP009 | Password: 123456 | Department: IT (Test Employee)");
            Console.WriteLine("  • Username: EMP010-EMP013 | Password: 123456 | Department: IT (4 staff)");
            Console.WriteLine("  • Username: EMP014-EMP018 | Password: 123456 | Department: SALE (5 staff)");
            Console.WriteLine("  • Username: EMP019-EMP021 | Password: 123456 | Department: HR (3 staff)");
            Console.WriteLine("  • Username: EMP022-EMP024 | Password: 123456 | Department: ACC (3 staff)");
            Console.WriteLine("");
            Console.WriteLine("==============================================");
            Console.WriteLine("🔒 DEFAULT LOGIN INFORMATION");
            Console.WriteLine("==============================================");
            Console.WriteLine("• All passwords are: 123456");
            Console.WriteLine("• Use any username from the list above");
            Console.WriteLine("• Permissions depend on assigned Role");
            Console.WriteLine("==============================================");
        }

        // Password không còn sử dụng HRM format nữa, đã chuẩn hóa thành 123456 cho tất cả
        // Giữ lại function này để tương thích nếu cần
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