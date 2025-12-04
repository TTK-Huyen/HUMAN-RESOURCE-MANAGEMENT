
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace HrmApi.Models
{
    [Table("resignation_requests")]
    public class ResignationRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("proposed_last_working_date")]
        public DateTime ProposedLastWorkingDate { get; set; }

        [Column("resign_reason")]
        public string? ResignReason { get; set; }

        [Column("has_completed_handover")]
        public bool HasCompletedHandover { get; set; }
        // resignation_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        // Ngày thôi việc đề xuất (proposed_last_working_date)
        public DateTime ResignationDate { get; set; }

        public string Reason { get; set; } = default!;

        // Mapping nhẹ user story "handover_to_hr" → lưu Id nhân viên HR nếu có
        public int? HandoverToHrEmployeeId { get; set; }

        [Column("hr_note")]
        public string? HrNote { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;
    }
}
