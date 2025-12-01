namespace HrSystem.Models
{
    public class ProfileUpdateRequest
    {
        public int UpdateRequestId { get; set; }      // update_request_id
        public int EmployeeId { get; set; }           // employee_id (người gửi)
        public DateTime RequestDate { get; set; }     // request_date
        public string Status { get; set; } = "PENDING"; // PENDING/APPROVED/REJECTED

        public int? ReviewedBy { get; set; }          // reviewed_by (HR)
        public DateTime? ReviewedAt { get; set; }     // reviewed_at
        public string? RejectReason { get; set; }     // reject_reason
        public string? Comment { get; set; }          // comment

        public Employee Employee { get; set; } = null!;
        public Employee? Reviewer { get; set; }

        public ICollection<ProfileUpdateRequestDetail> Details { get; set; }
            = new List<ProfileUpdateRequestDetail>();
    }
}
