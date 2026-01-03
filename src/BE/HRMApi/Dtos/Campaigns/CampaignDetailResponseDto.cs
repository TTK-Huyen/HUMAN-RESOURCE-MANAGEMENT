using System;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignDetailResponseDto
    {
        public string CampaignCode { get; set; } = string.Empty;
        public string CampaignName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public DateTime? AnnouncementDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int? MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }

        public string? RegistrationRules { get; set; }
        public string? RewardDescription { get; set; }

        public string Status { get; set; } = string.Empty;

    }
}
