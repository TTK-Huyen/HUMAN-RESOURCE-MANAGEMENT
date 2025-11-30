namespace Domain.Entities;

public class ProfileUpdateRequest
{
    public int UpdateRequestId { get; set; }           // profile_update_requests.update_request_id
    public int EmployeeId { get; set; }                // employee_id
    public DateTime RequestDate { get; set; }          // request_date
    public string Status { get; set; } = "PENDING";    // PENDING | APPROVED | REJECTED
    public int? ReviewedBy { get; set; }               // reviewed_by
    public DateTime? ReviewedAt { get; set; }          // reviewed_at
    public string? RejectReason { get; set; }          // reject_reason
    public string? Comment { get; set; }               // comment

    public Employee Employee { get; set; } = null!;
    public ICollection<ProfileUpdateRequestDetail> Details { get; set; } 
        = new List<ProfileUpdateRequestDetail>();
}
