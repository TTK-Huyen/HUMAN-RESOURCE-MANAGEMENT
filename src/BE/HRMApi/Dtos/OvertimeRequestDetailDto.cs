using System.Text.Json.Serialization;

namespace HrmApi.Dtos.RequestStatus
{
    public class OvertimeRequestDetailDto
    {
        [JsonPropertyName("requestId")]
        public int RequestId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = "OVERTIME";

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

        [JsonPropertyName("otDate")]
        public DateTime OtDate { get; set; }

        [JsonPropertyName("startTime")]
        public TimeSpan StartTime { get; set; }

        [JsonPropertyName("endTime")]
        public TimeSpan EndTime { get; set; }

        [JsonPropertyName("totalHours")]
        public decimal TotalHours { get; set; }

        [JsonPropertyName("projectName")]
        public string? ProjectName { get; set; }

        [JsonPropertyName("reason")]
        public string? Reason { get; set; }
    }
}
