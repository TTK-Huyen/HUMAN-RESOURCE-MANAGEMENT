using HrmApi.Models;

namespace HrmApi.Services
{
    public interface ICampaignRegistrationService
    {
        Task<CampaignRegistration> RegisterByEmployeeCodeAsync(string campaignCode, string employeeCode);

        // New: check registration status
        Task<HrmApi.Dtos.Campaigns.CampaignRegistrationStatusResponseDto> GetRegistrationStatusAsync(string campaignCode, string employeeCode);
    }
}
