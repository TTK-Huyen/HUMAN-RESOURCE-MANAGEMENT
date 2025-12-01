    // DTO xem chi tiết 1 đơn nghỉ phép
    public class LeaveRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeCode { get; set; } = default!;

        public string LeaveType { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Reason { get; set; } = default!;
        public int HandoverEmployeeId { get; set; }
        public string? HandoverEmployeeName { get; set; }

        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }