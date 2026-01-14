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
    public string RoleCode { get; set; } = default!; //  EMP, MANAGER, HR 
    [Column("role_name")]
    public string RoleName { get; set; } = default!;

    
}