using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    [Table("campaign_results")]
    public class CampaignResult
    {
        [Key]
        [Column("result_id")]
        public int ResultId { get; set; }

        [Column("campaign_id")]
        public int CampaignId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("result_value")]
        public decimal? ResultValue { get; set; }

        [MaxLength(50)]
        [Column("result_unit")]
        public string? ResultUnit { get; set; }

        [Column("ranking")]
        public int? Ranking { get; set; }

        [Column("reward_points")]
        public int RewardPoints { get; set; } = 0;

        [Column("recorded_at")]
        public DateTime RecordedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("CampaignId")]
        public virtual Campaign? Campaign { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }
    }
}