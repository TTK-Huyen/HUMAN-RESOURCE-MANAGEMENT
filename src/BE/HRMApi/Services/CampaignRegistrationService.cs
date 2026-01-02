using HrmApi.Models;
using HrmApi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Services
{
    public class CampaignRegistrationService : ICampaignRegistrationService
    {
        private readonly ICampaignRepository _campaignRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly ICampaignRegistrationRepository _registrationRepo;

        public CampaignRegistrationService(
            ICampaignRepository campaignRepo,
            IEmployeeRepository employeeRepo,
            ICampaignRegistrationRepository registrationRepo)
        {
            _campaignRepo = campaignRepo;
            _employeeRepo = employeeRepo;
            _registrationRepo = registrationRepo;
        }

        public async Task<CampaignRegistration> RegisterByEmployeeCodeAsync(string campaignCode, string employeeCode)
        {
            if (string.IsNullOrWhiteSpace(employeeCode))
                throw new Exception("Employee_code is required.");

            // 1) Find campaign
            var campaign = await _campaignRepo.GetByCodeAsync(campaignCode);
            if (campaign == null)
                throw new Exception("Campaign not found.");

            // 2) Check expired/closed
            if (DateTime.Now > campaign.EndDate)
                throw new Exception("Registration expired.");

            // 3) Check max participants
            if (campaign.MaxParticipants.HasValue &&
                campaign.CurrentParticipants >= campaign.MaxParticipants.Value)
            {
                throw new Exception("Campaign is full.");
            }
            // 4) Find employee
            var employee = await _employeeRepo.GetByCodeAsync(employeeCode);
            if (employee == null)
                throw new Exception("Employee not found.");

            // 5) Only once
            var existed = await _registrationRepo.ExistsAsync(campaign.CampaignId, employee.Id);
            if (existed)
                throw new Exception("Employee can only register once per campaign.");

            // 6) Create registration
            var reg = new CampaignRegistration
            {
                CampaignId = campaign.CampaignId,
                EmployeeId = employee.Id,
                RegistrationDate = DateTime.Now,
                Status = RegistrationStatus.REGISTERED
            };

            try
            {
                // 7) Insert registration
                await _registrationRepo.AddAsync(reg);

                // 8) UPDATE current_participants
                campaign.CurrentParticipants += 1;

                // 9) Save campaign change
                await _campaignRepo.UpdateAsync(campaign);

                return reg;
            }
            catch (DbUpdateException)
            {
                // fallback theo unique index
                throw new Exception("Employee can only register once per campaign.");
            }
        }
    }
}
