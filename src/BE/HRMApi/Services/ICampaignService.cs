using HrmApi.Dtos;

namespace HrmApi.Services
{
    public interface ICampaignService
    {
        Task<CampaignResponseDto> CreateCampaignAsync(CampaignCreateDto dto);
        Task<CampaignResponseDto> DeleteCampaignAsync(string campaignCode);
    }
}