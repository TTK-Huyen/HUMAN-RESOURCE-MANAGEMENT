using System.Text.Json.Serialization;

namespace HrSystem.Dtos.RequestStatus
{
    public class EmployeeRequestListItemDto
    {
        [JsonPropertyName("requestId")]
        public int RequestId { get; set; }

        // LEAVE | OVERTIME | RESIGNATION
        [JsonPropertyName("type")]
        public string Type { get; set; } = null!;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        // Effective Date trên UI (ví dụ: startDate, otDate, proposedLastWorkingDate)
        [JsonPropertyName("effectiveDate")]
        public DateTime? EffectiveDate { get; set; }

        // PENDING | APPROVED | REJECTED
        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("approverName")]
        public string? ApproverName { get; set; }

        [JsonPropertyName("approvedAt")]
        public DateTime? ApprovedAt { get; set; }
    }
}
