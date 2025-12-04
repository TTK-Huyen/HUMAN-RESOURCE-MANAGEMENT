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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
        }
    }
}
