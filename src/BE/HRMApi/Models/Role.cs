// File: HrmApi/Models/Role.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models;

[Table("roles")] // Tên bảng trong Database
public class Role
{
    [Key]
    [Column("role_id")]
    public int RoleId { get; set; }
    
    [Column("role_code")]
    public string RoleCode { get; set; } = default!; // Ví dụ: EMP, MANAGER, HR (Cần cho LoginResponseDto)
    
    [Column("role_name")]
    public string RoleName { get; set; } = default!;

    // Navigation Property: Danh sách UserAccount có vai trò này (Tùy chọn)
    // public ICollection<UserAccount> UserAccounts { get; set; } = new List<UserAccount>();
}