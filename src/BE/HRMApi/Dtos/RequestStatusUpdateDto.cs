using System.Text.Json.Serialization;

namespace HrmApi.Dtos
{
    public class RequestStatusUpdateDto
    {
        // Map đúng key "Status" như mô tả User Story
        [JsonPropertyName("Status")] 
        public string NewStatus { get; set; } = null!;   // "APPROVED" | "REJECTED"

        // Map đúng key "RejectReason"
        [JsonPropertyName("RejectReason")]
        public string? RejectReason { get; set; }

        // Key này cần thiết để biết ai duyệt. 
        // Nếu FE tự động sinh code mà thiếu key này, bạn có thể cần hardcode hoặc update FE.
        [JsonPropertyName("Employee_ID")]
        public int HrId { get; set; }
    }
}