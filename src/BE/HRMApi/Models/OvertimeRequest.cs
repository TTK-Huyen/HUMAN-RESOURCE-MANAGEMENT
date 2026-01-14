using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("overtime_requests")]
    public class OvertimeRequest
    {
        // overtime_requests.request_id
        [Key]
        [Column("request_id")]
        public int Id { get; set; }

        // FK → employees.employee_id
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = default!;

        // Ngày OT (map với ot_date của code 2)
        [Column("ot_date")]
        public DateTime Date { get; set; }

        // Thời gian bắt đầu / kết thúc
        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        // Tổng giờ OT 
        [Column("total_hours")]
        public decimal TotalHours { get; set; }

        // Lý do OT
        [Column("ot_reason")]
        public string Reason { get; set; } = default!;

        // project_name
        [Column("project_name")]
        public string? ProjectName { get; set; }

        // project_id 
        public string? ProjectId { get; set; }

        // Navigation đến Request (FK = request_id)
        [ForeignKey(nameof(Id))]
        public Request Request { get; set; } = default!;


        // [Column("status")]
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        // [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public DateTime OtDate
        {
            get => Date;
            set => Date = value;
        }

        [NotMapped]
        public string? OtReason
        {
            get => Reason;
            set => Reason = value ?? string.Empty;
        }

        [NotMapped]
        public int RequestId
        {
            get => Id;
            set => Id = value;
        }
    }
}
