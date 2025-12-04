using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("overtime_requests")]
    public class OvertimeRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("ot_date")]
        public DateTime OtDate { get; set; }

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }
        // overtime_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        // Ngày OT
        public DateTime Date { get; set; }

        // Tổng giờ OT (có thể tự tính)
        public double TotalHours { get; set; }

        public string Reason { get; set; } = default!;

        // project_name / project_id (theo user story)
        public string? ProjectId { get; set; }


        [Column("ot_reason")]
        public string? OtReason { get; set; }

        [Column("project_name")]
        public string? ProjectName { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;
    }
}
