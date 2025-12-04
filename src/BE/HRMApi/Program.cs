using HrmApi.Repositories;
using HrmApi.Services;
using Microsoft.EntityFrameworkCore;
using HrmApi.Models;
using HrmApi.Data;

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
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
