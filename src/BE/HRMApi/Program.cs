using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.EntityFrameworkCore;
using HrmApi.Models;
using HrmApi.Data;
using Microsoft.Extensions.DependencyInjection; // (có cũng được, thiếu thì thêm dòng này)

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
builder.Services.AddAuthorization();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"]
    ?? throw new InvalidOperationException("DefaultConnection not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});
// UC 1.6
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IProfileUpdateRequestRepository, ProfileUpdateRequestRepository>();
builder.Services.AddScoped<IProfileUpdateRequestService, ProfileUpdateRequestService>();
//UC 2.20
builder.Services.AddScoped<IEmployeeRequestRepository, EmployeeRequestRepository>();
builder.Services.AddScoped<IRequestStatusService, RequestStatusService>();

builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IOvertimeRequestRepository, OvertimeRequestRepository>();
builder.Services.AddScoped<IResignationRequestRepository, ResignationRequestRepository>();

builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IOvertimeRequestService, OvertimeRequestService>();
builder.Services.AddScoped<IResignationRequestService, ResignationRequestService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // 🔹 THÊM SCOPE Ở ĐÂY
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var itDept = new Department { DepartmentCode = "1", Name = "IT" };
        var hrDept = new Department { DepartmentCode = "2", Name = "HR" };
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
}

// 5. ALWAYS bật Swagger (cho đồ án cho khoẻ)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
    // c.RoutePrefix = string.Empty; // nếu muốn Swagger ở root "/"
});

// 6. (Tuỳ chọn) Https redirection – nếu gây phiền thì comment lại
app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins); // Kết nối FE
app.UseAuthorization();

// 7. Map controller routes
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
