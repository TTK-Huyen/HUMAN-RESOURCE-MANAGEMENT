using HrmApi.Dtos.Campaigns;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class CampaignDetailService : ICampaignDetailService
    {
        private readonly ICampaignRepository _campaignRepo;

        public CampaignDetailService(ICampaignRepository campaignRepo)
        {
            _campaignRepo = campaignRepo;
        }

        public async Task<CampaignDetailResponseDto> GetDetailAsync(string campaignCode)
        {
            if (string.IsNullOrWhiteSpace(campaignCode))
                throw new Exception("campaign_code is required.");

            var campaign = await _campaignRepo.GetByCodeAsync(campaignCode);
            if (campaign == null)
                throw new Exception("Campaign not found.");

            var isFull = campaign.MaxParticipants.HasValue
                         && campaign.CurrentParticipants >= campaign.MaxParticipants.Value;

            return new CampaignDetailResponseDto
            {
                CampaignCode = campaign.CampaignCode,
                CampaignName = campaign.CampaignName,
                Description = campaign.Description,

                AnnouncementDate = campaign.AnnouncementDate,
                StartDate = campaign.StartDate,
                EndDate = campaign.EndDate,

                MaxParticipants = campaign.MaxParticipants,
                CurrentParticipants = campaign.CurrentParticipants,

                RegistrationRules = campaign.RegistrationRules,
                RewardDescription = campaign.RewardsDescription,

                Status = campaign.Status.ToString(),
            };
        }
    }
}
