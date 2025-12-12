namespace HrmApi.Dtos.Auth
{
    public class UserAccountListItemDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int RoleId { get; set; }
        public string? RoleCode { get; set; }
        public string? RoleName { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? LastLoginAt { get; set; }
        public string? PasswordHash { get; set; } // Thêm trường này để trả về password
    }
}
