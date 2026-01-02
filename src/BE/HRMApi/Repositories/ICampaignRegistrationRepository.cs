using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface ICampaignRegistrationRepository
    {
        Task<bool> ExistsAsync(int campaignId, int employeeId);
        Task<CampaignRegistration> AddAsync(CampaignRegistration registration);
    }
}
