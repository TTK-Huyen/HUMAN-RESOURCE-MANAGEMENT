    public class ResignationRequestDetailDto
    {
        public int RequestId { get; set; }
        public string EmployeeCode { get; set; } = default!;

        public DateTime ResignationDate { get; set; }
        public string Reason { get; set; } = default!;
        public int? HandoverToHrEmployeeId { get; set; }

        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
