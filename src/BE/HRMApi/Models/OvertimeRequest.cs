namespace HrmApi.Models
{
    public class OvertimeRequest
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        public DateTime Date { get; set; }                  // date
        public TimeSpan StartTime { get; set; }             // start_time
        public TimeSpan EndTime { get; set; }               // end_time
        public string Reason { get; set; } = default!;      // reason

        public int? ProjectId { get; set; }                 // project_id (Optional)

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
