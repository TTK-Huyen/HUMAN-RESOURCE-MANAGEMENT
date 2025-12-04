using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrSystem.Models
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

        [Column("hr_note")]
        public string? HrNote { get; set; }

        [ForeignKey(nameof(RequestId))]
        public Request Request { get; set; } = null!;
    }
}
