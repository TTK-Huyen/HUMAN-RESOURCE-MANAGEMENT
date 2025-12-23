using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    // Output cho API: GET /api/v1/getdetail-overtime-requests/{code}
    public class ManagerOvertimeRequestDetailDto
    {
        [JsonPropertyName("request_id")] // Sửa cho khớp Spec
        public int RequestId { get; set; }

        // Các field phụ (Employee info) giữ nguyên nếu cần thiết cho UI
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;

        [JsonPropertyName("otDate")]
        public DateTime OtDate { get; set; }

        [JsonPropertyName("startTime")]
        public string StartTime { get; set; } = string.Empty;

        [JsonPropertyName("endTime")]
        public string EndTime { get; set; } = string.Empty;

        [JsonPropertyName("totalHours")]
        public double TotalHours { get; set; }

        [JsonPropertyName("project")] // Spec yêu cầu key là "project"
        public string Project { get; set; } = string.Empty;

        [JsonPropertyName("reason")]
        public string Reason { get; set; } = string.Empty;
        
        // Thêm field này nếu UI cần hiển thị
        public int OtDaysThisMonth { get; set; } 

        public string Status { get; set; } = string.Empty;
    }

    // Output cho API: PUT .../approval
    public class OtRequestApprovalResponseDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("request_id")] // Sửa cho khớp Spec
        public int RequestId { get; set; }

        [JsonPropertyName("new_status")] // Sửa cho khớp Spec
        public string NewStatus { get; set; } = string.Empty;

        [JsonPropertyName("approve_at")] // Sửa cho khớp Spec
        public DateTime ApproveAt { get; set; }
    }
}