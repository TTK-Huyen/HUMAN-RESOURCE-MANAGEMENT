namespace HrmApi.Dtos.Requests
{
    // POST body /leave
    public class CreateLeaveRequestDto
    {
        public string LeaveType { get; set; } = default!;   // leave_type
        public DateTime StartDate { get; set; }             // start_date
        public DateTime EndDate { get; set; }               // end_date
        public string Reason { get; set; } = default!;      // reason

        public int HandoverPersonId { get; set; }           // handover_person_id
        public string? AttachmentsBase64 { get; set; }      // attachments (optional)
    }

    // Response 201
    public class LeaveRequestCreatedDto
    {
        public int RequestId { get; set; }                  // request_id
        public string Status { get; set; } = default!;      // "Pending"
    }

    // GET detail /leave/{requestId}
    public class LeaveRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeCode { get; set; } = default!;

        public string LeaveType { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Reason { get; set; } = default!;
        public int HandoverPersonId { get; set; }
        public string? HandoverPersonName { get; set; }

        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}
