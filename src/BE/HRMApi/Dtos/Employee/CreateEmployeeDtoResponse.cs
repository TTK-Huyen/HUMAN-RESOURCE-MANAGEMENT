namespace HrmApi.Dtos.Employee
{
    public class CreateEmployeeResponseDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        // Chỉ trả về lúc tạo, FE show 1 lần
        public string InitialPassword { get; set; } = string.Empty;

        public string CompanyEmail { get; set; } = string.Empty;
    }
}
