using System.Collections.Generic;

namespace HrmApi.Dtos.Campaigns
{
    public class CampaignListResponseDto
    {
        public List<CampaignListItemDto> Campaigns { get; set; } = new();
    }
}
