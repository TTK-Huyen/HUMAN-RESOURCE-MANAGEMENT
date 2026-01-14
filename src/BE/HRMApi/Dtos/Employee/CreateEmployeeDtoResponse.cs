namespace HrmApi.Dtos.Employee
{
    public class CreateEmployeeResponseDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string InitialPassword { get; set; } = string.Empty;

        public string CompanyEmail { get; set; } = string.Empty;
    }
}
