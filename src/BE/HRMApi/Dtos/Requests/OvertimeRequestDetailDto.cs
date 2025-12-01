    public class OvertimeRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeCode { get; set; } = default!;

        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public string Reason { get; set; } = default!;
        public int? ProjectId { get; set; }

        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
