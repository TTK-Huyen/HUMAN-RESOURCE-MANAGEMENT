using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("timesheet_update_requests")]
    public class TimesheetUpdateRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("timesheet_id")]
        public int TimesheetId { get; set; }

        [Column("old_check_in")]
        public TimeSpan? OldCheckIn { get; set; }

        [Column("old_check_out")]
        public TimeSpan? OldCheckOut { get; set; }

        [Column("new_check_in")]
        public TimeSpan? NewCheckIn { get; set; }

        [Column("new_check_out")]
        public TimeSpan? NewCheckOut { get; set; }

        [Column("reason")]
        public string? Reason { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;

        [ForeignKey(nameof(TimesheetId))]
        public Timesheet Timesheet { get; set; } = null!;
    }
}
