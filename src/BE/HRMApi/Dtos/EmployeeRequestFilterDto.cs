using System.Text.Json.Serialization;

namespace HRMApi.Dtos.RequestStatus
{
    public class EmployeeRequestFilterDto
    {
        // type = leave | ot | resignation
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        // status = pending | approved | rejected
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        // ISO yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
        [JsonPropertyName("fromDate")]
        public DateTime? FromDate { get; set; }

        [JsonPropertyName("toDate")]
        public DateTime? ToDate { get; set; }

        // page >= 1
        [JsonPropertyName("page")]
        public int Page { get; set; } = 1;

        // pageSize >= 1
        [JsonPropertyName("pageSize")]
        public int PageSize { get; set; } = 10;
    }
}
