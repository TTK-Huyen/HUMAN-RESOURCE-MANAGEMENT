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

    
}
