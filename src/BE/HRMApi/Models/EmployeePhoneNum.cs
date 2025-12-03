namespace HrmApi.Models;

public class EmployeePhoneNumber
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string PhoneNumber { get; set; } = default!;
    public string Description { get; set; } = default!; // Ví dụ: Personal, Relative, Emergency

    public Employee Employee { get; set; } = default!;
}