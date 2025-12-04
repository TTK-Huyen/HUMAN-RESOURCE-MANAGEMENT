using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
{
    [Table("leave_requests")]
    public class LeaveRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("leave_type")]
        public string LeaveType { get; set; } = null!; // PAID/UNPAID/SICK/OTHER

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("half_day")]
        public string? HalfDay { get; set; }           // MORNING/AFTERNOON/null

        [Column("reason")]
        public string? Reason { get; set; }

        [Column("handover_employee_id")]
        public int? HandoverEmployeeId { get; set; }

        [Column("attachment_path")]
        public string? AttachmentPath { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;

        [ForeignKey(nameof(HandoverEmployeeId))]
        public Employee? HandoverEmployee { get; set; }
    }
}
