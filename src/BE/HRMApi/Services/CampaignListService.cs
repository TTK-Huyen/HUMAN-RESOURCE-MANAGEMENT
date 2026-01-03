using HrmApi.Dtos.Campaigns;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class CampaignListService : ICampaignListService
    {
        private readonly ICampaignRepository _campaignRepo;

        public CampaignListService(ICampaignRepository campaignRepo)
        {
            _campaignRepo = campaignRepo;
        }

        public async Task<CampaignListResponseDto> GetCampaignsAsync(CampaignListFilterDto filter)
        {
            var campaigns = await _campaignRepo.GetCampaignsAsync();

            // Filter by name (contains)
            if (!string.IsNullOrWhiteSpace(filter.Name))
            {
                var name = filter.Name.Trim().ToLower();
                campaigns = campaigns
                    .Where(c => (c.CampaignName ?? "")
                    .ToLower()
                    .Contains(name))
                    .ToList();
            }

            // Filter by status (string compare)
            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                var status = filter.Status.Trim().ToLower();
                campaigns = campaigns
                    .Where(c => c.Status.ToString().ToLower() == status)
                    .ToList();
            }

            // Filter by start_date (>=)
            if (filter.StartDate.HasValue)
            {
                campaigns = campaigns
                    .Where(c => c.StartDate.Date >= filter.StartDate.Value.Date)
                    .ToList();
            }

            // Filter by end_date (<=)
            if (filter.EndDate.HasValue)
            {
                campaigns = campaigns
                    .Where(c => c.EndDate.Date <= filter.EndDate.Value.Date)
                    .ToList();
            }

            // Map to DTO
            var items = campaigns.Select(c => new CampaignListItemDto
            {
                CampaignCode = c.CampaignCode,
                CampaignName = c.CampaignName,
                MaxParticipants = c.MaxParticipants,
                CurrentParticipants = c.CurrentParticipants,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Status = c.Status.ToString()
            }).ToList();

            return new CampaignListResponseDto { Campaigns = items };
        }
    }
}
