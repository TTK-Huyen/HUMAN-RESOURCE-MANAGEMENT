using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    public enum CampaignStatus
    {
        UPCOMING,
        ONGOING,
        FINISHED,
        CANCELLED
    }

    [Table("campaigns")]
    public class Campaign
    {
        [Key]
        [Column("campaign_id")]
        public int CampaignId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("campaign_code")]
        public string CampaignCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("campaign_name")]
        public string CampaignName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("announcement_date")]
        public DateTime? AnnouncementDate { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("registration_rules")]
        public string? RegistrationRules { get; set; }

        [Column("rewards_description")]
        public string? RewardsDescription { get; set; }

        [Column("status")]
        public CampaignStatus Status { get; set; } = CampaignStatus.UPCOMING;

        // --- Hai trường bạn yêu cầu thêm ---
        [Column("max_participants")]
        public int? MaxParticipants { get; set; } // Null = không giới hạn

        [Column("current_participants")]
        public int CurrentParticipants { get; set; } = 0;
        // -----------------------------------

        [Column("created_by")]
        public int CreatedById { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("CreatedById")]
        public virtual Employee? CreatedBy { get; set; }

        public virtual ICollection<CampaignRegistration> Registrations { get; set; } = new List<CampaignRegistration>();
        public virtual ICollection<CampaignResult> Results { get; set; } = new List<CampaignResult>();
    }
}