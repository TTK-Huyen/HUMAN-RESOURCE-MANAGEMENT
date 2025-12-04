using System.Text.Json.Serialization;

namespace HrSystem.Dtos
{
    public class RequestStatusResponseDto
    {
        [JsonPropertyName("request_id")]
        public long RequestId { get; set; }

        [JsonPropertyName("request_status")]
        public string RequestStatus { get; set; } = null!;
    }
}
