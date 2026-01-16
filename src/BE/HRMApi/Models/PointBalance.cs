using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    /// <summary>
    /// Bảng lưu số dư điểm hiện tại của từng nhân viên
    /// </summary>
    [Table("point_balances")]
    public class PointBalance
    {
        [Key]
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("current_balance")]
        public int CurrentBalance { get; set; } = 0;

        [Column("total_earned")]
        public int TotalEarned { get; set; } = 0;

        [Column("total_spent")]
        public int TotalSpent { get; set; } = 0;

        [Column("last_updated")]
        public DateTime LastUpdated { get; set; } = DateTime.Now;

        // Navigation property
        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }
    }
}