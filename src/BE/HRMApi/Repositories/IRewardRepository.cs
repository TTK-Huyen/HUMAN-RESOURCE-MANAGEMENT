using HrmApi.Models;

namespace HrmApi.Repositories
{
    public interface IRewardRepository
    {
        Task<RewardWallet?> GetWalletByEmployeeIdAsync(int employeeId);
        Task CreateWalletAsync(RewardWallet wallet);
        Task UpdateWalletAsync(RewardWallet wallet);
    }
}