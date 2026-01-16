using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    /// <summary>
    /// Bảng lịch sử giao dịch điểm (cộng/trừ điểm)
    /// </summary>
    [Table("point_transactions")]
    public class PointTransaction
    {
        [Key]
        [Column("transaction_id")]
        public int TransactionId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("transaction_type")]
        [MaxLength(50)]
        public string TransactionType { get; set; } = default!; // MONTHLY, BONUS, REDEEM, CAMPAIGN

        [Column("points")]
        public int Points { get; set; } // Số điểm (+ hoặc -)

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("related_id")]
        public int? RelatedId { get; set; } // ID liên quan (campaign_id, redemption_id, etc)

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("created_by")]
        public int? CreatedBy { get; set; } // Người tạo (cho BONUS từ manager)

        // Navigation properties
        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Employee? Creator { get; set; }
    }
}