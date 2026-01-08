using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Repositories
{
    public class RewardRepository : IRewardRepository
    {
        private readonly AppDbContext _context;

        public RewardRepository(AppDbContext context)
        {
            _context = context;
        }

        // Sửa string -> int
        public async Task<RewardWallet?> GetWalletByEmployeeIdAsync(int employeeId)
        {
            return await _context.RewardWallets
                .Include(w => w.PointTransactions)
                // Lúc này phép so sánh (int == int) sẽ hợp lệ
                .FirstOrDefaultAsync(w => w.EmployeeId == employeeId); 
        }

        public async Task CreateWalletAsync(RewardWallet wallet)
        {
            await _context.RewardWallets.AddAsync(wallet);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateWalletAsync(RewardWallet wallet)
        {
            _context.RewardWallets.Update(wallet);
            await _context.SaveChangesAsync();
        }
    }
}