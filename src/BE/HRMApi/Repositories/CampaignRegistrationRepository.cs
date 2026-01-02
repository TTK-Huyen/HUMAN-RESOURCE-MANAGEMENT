using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class CampaignRegistrationRepository : ICampaignRegistrationRepository
    {
        private readonly AppDbContext _context;

        public CampaignRegistrationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ExistsAsync(int campaignId, int employeeId)
        {
            return await _context.CampaignRegistrations
                .AnyAsync(r => r.CampaignId == campaignId
                            && r.EmployeeId == employeeId
                            && r.Status == RegistrationStatus.REGISTERED);
        }

        public async Task<CampaignRegistration> AddAsync(CampaignRegistration registration)
        {
            _context.CampaignRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            return registration;
        }
    }
}
