using System;

namespace HrmApi.Models
{
    public class OvertimeRequest
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }

        public DateTime OvertimeDate { get; set; }
        public double Hours { get; set; }                    // số giờ OT
        public string Reason { get; set; } = default!;
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Employee Employee { get; set; } = default!;
    }
}
