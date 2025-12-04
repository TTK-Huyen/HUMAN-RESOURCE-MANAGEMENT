using System;

namespace HrmApi.Models
{
    public class OvertimeRequest
    {
        // overtime_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        // Ngày OT
        public DateTime Date { get; set; }

        // Thời gian bắt đầu / kết thúc
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        // Tổng giờ OT (có thể tự tính)
        public double TotalHours { get; set; }

        public string Reason { get; set; } = default!;

        // project_name / project_id (theo user story)
        public string? ProjectId { get; set; }

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
