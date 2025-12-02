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

    // Nếu chưa có employee nào thì seed
    if (!db.Employees.Any())
    {
        db.Employees.AddRange(
            new Employee { EmployeeCode = "EMP001" },
            new Employee { EmployeeCode = "EMP002" }
        );

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
// app.UseHttpsRedirection();

app.UseAuthorization();

// 7. Map controller routes
app.MapControllers();

app.Run();
