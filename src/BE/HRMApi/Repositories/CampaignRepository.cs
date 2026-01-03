using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class CampaignRepository : ICampaignRepository
    {
        private readonly AppDbContext _context;

        public CampaignRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Campaign?> GetLatestCampaignAsync()
        {
            // Lấy cái có ID lớn nhất
            return await _context.Campaigns
                .OrderByDescending(c => c.CampaignId)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsByNameAndYearAsync(string name, int year)
        {
            return await _context.Campaigns
                .AnyAsync(c => c.CampaignName == name && c.StartDate.Year == year);
        }

        public async Task AddAsync(Campaign campaign)
        {
            await _context.Campaigns.AddAsync(campaign);
            await _context.SaveChangesAsync();
        }

        public async Task<Campaign?> GetByCodeAsync(string code)
        {
            return await _context.Campaigns.FirstOrDefaultAsync(c => c.CampaignCode == code);
        }

        public async Task UpdateAsync(Campaign campaign)
        {
            _context.Campaigns.Update(campaign);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<Campaign>> GetCampaignsAsync()
        {
            return await _context.Campaigns
                .Where(c => c.Status != CampaignStatus.DELETED)
                .ToListAsync();
        }
    }
}