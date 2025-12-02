namespace HrmApi.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        public string LeaveType { get; set; } = default!;   // leave_type
        public DateTime StartDate { get; set; }             // start_date
        public DateTime EndDate { get; set; }               // end_date
        public string Reason { get; set; } = default!;      // reason

        public int HandoverPersonId { get; set; }           // handover_person_id
        public Employee? HandoverPerson { get; set; }       // navigation optional

        public string? AttachmentsBase64 { get; set; }      // attachments (Optional)

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
