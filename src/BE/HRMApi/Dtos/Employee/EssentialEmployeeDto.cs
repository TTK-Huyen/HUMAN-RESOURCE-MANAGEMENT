namespace HrmApi.Dtos.Employee
{
    public class EssentialEmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? CitizenIdNumber { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DepartmentName { get; set; }
        public string? JobTitleName { get; set; }
    }
}
