
namespace HrmApi.Models;

public class EmployeeEducation
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string Degree { get; set; } = default!;
    public string Major { get; set; } = default!;
    public string University { get; set; } = default!;
    public DateOnly GraduationYear { get; set; }
    public string? OtherCertificates { get; set; }

    public Employee Employee { get; set; } = default!;
}