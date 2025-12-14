using System.Text.Json.Serialization;

namespace HrmApi.Dtos.Requests
{
    public class ManagerLeaveRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeId { get; set; } = default!;
        public string EmployeeName { get; set; } = default!;
        public string Department { get; set; } = default!;
        public string Position { get; set; } = default!;
        public string LeaveType { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
        public string? HandoverPersonName { get; set; }
        public string? AttachmentPath { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }

        // Extra attributes required by UC
        public float RemainingLeaveDays { get; set; } // Mocked or calculated
        public int RemainingEmployeesInDepartment { get; set; } // For conflict check
        public bool HasConflictWarning { get; set; }
    }

    public class LeaveRequestApprovalResponseDto
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = default!;

        [JsonPropertyName("request_id")]
        public int RequestId { get; set; }

        [JsonPropertyName("new_status")]
        public string NewStatus { get; set; } = default!;
    }
}