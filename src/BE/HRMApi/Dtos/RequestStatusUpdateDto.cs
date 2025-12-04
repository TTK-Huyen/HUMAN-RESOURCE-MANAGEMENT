using System.Text.Json.Serialization;

namespace HrSystem.Dtos
{
    public class RequestStatusUpdateDto
    {
        [JsonPropertyName("new_status")]
        public string NewStatus { get; set; } = null!;   // "Approved" | "Rejected"

        [JsonPropertyName("reject_reason")]
        public string? RejectReason { get; set; }        // bắt buộc nếu Rejected
        [JsonPropertyName("Employee_ID")]
        public int HrId { get; set; }
    }
}
