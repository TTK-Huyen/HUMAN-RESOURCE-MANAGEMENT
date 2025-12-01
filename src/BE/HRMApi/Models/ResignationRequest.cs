using System;

namespace HrmApi.Models
{
    public class ResignationRequest
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }

        public DateTime ResignDate { get; set; }            // ngày muốn nghỉ
        public string Reason { get; set; } = default!;
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Employee Employee { get; set; } = default!;
    }
}
