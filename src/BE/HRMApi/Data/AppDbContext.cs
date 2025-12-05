using Microsoft.EntityFrameworkCore;
using HrmApi.Models;

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
        public DbSet<ProfileUpdateHistory> ProfileUpdateHistories => Set<ProfileUpdateHistory>();
        public DbSet<ProfileUpdateRequestDetail> ProfileUpdateRequestDetails => Set<ProfileUpdateRequestDetail>();
        public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<OvertimeRequest> OvertimeRequests => Set<OvertimeRequest>();
        public DbSet<ResignationRequest> ResignationRequests => Set<ResignationRequest>();

        public DbSet<Request> Requests => Set<Request>();
        public DbSet<ProfileUpdateRequest> ProfileUpdateRequests => Set<ProfileUpdateRequest>();

        
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
                .HasMany(e => e.ProfileUpdateHistory)
                .WithOne(h => h.Employee)
                .HasForeignKey(h => h.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProfileUpdateHistory>()
                .HasMany(h => h.Details)
                .WithOne(d => d.UpdateRequest)
                .HasForeignKey(d => d.UpdateRequestId)
                .OnDelete(DeleteBehavior.Cascade);

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
