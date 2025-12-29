using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace HrmApi.Dtos.Requests
{
    // POST body /overtime
    public class CreateOvertimeRequestDto
    {
        [Required]
        [JsonPropertyName("date")] // FE gửi "date"
        public DateTime OtDate { get; set; }

        [Required]
        [JsonPropertyName("startTime")]
        public string StartTime { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("endTime")]
        public string EndTime { get; set; } = string.Empty;

        [JsonPropertyName("reason")] // FE gửi "reason" -> Khớp ở đây
        public string Reason { get; set; } = string.Empty;

        [JsonPropertyName("projectId")]
        public string? ProjectId { get; set; }
    }

    // 201 Created response
    public class OvertimeRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;
    }

    
}
