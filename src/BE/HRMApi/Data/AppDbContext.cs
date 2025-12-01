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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // mapping bảng profile_update_requests
            modelBuilder.Entity<ProfileUpdateRequest>(b =>
            {
                b.ToTable("profile_update_requests");
                b.HasKey(x => x.UpdateRequestId);

                b.Property(x => x.UpdateRequestId).HasColumnName("update_request_id");
                b.Property(x => x.EmployeeId).HasColumnName("employee_id");
                b.Property(x => x.RequestDate).HasColumnName("request_date");
                b.Property(x => x.Status).HasColumnName("status");
                b.Property(x => x.ReviewedBy).HasColumnName("reviewed_by");
                b.Property(x => x.ReviewedAt).HasColumnName("reviewed_at");
                b.Property(x => x.RejectReason).HasColumnName("reject_reason");
                b.Property(x => x.Comment).HasColumnName("comment");

                b.HasOne(x => x.Employee)
                 .WithMany(e => e.ProfileUpdateRequests)
                 .HasForeignKey(x => x.EmployeeId);
            });

            // mapping bảng profile_update_request_details
            modelBuilder.Entity<ProfileUpdateRequestDetail>(b =>
            {
                b.ToTable("profile_update_request_details");
                b.HasKey(x => x.DetailId);

                b.Property(x => x.DetailId).HasColumnName("detail_id");
                b.Property(x => x.UpdateRequestId).HasColumnName("update_request_id");
                b.Property(x => x.FieldName).HasColumnName("field_name");
                b.Property(x => x.OldValue).HasColumnName("old_value");
                b.Property(x => x.NewValue).HasColumnName("new_value");

                b.HasOne(d => d.UpdateRequest)
                 .WithMany(r => r.Details)
                 .HasForeignKey(d => d.UpdateRequestId);
            });

            // mapping bảng employees (chỉ các cột dùng ở đây)
            modelBuilder.Entity<Employee>(b =>
            {
                b.ToTable("employees");
                b.HasKey(x => x.EmployeeId);

                b.Property(x => x.EmployeeId).HasColumnName("employee_id");
                b.Property(x => x.EmployeeCode).HasColumnName("employee_code");
                b.Property(x => x.FullName).HasColumnName("full_name");
            });
        }
    }
}
