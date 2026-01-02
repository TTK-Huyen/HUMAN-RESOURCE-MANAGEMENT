using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HrmApi.Models
{
    public enum RegistrationStatus
    {
        REGISTERED,
        CANCELLED
    }

    [Table("campaign_registrations")]
    public class CampaignRegistration
    {
        [Key]
        [Column("registration_id")]
        public int RegistrationId { get; set; }

        [Column("campaign_id")]
        public int CampaignId { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; } = DateTime.Now;

        [Column("status")]
        public RegistrationStatus Status { get; set; } = RegistrationStatus.REGISTERED;

        [Column("cancel_date")]
        public DateTime? CancelDate { get; set; }

        [Column("cancel_reason")]
        public string? CancelReason { get; set; }

        // Navigation Properties
        [ForeignKey("CampaignId")]
        public virtual Campaign? Campaign { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual Employee? Employee { get; set; }
    }
}