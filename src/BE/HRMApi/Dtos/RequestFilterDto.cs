using System.Text.Json.Serialization;

namespace HrSystem.Dtos
{
    public class RequestFilterDto
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("employeeCode")]
        public string? EmployeeCode { get; set; }
    }
}
