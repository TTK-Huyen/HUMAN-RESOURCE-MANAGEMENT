using HrSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<ProfileUpdateRequest> ProfileUpdateRequests => Set<ProfileUpdateRequest>();
        public DbSet<ProfileUpdateRequestDetail> ProfileUpdateRequestDetails => Set<ProfileUpdateRequestDetail>();

        public DbSet<Timesheet> Timesheets => Set<Timesheet>();
        public DbSet<Request> Requests => Set<Request>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<TimesheetUpdateRequest> TimesheetUpdateRequests => Set<TimesheetUpdateRequest>();
        public DbSet<OvertimeRequest> OvertimeRequests => Set<OvertimeRequest>();
        public DbSet<ResignationRequest> ResignationRequests => Set<ResignationRequest>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
