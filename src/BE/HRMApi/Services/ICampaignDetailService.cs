using HrmApi.Dtos.Campaigns;

namespace HrmApi.Services
{
    public interface ICampaignDetailService
    {
        Task<CampaignDetailResponseDto> GetDetailAsync(string campaignCode);
    }
}
