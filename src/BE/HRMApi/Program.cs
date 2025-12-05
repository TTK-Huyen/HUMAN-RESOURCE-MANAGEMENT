using System;
using HrmApi.Data;
using HrmApi.Models;
using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// ===================================================
// 1. Đăng ký các service cơ bản
// ===================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// UC 2.1, 2.5, 2.8 – Leave / Overtime / Resignation
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IOvertimeRequestRepository, OvertimeRequestRepository>();
builder.Services.AddScoped<IResignationRequestRepository, ResignationRequestRepository>();

builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IOvertimeRequestService, OvertimeRequestService>();
builder.Services.AddScoped<IResignationRequestService, ResignationRequestService>();

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

// Nếu bật HTTPS redirection trên máy bạn bị lỗi port thì cứ để comment:
// app.UseHttpsRedirection();

// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
