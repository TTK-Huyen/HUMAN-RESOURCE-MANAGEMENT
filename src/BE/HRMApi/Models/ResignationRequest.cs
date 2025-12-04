namespace HrmApi.Models
{
    public class ResignationRequest
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = default!;

        public DateTime ResignationDate { get; set; }       // resignation_date
        public string Reason { get; set; } = default!;      // reason

        public int? HandoverToHr { get; set; }              // handover_to_hr (optional)

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
