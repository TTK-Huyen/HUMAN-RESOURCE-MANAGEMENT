namespace HrmApi.Dtos.Auth
{
    public class RegisterRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int EmployeeId { get; set; } // Liên kết với employee đã có
        public int RoleId { get; set; } // RoleId: 1=ADMIN, 2=EMP, 3=HR
    }
}
