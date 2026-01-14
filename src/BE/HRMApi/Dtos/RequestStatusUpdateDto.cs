using System.Text.Json.Serialization;

namespace HrmApi.Dtos
{
    public class RequestStatusUpdateDto
    {
        [JsonPropertyName("Status")] 
        public string NewStatus { get; set; } = null!;   // "APPROVED" | "REJECTED"

        [JsonPropertyName("RejectReason")]
        public string? RejectReason { get; set; }

        [JsonPropertyName("Employee_ID")]
        public int HrId { get; set; }
    }
}