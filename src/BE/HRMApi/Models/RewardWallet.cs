using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("RewardWallets")]
    public class RewardWallet
    {
        [Key]
        public int Id { get; set; }

        // SỬA: Chuyển từ string sang int để khớp với Employee.Id
        [Required]
        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }

        public int PointsBalance { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
    }
}