using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("profile_update_requests")]
    public class ProfileUpdateRequest
    {
        [Key]
        [Column("update_request_id")]
        public int UpdateRequestId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("request_date")]
        public DateTime RequestDate { get; set; }

        [Column("status")]
        public string Status { get; set; } = "PENDING";

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reject_reason")]
        public string? RejectReason { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [ForeignKey("EmployeeId")]
        public Employee Employee { get; set; } = null!;

        public ICollection<ProfileUpdateRequestDetail> Details { get; set; }
            = new List<ProfileUpdateRequestDetail>();
    }
}
