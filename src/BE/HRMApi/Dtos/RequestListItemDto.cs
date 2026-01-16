using System.Text.Json.Serialization;

namespace HrmApi.Dtos
{
    public class RequestListItemDto
    {
        [JsonPropertyName("request_id")]
        public long RequestId { get; set; }

        [JsonPropertyName("employee_code")]
        public string EmployeeCode { get; set; } = null!;

        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = null!;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("request_status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [JsonPropertyName("details")]
        public List<RequestDetailItemDto>? Details { get; set; }
    }
}
