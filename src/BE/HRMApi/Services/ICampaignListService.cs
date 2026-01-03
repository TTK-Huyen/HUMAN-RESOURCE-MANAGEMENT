using HrmApi.Dtos.Campaigns;

namespace HrmApi.Services
{
    public interface ICampaignListService
    {
        Task<CampaignListResponseDto> GetCampaignsAsync(CampaignListFilterDto filter);
    }
}
