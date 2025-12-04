namespace HrmApi.Dtos.Requests
{
    // POST body /overtime
    public class CreateOvertimeRequestDto
    {
        public DateTime Date { get; set; }          // date
        public TimeSpan StartTime { get; set; }     // start_time
        public TimeSpan EndTime { get; set; }       // end_time
        public string Reason { get; set; } = default!;
        public int? ProjectId { get; set; }         // project_id (optional)
    }

    // 201 Created response
    public class OvertimeRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;
    }

    // GET detail /overtime/{requestId}
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
}
