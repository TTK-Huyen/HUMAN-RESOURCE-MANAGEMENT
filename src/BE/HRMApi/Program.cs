using HrmApi.Data;
using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.EntityFrameworkCore;
using HrmApi.Models;
var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký DbContext (MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Ví dụ với Pomelo:
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    )
);

// 2. Đăng ký Controllers
builder.Services.AddControllers();

// 3. Đăng ký Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Đăng ký Repository & Service
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IOvertimeRequestRepository, OvertimeRequestRepository>();
builder.Services.AddScoped<IResignationRequestRepository, ResignationRequestRepository>();

builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IOvertimeRequestService, OvertimeRequestService>();
builder.Services.AddScoped<IResignationRequestService, ResignationRequestService>();

var app = builder.Build();

// SEED DATA MẪU
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Đảm bảo DB/migration đã apply
    db.Database.Migrate();

    if (!db.Departments.Any())
    {
        db.Departments.AddRange(
            new Department { DepartmentCode = "1", Name = "IT" },
            new Department {  DepartmentCode = "2" , Name = "HR" }
        );
    }

    if (!db.JobTitles.Any())
    {
        db.JobTitles.AddRange(
            new JobTitle { Id = 1, Title = "Software Engineer" },
            new JobTitle { Id = 2, Title = "HR Specialist" }
        );
    }

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

// 5. ALWAYS bật Swagger (cho đồ án cho khoẻ)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
    // c.RoutePrefix = string.Empty; // nếu muốn Swagger ở root "/"
});

// 6. (Tuỳ chọn) Https redirection – nếu gây phiền thì comment lại
// app.UseHttpsRedirection();

// app.UseAuthorization();

// 7. Map controller routes
app.MapControllers();

app.Run();
