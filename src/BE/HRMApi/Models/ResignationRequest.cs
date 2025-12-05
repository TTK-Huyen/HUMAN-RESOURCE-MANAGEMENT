using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("resignation_requests")]
    public class ResignationRequest
    {
        [Key]
        [Column("request_id")]
        public int Id { get; set; }

        [NotMapped]
        public int RequestId
        {
            get => Id;
            set => Id = value;
        }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = default!;

        [Column("proposed_last_working_date")]
        public DateTime ResignationDate { get; set; }

        [NotMapped]
        public DateTime ProposedLastWorkingDate
        {
            get => ResignationDate;
            set => ResignationDate = value;
        }


        [Column("resign_reason")]
        public string Reason { get; set; } = default!;

        [NotMapped]
        public string ResignReason
        {
            get => Reason;
            set => Reason = value;
        }

        // Giao lại cho HR
        [Column("handover_to_hr_employee_id")]
        public int? HandoverToHrEmployeeId { get; set; }

        [Column("has_completed_handover")]
        public bool HasCompletedHandover { get; set; }

        [Column("hr_note")]
        public string? HrNote { get; set; }

        [Column("status")]
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(Id))]
        public Request Request { get; set; } = default!;
    }
}
