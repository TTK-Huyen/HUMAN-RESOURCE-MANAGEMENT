using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    public class CreateLeaveRequestDto
    {
        [Required]
        [JsonPropertyName("leaveType")]
        public string LeaveType { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }

        [Required]
        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }

        [Required]
        [JsonPropertyName("reason")]
        public string Reason { get; set; } = string.Empty;

        [JsonPropertyName("handoverPersonCode")] 
        public string? HandoverPersonCode { get; set; }

        // Map với FE: attachmentsBase64 (Frontend gửi chuỗi Base64 chứ không gửi IFormFile)
        [JsonPropertyName("attachmentsBase64")]
        public string? AttachmentsBase64 { get; set; }
    }

    public class LeaveRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;
    }
}