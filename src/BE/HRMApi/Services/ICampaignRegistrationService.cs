using HrmApi.Models;

namespace HrmApi.Services
{
    public interface ICampaignRegistrationService
    {
        Task<CampaignRegistration> RegisterByEmployeeCodeAsync(string campaignCode, string employeeCode);
    }
}
