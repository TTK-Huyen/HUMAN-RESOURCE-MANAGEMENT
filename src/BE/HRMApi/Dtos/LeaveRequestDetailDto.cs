using System.Text.Json.Serialization;

namespace HrmApi.Dtos.RequestStatus
{
    public class LeaveRequestDetailDto
    {
        [JsonPropertyName("requestId")]
        public int RequestId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = "LEAVE";

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

        [JsonPropertyName("leaveType")]
        public string LeaveType { get; set; } = null!;

        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }

        [JsonPropertyName("handoverToEmployeeCode")]
        public string? HandoverToEmployeeCode { get; set; }

        [JsonPropertyName("attachment")]
        public string? AttachmentPath { get; set; }

        // Lý do nghỉ (nếu bạn có cột Reason ở Request)
        [JsonPropertyName("reason")]
        public string? Reason { get; set; }
    }
}
