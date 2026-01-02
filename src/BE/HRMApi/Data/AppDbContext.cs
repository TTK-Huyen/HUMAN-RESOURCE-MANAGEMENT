using Microsoft.EntityFrameworkCore;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HrmApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<EmployeeBankAccount> EmployeeBankAccounts => Set<EmployeeBankAccount>();
        public DbSet<EmployeeEducation> EmployeeEducations => Set<EmployeeEducation>();
        public DbSet<EmployeePhoneNumber> EmployeePhoneNumbers => Set<EmployeePhoneNumber>();
        public DbSet<JobTitle> JobTitles => Set<JobTitle>();
        
        public DbSet<ProfileUpdateRequestDetail> ProfileUpdateRequestDetails => Set<ProfileUpdateRequestDetail>();
        public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
        
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<OvertimeRequest> OvertimeRequests => Set<OvertimeRequest>();
        public DbSet<ResignationRequest> ResignationRequests => Set<ResignationRequest>();

        public DbSet<Request> Requests => Set<Request>();
        public DbSet<ProfileUpdateRequest> ProfileUpdateRequests => Set<ProfileUpdateRequest>();

        public DbSet<Campaign> Campaigns => Set<Campaign>();
        public DbSet<CampaignRegistration> CampaignRegistrations => Set<CampaignRegistration>();
        public DbSet<CampaignResult> CampaignResults => Set<CampaignResult>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1–n Employee – Request
            modelBuilder.Entity<Request>()
                .HasOne(r => r.Employee)
                .WithMany(e => e.Requests)
                .HasForeignKey(r => r.EmployeeId);

            // 1–1 Request – LeaveRequest (shared PK)
            modelBuilder.Entity<Request>()
                .HasOne(r => r.LeaveRequest)
                .WithOne(l => l.Request)
                .HasForeignKey<LeaveRequest>(l => l.Id);

            // Tương tự nếu sau này làm OT / Resign:
            modelBuilder.Entity<Request>()
                .HasOne(r => r.OvertimeRequest)
                .WithOne(o => o.Request)
                .HasForeignKey<OvertimeRequest>(o => o.Id);

            modelBuilder.Entity<Request>()
                .HasOne(r => r.ResignationRequest)
                .WithOne(rs => rs.Request)
                .HasForeignKey<ResignationRequest>(rs => rs.Id);

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.ProfileUpdateRequests)
                .WithOne(h => h.Employee)
                .HasForeignKey(h => h.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Campaign>()
                .Property(c => c.Status)
                .HasConversion(new EnumToStringConverter<CampaignStatus>());

            modelBuilder.Entity<CampaignRegistration>()
                .Property(r => r.Status)
                .HasConversion(new EnumToStringConverter<RegistrationStatus>());

            // 2. Cấu hình rằng mã Campaign và cặp (Campaign + Employee) là duy nhất
            modelBuilder.Entity<Campaign>()
                .HasIndex(c => c.CampaignCode)
                .IsUnique();

            modelBuilder.Entity<CampaignRegistration>()
                .HasIndex(cr => new { cr.CampaignId, cr.EmployeeId })
                .IsUnique();

            modelBuilder.Entity<CampaignResult>()
                .HasIndex(cr => new { cr.CampaignId, cr.EmployeeId })
                .IsUnique();

            // 3. Cấu hình số thập phân cho kết quả
            modelBuilder.Entity<CampaignResult>()
                .Property(c => c.ResultValue)
                .HasPrecision(10, 2);

            // 4. Dữ liệu mẫu (Seed Data) cho Campaign
            modelBuilder.Entity<JobTitle>()
                .HasData(
                new JobTitle
                {
                    Id = 1,
                    Title = "Software Engineer",
                    Level = "Junior"
                },
                new JobTitle
                {
                    Id = 2,
                    Title = "Project Manager",
                    Level = "Senior"
                }
            );
        }
    }
}
