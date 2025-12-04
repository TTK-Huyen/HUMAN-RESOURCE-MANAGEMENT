using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("requests")]
    public class Request
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        public Employee Employee { get; set; } = null!;

        [Column("request_type")]
        public string RequestType { get; set; } = null!;  // 'LEAVE','TIMESHEET_UPDATE','OT','RESIGNATION'

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("status")]
        public string Status { get; set; } = "PENDING";

        [Column("approver_id")]
        public int? ApproverId { get; set; }
        public Employee? Approver { get; set; }

        // Navigation 1–1 đến bảng con (optional nhưng nên có)
        public ResignationRequest? ResignationRequest { get; set; }
        public TimesheetUpdateRequest? TimesheetUpdateRequest { get; set; }
    }
}
