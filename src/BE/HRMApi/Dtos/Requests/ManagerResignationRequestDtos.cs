using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    // DTO cho API xem chi tiết: GET /api/v1/getdetail-resignation-requests/{code}
    public class ManagerResignationRequestDetailDto
    {
        [JsonPropertyName("request_id")]
        public int RequestId { get; set; }

        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;

        [JsonPropertyName("lastWorkingDate")]
        public DateTime LastWorkingDate { get; set; }

        [JsonPropertyName("reason")]
        public string Reason { get; set; } = string.Empty;

        [JsonPropertyName("handoverCompleted")]
        public bool HandoverCompleted { get; set; }

        [JsonPropertyName("hrNote")]
        public string? HrNote { get; set; }

        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // DTO cho API phản hồi duyệt: PUT .../approval
    public class ResignationRequestApprovalResponseDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("request_id")]
        public int RequestId { get; set; }

        [JsonPropertyName("new_status")]
        public string NewStatus { get; set; } = string.Empty;

        [JsonPropertyName("approve_at")]
        public DateTime ApproveAt { get; set; }
    }
}