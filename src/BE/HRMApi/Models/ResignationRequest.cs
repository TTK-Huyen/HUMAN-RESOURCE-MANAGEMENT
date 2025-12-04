using System;

namespace HrmApi.Models
{
    public class ResignationRequest
    {
        // resignation_requests.request_id
        public int Id { get; set; }

        // FK → employees.employee_id
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        // Ngày thôi việc đề xuất (proposed_last_working_date)
        public DateTime ResignationDate { get; set; }

        public string Reason { get; set; } = default!;

        // Mapping nhẹ user story "handover_to_hr" → lưu Id nhân viên HR nếu có
        public int? HandoverToHrEmployeeId { get; set; }

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
