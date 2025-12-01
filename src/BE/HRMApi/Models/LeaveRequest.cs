using System;

namespace HrmApi.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }                               // PK
        public int EmployeeId { get; set; }                       // FK

        public LeaveType LeaveType { get; set; }
        public DateTime StartDate { get; set; }  
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = default!;
        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Employee Employee { get; set; } = default!;
    }

    public enum LeaveType
    {
        Annual = 1,
        Sick = 2,
        Unpaid = 3,
        Other = 4
    }
}
