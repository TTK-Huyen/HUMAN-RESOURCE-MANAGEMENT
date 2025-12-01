using System.Text.Json.Serialization;

namespace HrSystem.Dtos
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
    }
}
