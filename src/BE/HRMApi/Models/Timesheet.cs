using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("timesheets")]
    public class Timesheet
    {
        [Key]
        [Column("timesheet_id")]
        public int TimesheetId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("work_date")]
        public DateTime WorkDate { get; set; }

        [Column("check_in_time")]
        public TimeSpan? CheckInTime { get; set; }

        [Column("check_out_time")]
        public TimeSpan? CheckOutTime { get; set; }

        [Column("total_hours")]
        public decimal? TotalHours { get; set; }

        [Column("is_late")]
        public bool IsLate { get; set; }

        [Column("late_minutes")]
        public int? LateMinutes { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = null!;

        public ICollection<TimesheetUpdateRequest> TimesheetUpdateRequests { get; set; }
            = new List<TimesheetUpdateRequest>();
    }
}
