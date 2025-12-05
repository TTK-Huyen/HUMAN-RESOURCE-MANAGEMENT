using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("leave_requests")]
    public class LeaveRequest
    {
        [Key]
        [Column("request_id")]
        public int Id { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = default!;

        [Column("leave_type")]
        public string LeaveType { get; set; } = default!;

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = default!;

        [Column("handover_employee_id")]
        public int? HandoverEmployeeId { get; set; }

        [ForeignKey(nameof(HandoverEmployeeId))]
        public Employee? HandoverEmployee { get; set; }

        [Column("attachment_path")]
        public string? AttachmentPath { get; set; }

        [NotMapped]
        public string? AttachmentsBase64 { get; set; }

        [Column("status")]
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(Id))]
        public Request Request { get; set; } = default!;

        [NotMapped]
        public int RequestId
        {
            get => Id;
            set => Id = value;
        }
    }
}
