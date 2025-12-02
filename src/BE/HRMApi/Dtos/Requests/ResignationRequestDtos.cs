namespace HrmApi.Dtos.Requests
{
    // POST body /resignation
    public class CreateResignationRequestDto
    {
        public DateTime ResignationDate { get; set; }   // resignation_date
        public string Reason { get; set; } = default!;
        public int? HandoverToHr { get; set; }          // handover_to_hr (optional)
    }

    public class ResignationRequestCreatedDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = default!;  // "Pending"
    }

    // GET detail /resignation/{requestId}
    public class ResignationRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeCode { get; set; } = default!;

        public DateTime ResignationDate { get; set; }
        public string Reason { get; set; } = default!;
        public int? HandoverToHr { get; set; }

        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}
