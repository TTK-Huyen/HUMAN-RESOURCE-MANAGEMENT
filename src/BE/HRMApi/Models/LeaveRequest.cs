using System;

namespace HrmApi.Models
{
    public class LeaveRequest
    {
        // leave_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        // Loại nghỉ (Paid, Sick, ...)
        public string LeaveType { get; set; } = default!;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Reason { get; set; } = default!;

        // handover_employee_id trong ERD (optional)
        public int? HandoverEmployeeId { get; set; }

        // Bạn đang dùng base64 thay vì attachment_path → ok cho đồ án
        public string? AttachmentsBase64 { get; set; }

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
