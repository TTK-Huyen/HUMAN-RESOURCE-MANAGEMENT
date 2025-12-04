using System.Text.Json.Serialization;

namespace HrmApi.Dtos.RequestStatus
{
    public class ResignationRequestDetailDto
    {
        [JsonPropertyName("requestId")]
        public int RequestId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = "RESIGNATION";

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("approvedAt")]
        public DateTime? ApprovedAt { get; set; }

        [JsonPropertyName("approverName")]
        public string? ApproverName { get; set; }

        [JsonPropertyName("rejectReason")]
        public string? RejectReason { get; set; }

        [JsonPropertyName("proposedLastWorkingDate")]
        public DateTime ProposedLastWorkingDate { get; set; }

        [JsonPropertyName("completedHandover")]
        public bool HasCompletedHandover { get; set; }

        [JsonPropertyName("resignationReason")]
        public string? ResignationReason { get; set; }

        [JsonPropertyName("hrNote")]
        public string? HrNote { get; set; }
    }
}
