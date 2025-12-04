namespace HrmApi.Models;

public class EmployeeBankAccount
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string BankName { get; set; } = default!;
    public string AccountNumber { get; set; } = default!;
    public string AccountHolderName { get; set; } = default!;
    public bool IsPrimary { get; set; } // Tài khoản nhận lương chính

    public Employee Employee { get; set; } = default!;
}