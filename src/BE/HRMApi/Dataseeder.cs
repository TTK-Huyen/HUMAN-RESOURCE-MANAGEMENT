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

            Console.WriteLine("--> Bắt đầu tạo dữ liệu (33 Employees: 1 Manager, 1 HR, 31 Staff)...");
            Randomizer.Seed = new Random(12345); // Seed cố định

            // --- A. TẠO DANH MỤC (JobTitles, Departments, Roles) ---
            var jobTitles = new List<JobTitle>
            {
                new JobTitle { Title = "Giám đốc (CEO)", Level = "Giám đốc" },
                new JobTitle { Title = "Trưởng phòng (Manager)", Level = "Quản lý" },
                new JobTitle { Title = "HR Specialist", Level = "Chuyên viên" },
                new JobTitle { Title = "Senior Developer", Level = "Chuyên viên" },
                new JobTitle { Title = "Junior Developer", Level = "Nhân viên" },
                new JobTitle { Title = "Tester/QC", Level = "Nhân viên" },
                new JobTitle { Title = "Intern", Level = "Thực tập sinh" }
            };
            context.JobTitles.AddRange(jobTitles);

            var departments = new List<Department>
            {
                new Department { DepartmentCode = "BGD", Name = "Ban Giám Đốc" },
                new Department { DepartmentCode = "IT", Name = "Phòng Công nghệ Thông tin" },
                new Department { DepartmentCode = "HR", Name = "Phòng Nhân Sự" },
                new Department { DepartmentCode = "SALE", Name = "Phòng Kinh Doanh" },
                new Department { DepartmentCode = "ACC", Name = "Phòng Kế toán" },
                new Department { DepartmentCode = "ADMIN", Name = "Phòng Hành chính" }
            };
            context.Departments.AddRange(departments);

            var roles = new List<Role>
            {
                new Role { RoleCode = "ADMIN", RoleName = "Quản trị viên" },      // ID 1
                new Role { RoleCode = "HR", RoleName = "Nhân sự" },              // ID 2
                new Role { RoleCode = "MANAGER", RoleName = "Quản lý" },         // ID 3
                new Role { RoleCode = "EMP", RoleName = "Nhân viên" }            // ID 4
            };
            context.Roles.AddRange(roles);
            context.SaveChanges(); // Lưu để lấy ID

            // Lấy các biến tiện dùng sau này
            var deptIT = departments.First(d => d.DepartmentCode == "IT");
            var deptHR = departments.First(d => d.DepartmentCode == "HR");
            var roleManager = roles.First(r => r.RoleCode == "MANAGER");
            var roleHR = roles.First(r => r.RoleCode == "HR");
            var roleEmp = roles.First(r => r.RoleCode == "EMP");
            

            // Password hash chung "123456"
            var passwordHasher = new PasswordHasher();
            string passwordHash = passwordHasher.HashPassword("123456");

            // --- B. TẠO TÀI KHOẢN ---

            // 1. TẠO MANAGER (Cố định)
            var manager = new Employee
            {
                EmployeeCode = "EMP001",
                FullName = "Trần Văn Quản Lý",
                PersonalEmail = "manager@hrm.com",
                PhoneNumber = "0901234567",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("Manager")).Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                DateOfBirth = new DateTime(1985, 1, 1),
                CurrentAddress = "TP.HCM",
                CitizenIdNumber = "0851001234567", // 13 chữ số
                PersonalTaxCode = "0851001234",    // 10 chữ số
                SocialInsuranceNumber = "8501001234" // 10 chữ số
            };
            context.Employees.Add(manager);
            context.SaveChanges(); // Lưu ngay để lấy ID làm sếp cho nhân viên

            context.UserAccounts.Add(new UserAccount
            {
                Username = "manager",
                PasswordHash = passwordHash,
                EmployeeId = manager.Id,
                RoleId = roleManager.RoleId,
                Status = AccountStatus.ACTIVE
            });

            // 2. TẠO HR (Cố định)
            var hr = new Employee
            {
                EmployeeCode = "EMP002",
                FullName = "Nguyễn Thị Nhân Sự",
                PersonalEmail = "hr@hrm.com",
                PhoneNumber = "0909888777",
                DepartmentId = deptHR.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("HR")).Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                DateOfBirth = new DateTime(1990, 5, 5),
                CurrentAddress = "Hà Nội",
                CitizenIdNumber = "0901005678901", // 13 chữ số
                PersonalTaxCode = "0901005678",    // 10 chữ số
                SocialInsuranceNumber = "9001005678" // 10 chữ số
            };
            context.Employees.Add(hr);
            context.SaveChanges();

            context.UserAccounts.Add(new UserAccount
            {
                Username = "hr",
                PasswordHash = passwordHash,
                EmployeeId = hr.Id,
                RoleId = roleHR.RoleId,
                Status = AccountStatus.ACTIVE
            });
            
            // 3. TẠO 1 EMP003 (CỐ ĐỊNH – DÙNG ĐỂ TEST)
            var testEmp = new Employee
            {
                EmployeeCode = "EMP003",
                FullName = "Trần Nhân Viên Test",
                PersonalEmail = "emp001@hrm.com",
                PhoneNumber = "0909888779",
                DepartmentId = deptIT.Id,
                JobTitleId = jobTitles.First(j => j.Title.Contains("Developer")).Id,
                DirectManagerId = manager.Id,
                Status = "Đang làm việc",
                Nationality = "Việt Nam",
                ContractType = "Vĩnh viễn",
                DateOfBirth = new DateTime(1998, 6, 15),
                CurrentAddress = "Hà Nội",
                CitizenIdNumber = "0790981234567", // 13 chữ số
                PersonalTaxCode = "0790981234",    // 10 chữ số
                SocialInsuranceNumber = "7909812345" // 10 chữ số
            };

            context.Employees.Add(testEmp);
            context.SaveChanges(); // lấy testEmp.Id


            context.UserAccounts.Add(new UserAccount
            {
                Username = "EMP003",
                PasswordHash = passwordHash,
                EmployeeId = testEmp.Id,
                RoleId = roleEmp.RoleId,
                Status = AccountStatus.ACTIVE
            });

            context.SaveChanges();
            // 3. TẠO 30 NHÂN VIÊN (Còn lại là Employee hết)
            var staffList = new List<Employee>();
            
            // ===== ĐỊNH NGHĨA MIỀN GIÁ TRỊ (TIẾNG VIỆT) =====
            var genderValues = new[] { "Nam", "Nữ", "Khác" };
            var maritalStatuses = new[] { "Độc thân", "Kết hôn", "Ly hôn", "Góa" };
            var employmentTypes = new[] { "Toàn thời gian", "Bán thời gian", "Theo hợp đồng", "Tạm thời" };
            var contractTypes = new[] { "Vĩnh viễn", "Có thời hạn" };
            var leaveTypes = new[] { "Phép năm", "Phép bệnh", "Phép cá nhân", "Nghỉ không lương", "Phép thai sản" };
            
            var empFaker = new Faker<Employee>("vi")
                .RuleFor(e => e.FullName, f => f.Name.FullName())
                .RuleFor(e => e.PhoneNumber, f => f.Phone.PhoneNumber("09########"))
                .RuleFor(e => e.PersonalEmail, (f, e) => RemoveSign(e.FullName).ToLower().Replace(" ", "") + "@hrm.com")
                .RuleFor(e => e.DateOfBirth, f => f.Date.Past(25, DateTime.Now.AddYears(-22)))
                .RuleFor(e => e.CurrentAddress, f => f.Address.City())
                .RuleFor(e => e.CitizenIdNumber, f => f.Random.ReplaceNumbers("#############")) // 13 chữ số
                .RuleFor(e => e.PersonalTaxCode, f => f.Random.ReplaceNumbers("##########")) // 10 chữ số
                .RuleFor(e => e.SocialInsuranceNumber, f => f.Random.ReplaceNumbers("##########")) // 10 chữ số
                .RuleFor(e => e.Gender, f => f.PickRandom(genderValues)) // Nam, Nữ, Khác
                .RuleFor(e => e.MaritalStatus, f => f.PickRandom(maritalStatuses)) // Độc thân, Kết hôn, Ly hôn, Góa
                .RuleFor(e => e.EmploymentType, f => f.PickRandom(employmentTypes)) // Toàn thời gian, Bán thời gian, Theo hợp đồng, Tạm thời
                .RuleFor(e => e.ContractType, f => f.PickRandom(contractTypes)) // Vĩnh viễn, Có thời hạn
                .RuleFor(e => e.Nationality, f => "Việt Nam")
                .RuleFor(e => e.Status, f => "Đang làm việc") // Đang làm việc, Nghỉ việc, Tạm dừng, Từ chức
                .RuleFor(e => e.HasChildren, f => f.Random.Bool(0.5f)); // 50% có con, 50% không

            for (int i = 4; i <= 33; i++)
            {
                var emp = empFaker.Generate();
                emp.EmployeeCode = $"EMP{i:000}"; // EMP004, EMP005...
                emp.DepartmentId = deptIT.Id; // Cho hết vào phòng IT để Manager quản lý
                emp.JobTitleId = jobTitles.First(j => j.Title.Contains("Developer")).Id;
                emp.DirectManagerId = manager.Id; // Tất cả báo cáo cho ông Manager ở trên

                context.Employees.Add(emp);
                context.SaveChanges(); // Lưu để lấy ID
                staffList.Add(emp); // Thêm vào list để tí tạo Request

                // Generate per-employee password: HRM + last4 CCCD
                string rawPassword = GeneratePassword(emp);
                string empPasswordHash = passwordHasher.HashPassword(rawPassword);

                // Tạo UserAccount tương ứng: EMP004, EMP005...
                context.UserAccounts.Add(new UserAccount
                {
                    Username = $"EMP{i:000}", // EMP004, EMP005...
                    PasswordHash = empPasswordHash,
                    EmployeeId = emp.Id,
                    RoleId = roleEmp.RoleId, // Role Employee
                    Status = AccountStatus.ACTIVE
                });
            }
            context.SaveChanges();

            // --- C. TẠO REQUEST (Dữ liệu mẫu để test) ---
            Console.WriteLine("--> Tạo Requests ngẫu nhiên...");

            var leaveTypeList = new[] { "Phép năm", "Phép bệnh", "Phép cá nhân", "Nghỉ không lương", "Phép thai sản" };

            // Tạo 15 đơn xin nghỉ phép (10 Pending, 5 Approved)
            for (int i = 0; i < 15; i++)
            {
                var emp = new Faker().PickRandom(staffList);
                bool isApproved = i >= 10; // 5 đơn cuối đã duyệt

                var req = new Request
                {
                    EmployeeId = emp.Id,
                    RequestType = "LEAVE",
                    Status = isApproved ? "Approved" : "Pending",
                    CreatedAt = DateTime.Now.AddDays(-new Random().Next(1, 10)),
                    ApproverId = isApproved ? manager.Id : null,
                    ApprovedAt = isApproved ? DateTime.Now : null
                };
                context.Requests.Add(req);
                context.SaveChanges();

                context.LeaveRequests.Add(new LeaveRequest
                {
                    Id = req.RequestId,
                    EmployeeId = emp.Id,
                    LeaveType = new Faker().PickRandom(leaveTypeList), // Phép năm, Phép bệnh, Phép cá nhân, Nghỉ không lương, Phép thai sản
                    StartDate = DateTime.Now.AddDays(new Random().Next(2, 10)),
                    EndDate = DateTime.Now.AddDays(new Random().Next(11, 15)),
                    Reason = "Nghỉ phép cá nhân",
                    Status = isApproved ? RequestStatus.Approved : RequestStatus.Pending
                });
            }

            // Tạo 10 đơn OT (Đã duyệt hết để hiện lịch sử)
            for (int i = 0; i < 10; i++)
            {
                var emp = new Faker().PickRandom(staffList);
                var req = new Request
                {
                    EmployeeId = emp.Id,
                    RequestType = "OT",
                    Status = "Approved",
                    CreatedAt = DateTime.Now.AddDays(-5),
                    ApproverId = manager.Id,
                    ApprovedAt = DateTime.Now
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

            Console.WriteLine("--> SEED DATA THÀNH CÔNG!");
            Console.WriteLine("==============================================");
            Console.WriteLine("1. Manager : username='manager' | pass='123456'");
            Console.WriteLine("2. HR      : username='hr'      | pass='123456'");
            Console.WriteLine("3. Staff   : username='EMP001'   | pass='123456' (EMP002 -> EMP031)");
            Console.WriteLine("==============================================");
        }

        // --- HÀM SINH PASSWORD ---
        // Format: [Mã NV] + [Ngày sinh ddMM] + [4 số cuối CCCD]
        // Password format: "HRM" + last 4 digits of Citizen ID (CCCD)
        private static string GeneratePassword(Employee emp)
        {
            // TODO: đổi đúng property name theo model của bạn (CitizenIdNumber / CitizenId / etc.)
            var cccd = emp.CitizenIdNumber ?? "0000";

            // keep digits only (phòng trường hợp có dấu cách / ký tự lạ)
            var digits = new string(cccd.Where(char.IsDigit).ToArray());

            var last4 = digits.Length >= 4 ? digits[^4..] : digits.PadLeft(4, '0');
            return $"HRM{last4}";
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