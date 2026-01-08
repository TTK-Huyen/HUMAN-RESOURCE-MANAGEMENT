using HrmApi.Dtos.Reward;
using HrmApi.Models;
using HrmApi.Repositories;

namespace HrmApi.Services
{
    public class RewardService : IRewardService
    {
        private readonly IRewardRepository _rewardRepo;
        private readonly IEmployeeRepository _employeeRepo;

        public RewardService(IRewardRepository rewardRepo, IEmployeeRepository employeeRepo)
        {
            _rewardRepo = rewardRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task GivePointsAsync(string managerId, GivePointsRequestDto request)
        {
            // 1. Kiểm tra nhân viên tồn tại (dùng int trực tiếp)
            var targetEmp = await _employeeRepo.GetByIdAsync(request.TargetEmployeeId);
            if (targetEmp == null)
            {
                throw new Exception($"Không tìm thấy nhân viên có ID {request.TargetEmployeeId}");
            }

            // 2. Lấy ví (dùng int)
            var wallet = await _rewardRepo.GetWalletByEmployeeIdAsync(request.TargetEmployeeId);
            
            if (wallet == null)
            {
                wallet = new RewardWallet
                {
                    EmployeeId = request.TargetEmployeeId, // Gán int
                    PointsBalance = 0,
                    UpdatedAt = DateTime.UtcNow
                };
                await _rewardRepo.CreateWalletAsync(wallet);
            }

            // 3. Cộng điểm
            wallet.PointsBalance += request.Points;
            wallet.UpdatedAt = DateTime.UtcNow;

            // 4. Lưu lịch sử
            var transaction = new PointTransaction
            {
                Amount = request.Points,
                TransactionType = "BONUS",
                Description = request.Reason,
                CreatedBy = managerId,
                CreatedAt = DateTime.UtcNow
            };

            wallet.PointTransactions.Add(transaction);

            // 5. Lưu DB
            await _rewardRepo.UpdateWalletAsync(wallet);
        }
    }
}