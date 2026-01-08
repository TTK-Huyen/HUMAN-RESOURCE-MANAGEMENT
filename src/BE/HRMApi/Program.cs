using HrmApi.Data;
using HrmApi.Repositories;
using HrmApi.Services;
using HrmApi.Services.Notifications;
using HrmApi.Security;
using Microsoft.EntityFrameworkCore;
using HrmApi.Messaging;
using HrmApi.Messaging.RabbitMq;
using HrmApi.Consumers.Requests;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

// --- 1. Cấu hình DB & CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy => { policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod(); });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// --- JWT Authentication Configuration ---
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HRMApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HRMClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

// --- 2. Đăng ký Services (DI) ---
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddHttpClient<INotificationPublisher, NotificationPublisher>();

// Repositories
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();
builder.Services.AddScoped<IEmployeeRequestRepository, EmployeeRequestRepository>();
builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<IOvertimeRequestRepository, OvertimeRequestRepository>();
builder.Services.AddScoped<IResignationRequestRepository, ResignationRequestRepository>();
builder.Services.AddScoped<IProfileUpdateRequestRepository, ProfileUpdateRequestRepository>();
builder.Services.AddScoped<IRequestsDashboardRepository, RequestsDashboardRepository>();
builder.Services.AddScoped<IRequestHistoryRepository, RequestHistoryRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<ICampaignRegistrationRepository, CampaignRegistrationRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IRequestApprovalService, RequestApprovalService>();
builder.Services.AddScoped<IRequestStatusService, RequestStatusService>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IOvertimeRequestService, OvertimeRequestService>();
builder.Services.AddScoped<IResignationRequestService, ResignationRequestService>();
builder.Services.AddScoped<IProfileUpdateRequestService, ProfileUpdateRequestService>();
builder.Services.AddScoped<IRequestsDashboardService, RequestsDashboardService>();
builder.Services.AddScoped<IRequestsDashboardListService, RequestsDashboardListService>();
builder.Services.AddScoped<IRequestHistoryService, RequestHistoryService>();
builder.Services.AddScoped<IExcelImportService, ExcelImportService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<ICampaignRegistrationService, CampaignRegistrationService>();
builder.Services.AddScoped<ICampaignDetailService, CampaignDetailService>();
builder.Services.AddScoped<ICampaignListService, CampaignListService>();

// Point System Services
builder.Services.AddScoped<IPointService, PointService>();
builder.Services.AddScoped<MonthlyPointAllocationService>();

builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();

// consumer chạy nền
builder.Services.AddHostedService<RequestSubmittedNotificationConsumer>();


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();

var app = builder.Build();

// --- 3. SEED DATA (Gọi Class DataSeeder) ---
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            // 1. Đảm bảo database đã được tạo và update mới nhất
            // db.Database.Migrate(); // Tạm disable nếu có pending migrations
            
            // 2. GỌI HÀM SEED TỪ CLASS BOGUS BẠN VỪA TẠO
            HrmApi.Data.DataSeeder.Seed(db); 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"--> Lỗi khi tạo dữ liệu ảo: {ex.Message}");
            Console.WriteLine($"--> Chi tiết lỗi: {ex.InnerException?.Message}");
            Console.WriteLine($"--> Stack trace: {ex.StackTrace}");
            // Không throw - cho app chạy tiếp
        }
    }
}
// --- 4. Middleware ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRM API v1");
    c.RoutePrefix = string.Empty;
});

app.UseStaticFiles();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();