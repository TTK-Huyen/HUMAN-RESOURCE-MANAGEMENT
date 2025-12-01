using System.Text.Json.Serialization;

namespace HrSystem.Dtos
{
    public class RequestDetailDto
    {
        [JsonPropertyName("request_id")]
        public long RequestId { get; set; }

        [JsonPropertyName("employee_id")]
        public long EmployeeId { get; set; }

        [JsonPropertyName("request_status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("details")]
        public List<RequestDetailItemDto> Details { get; set; } = new();
    }
}
