using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Models
{
    /// <summary>
    /// Bảng yêu cầu đổi điểm sang tiền mặt
    /// </summary>
    [Table("cash_redemptions")]
    public class CashRedemption
    {
        [Key]
        [Column("redemption_id")]
        public int RedemptionId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("points_redeemed")]
        public int PointsRedeemed { get; set; }

        [Column("exchange_rate")]
        [Precision(10, 2)]
        public decimal ExchangeRate { get; set; } = 1000; // 1 point = 1000 VND

        [Column("cash_amount")]
        [Precision(15, 2)]
        public decimal CashAmount { get; set; } // = PointsRedeemed * ExchangeRate

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED, PAID

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.Now;

        [Column("processed_at")]
        public DateTime? ProcessedAt { get; set; }

        [Column("processed_by")]
        public int? ProcessedBy { get; set; }

        [Column("notes")]
        [MaxLength(500)]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }

        [ForeignKey("ProcessedBy")]
        public virtual Employee? Processor { get; set; }
    }
}
