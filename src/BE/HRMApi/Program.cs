using System;
using HrmApi.Data;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.EntityFrameworkCore;


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000") // React app
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IRequestApprovalService, RequestApprovalService>();
// (Nếu sau này có auth thì giữ, còn chưa dùng cũng không sao)
builder.Services.AddAuthorization();

// ===================================================
// 2. Cấu hình DbContext (MySQL)
// ===================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? throw new InvalidOperationException("DefaultConnection not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// // ===================================================
// // 3. Authentication + Authorization (JWT)
// // ===================================================

// var jwtSettings = builder.Configuration.GetSection("Jwt");
// var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

// builder.Services
//     .AddAuthentication(options =>
//     {
//         options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//         options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//     })
//     .AddJwtBearer(options =>
//     {
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuer = true,
//             ValidateAudience = true,
//             ValidateLifetime = true,
//             ValidateIssuerSigningKey = true,

//             ValidIssuer = jwtSettings["Issuer"],
//             ValidAudience = jwtSettings["Audience"],
//             IssuerSigningKey = new SymmetricSecurityKey(key)
//         };
//     });

// builder.Services.AddAuthorization();


// ===================================================
// 4. Đăng ký Repository & Service theo từng Use Case
// ===================================================

// UC 1.6 – Employee profile + profile update
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IProfileUpdateRequestRepository, ProfileUpdateRequestRepository>();
builder.Services.AddScoped<IProfileUpdateRequestService, ProfileUpdateRequestService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();


// UC 2.20 – Xem/tracking status request
builder.Services.AddScoped<IEmployeeRequestRepository, EmployeeRequestRepository>();
builder.Services.AddScoped<IRequestStatusService, RequestStatusService>();

builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IOvertimeRequestRepository, OvertimeRequestRepository>();
builder.Services.AddScoped<IResignationRequestRepository, ResignationRequestRepository>();

builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IOvertimeRequestService, OvertimeRequestService>();
builder.Services.AddScoped<IResignationRequestService, ResignationRequestService>();

// UC 2.10 – Department dropdown
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// Login
// Đăng ký cho Repository mới
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();

// Đăng ký cho Service Auth
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<HrmApi.Security.IPasswordHasher, HrmApi.Security.PasswordHasher>();
builder.Services.AddScoped<HrmApi.Security.IJwtTokenService, HrmApi.Security.JwtTokenService>();
//Dashboard summary
builder.Services.AddScoped<IRequestsDashboardService, RequestsDashboardService>();
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();

//Dashboard list requests
builder.Services.AddScoped<IRequestsDashboardRepository, RequestsDashboardRepository>();
builder.Services.AddScoped<IRequestsDashboardListService, RequestsDashboardListService>();

// UC 2.19
builder.Services.AddScoped<IRequestHistoryRepository, RequestHistoryRepository>();
builder.Services.AddScoped<IRequestHistoryService, RequestHistoryService>();
// Excel Import Service
builder.Services.AddScoped<IExcelImportService, ExcelImportService>();

//EVEN CATCHING 
builder.Services.AddHttpClient<HrmApi.Services.Notifications.INotificationPublisher,
                              HrmApi.Services.Notifications.NotificationPublisher>();

// Campaign
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<ICampaignService, CampaignService>();

builder.Services.AddScoped<ICampaignRegistrationRepository, CampaignRegistrationRepository>();
builder.Services.AddScoped<ICampaignRegistrationService, CampaignRegistrationService>();

var app = builder.Build();

// ===================================================
// 5. Áp dụng migration + seed data mẫu (chỉ Dev)
// ===================================================
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Apply tất cả migration
    db.Database.Migrate();

    // Seed Department
    if (!db.Departments.Any())
    {
        db.Departments.AddRange(
            new Department { DepartmentCode = "1", Name = "IT" },
            new Department { DepartmentCode = "2", Name = "HR" }
        );
    }

    // Seed JobTitle (positions)
    if (!db.JobTitles.Any())
    {
        db.JobTitles.AddRange(
            new JobTitle { Id = 1, Title = "Software Engineer" },
            new JobTitle { Id = 2, Title = "HR Specialist" }
        );
        // Đảm bảo DB/migration đã apply
        //db.Database.Migrate();
        db.Database.EnsureCreated();

        if (!db.Departments.Any())
        {
            db.Departments.AddRange(
                new Department { DepartmentCode = "1", Name = "IT" },
                new Department { DepartmentCode = "2", Name = "HR" }
            );
        }
        var itDept = db.Departments.First(d => d.DepartmentCode == "1");
        var hrDept = db.Departments.First(d => d.DepartmentCode == "2");

        if (!db.JobTitles.Any())
        {
            db.JobTitles.AddRange(
                new JobTitle { Id = 1, Title = "Software Engineer" },
                new JobTitle { Id = 2, Title = "HR Specialist" }
            );
        }

        if (!db.Employees.Any())
        {
            var manager = new Employee
            {
                EmployeeCode = "EMP001",
                EmployeeName = "John Doe",
                DateOfBirth  = new DateTime(1995, 5, 10),
                Gender       = "Male",
                Nationality  = "Vietnamese",
                MaritalStatus = "Single",
                HasChildren   = false,
                PersonalTaxCode       = "PTX001",
                SocialInsuranceNumber = "SI001",
                CurrentAddress = "HCM City",
                Status         = "Active",

                Department   = itDept,   // nếu bạn đang dùng biến itDept/hrDept
                JobTitleId   = 1,
                DirectManagerId = null,  // không có quản lý
                EmploymentType   = "Full-time",
                ContractType     = "Indefinite",
                ContractStartDate = new DateTime(2023, 1, 1)
            };

            var staff = new Employee
            {
                EmployeeCode = "EMP002",
                EmployeeName = "Jane Smith",
                DateOfBirth  = new DateTime(1998, 6, 15),
                Gender       = "Female",
                Nationality  = "Vietnamese",
                MaritalStatus = "Married",
                HasChildren   = true,
                PersonalTaxCode       = "PTX002",
                SocialInsuranceNumber = "SI002",
                CurrentAddress = "HN City",
                Status         = "Active",

                Department  = itDept,     // hoặc hrDept
                JobTitleId  = 2,
                // ❗ dùng navigation, KHÔNG hard-code Id
                DirectManager = manager,

                EmploymentType    = "Full-time",
                ContractType      = "Indefinite",
                ContractStartDate = new DateTime(2023, 2, 1),
                ContractEndDate   = new DateTime(2025, 2, 1)
            };

            db.Employees.AddRange(manager, staff);
        }

        db.SaveChanges();
    }

    // Seed Employees
    if (!db.Employees.Any())
    {
        db.Employees.AddRange(
            new Employee
            {
                EmployeeCode = "EMP001",
                EmployeeName = "John Doe",
                DateOfBirth = new DateTime(1995, 5, 10),
                Gender = "Male",
                Nationality = "Vietnamese",

                MaritalStatus = "Single",
                HasChildren = false,

                PersonalTaxCode = "PTX001",
                SocialInsuranceNumber = "SI001",
                CurrentAddress = "HCM City",
                Status = "Active",

                DepartmentId = 1,
                JobTitleId = 1,
                DirectManagerId = null,

                EmploymentType = "Full-time",
                ContractType = "Indefinite",
                ContractStartDate = new DateTime(2023, 1, 1)
            },
            new Employee
            {
                EmployeeCode = "EMP002",
                EmployeeName = "Jane Smith",
                DateOfBirth = new DateTime(1998, 6, 15),
                Gender = "Female",
                Nationality = "Vietnamese",

                MaritalStatus = "Married",
                HasChildren = true,

                PersonalTaxCode = "PTX002",
                SocialInsuranceNumber = "SI002",
                CurrentAddress = "HN City",
                Status = "Active",

                DepartmentId = 1,
                JobTitleId = 2,
                DirectManagerId = 1,

                EmploymentType = "Full-time",
                ContractType = "Indefinite",
                ContractStartDate = new DateTime(2023, 2, 1),
                ContractEndDate = new DateTime(2025, 2, 1)
            }
        );
    }    // Add commet : seed role
    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new Role { RoleId = 1, RoleCode = "EMP", RoleName = "Employee" },
            new Role { RoleId = 2, RoleCode = "HR", RoleName = "HR" },
            new Role { RoleId = 3, RoleCode = "MANAGER", RoleName = "Manager" }
        );
        db.SaveChanges();
    }

    // Seed UserAccount (tài khoản đăng nhập mẫu cho từng role)
    if (!db.UserAccounts.Any())
    {
        var passwordHasher = scope.ServiceProvider.GetRequiredService<HrmApi.Security.IPasswordHasher>();
        var employees = db.Employees.ToList();
        
        // Account cho EMPLOYEE role
        db.UserAccounts.Add(new UserAccount
        {
            Username = "employee",
            PasswordHash = passwordHasher.HashPassword("Emp123!@"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.First().Id, // Employee đầu tiên
            RoleId = 1, // EMPLOYEE
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        // Account cho HR role
        db.UserAccounts.Add(new UserAccount
        {
            Username = "hr",
            PasswordHash = passwordHasher.HashPassword("Hr123!@#"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.Skip(1).First().Id, // Employee thứ hai
            RoleId = 2, // HR
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        // Account cho MANAGER role  
        db.UserAccounts.Add(new UserAccount
        {
            Username = "manager",
            PasswordHash = passwordHasher.HashPassword("Mgr123!@#"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.First().Id, // Có thể dùng chung employee
            RoleId = 3, // MANAGER
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        db.SaveChanges();
    }
    if (!db.UserAccounts.Any())
    {
        var passwordHasher = scope.ServiceProvider.GetRequiredService<HrmApi.Security.IPasswordHasher>();
        var employees = db.Employees.ToList();
        
        // Account cho ADMIN role
        db.UserAccounts.Add(new UserAccount
        {
            Username = "admin",
            PasswordHash = passwordHasher.HashPassword("Admin123!"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.First().Id, // Employee đầu tiên
            RoleId = 1, // ADMIN
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        // Account cho EMPLOYEE role
        db.UserAccounts.Add(new UserAccount
        {
            Username = "employee",
            PasswordHash = passwordHasher.HashPassword("Emp123!@"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.Skip(1).First().Id, // Employee thứ hai
            RoleId = 2, // EMP
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        // Account cho HR role  
        db.UserAccounts.Add(new UserAccount
        {
            Username = "hr",
            PasswordHash = passwordHasher.HashPassword("Hr123!@#"), // Password thỏa mãn ràng buộc
            EmployeeId = employees.First().Id, // Có thể dùng chung employee với admin hoặc tạo thêm
            RoleId = 3, // HR
            Status = AccountStatus.ACTIVE,
            LastLoginAt = null
        });

        db.SaveChanges();
    }

    db.SaveChanges();
}

// ===================================================
// 6. Middleware pipeline
// ===================================================

// Luôn bật Swagger cho tiện debug đồ án
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
    // Nếu muốn swagger ở root "/", bỏ comment dòng dưới:
    // c.RoutePrefix = string.Empty;
});

app.UseStaticFiles();

// 6. (Tuỳ chọn) Https redirection – nếu gây phiền thì comment lại
// app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins); // Kết nối FE
// app.UseAuthorization();

app.MapControllers();

app.Run();
