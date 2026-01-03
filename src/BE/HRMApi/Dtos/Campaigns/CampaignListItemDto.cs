using System;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignListItemDto
    {
        public string CampaignCode { get; set; } = string.Empty;
        public string CampaignName { get; set; } = string.Empty;
        public int? MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
