using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    // Output cho API Get Details
    public class ManagerOvertimeRequestDetailDto
    {
        [JsonPropertyName("request_id")]
        public int RequestId { get; set; }

        public string EmployeeId { get; set; } = default!;
        public string EmployeeName { get; set; } = default!;
        public string Department { get; set; } = default!;

        [JsonPropertyName("otDate")]
        public DateTime OtDate { get; set; }

        [JsonPropertyName("startTime")]
        public string StartTime { get; set; } = default!; // Format HH:mm

        [JsonPropertyName("endTime")]
        public string EndTime { get; set; } = default!;   // Format HH:mm

        [JsonPropertyName("totalHours")]
        public double TotalHours { get; set; }

        [JsonPropertyName("project")]
        public string? Project { get; set; }

        [JsonPropertyName("reason")]
        public string? Reason { get; set; }

        public int OtDaysThisMonth { get; set; } // Thêm field này theo User Story
        public string Status { get; set; } = default!;
    }

    // Output cho API Approval
    public class OtRequestApprovalResponseDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = default!;

        [JsonPropertyName("request_id")]
        public int RequestId { get; set; }

        [JsonPropertyName("new_status")]
        public string NewStatus { get; set; } = default!;

        [JsonPropertyName("approve_at")]
        public DateTime ApproveAt { get; set; }
    }
}