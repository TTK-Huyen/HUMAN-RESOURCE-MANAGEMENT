using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("PointTransactions")]
    public class PointTransaction
    {
        [Key]
        public int Id { get; set; }

        public int WalletId { get; set; }

        [ForeignKey("WalletId")]
        public virtual RewardWallet? Wallet { get; set; }

        public int Amount { get; set; } 

        [StringLength(50)]
        public string TransactionType { get; set; } = null!; 

        [StringLength(255)]
        public string Description { get; set; } = null!;

        [StringLength(20)]
        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}