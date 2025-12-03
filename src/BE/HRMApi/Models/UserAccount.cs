namespace HrmApi.Models;

public enum AccountStatus { ACTIVE, LOCKED }

public class UserAccount
{
    // user_id
    public int UserId { get; set; }
    
    // username
    public string Username { get; set; } = default!;
    
    // password_hash
    public string PasswordHash { get; set; } = default!;
    
    // employee_id (Khóa ngoại)
    public int EmployeeId { get; set; }
    
    // role_id (Khóa ngoại)
    public int RoleId { get; set; }
    
    // status
    public AccountStatus Status { get; set; } = AccountStatus.ACTIVE;
    
    // last_login_at
    public DateTime? LastLoginAt { get; set; }

    // Navigation Properties
    public Employee Employee { get; set; } = default!;
    // public Role Role { get; set; } = default!;
}