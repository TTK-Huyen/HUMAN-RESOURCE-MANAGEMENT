using HrmApi.Models;

namespace HrmApi.Services
{
    public interface IPointService
    {
        // UC 2.4.5: Xem lịch sử giao dịch point
        Task<object> GetMyWalletAsync(int employeeId);
        Task<List<PointTransaction>> GetTransactionHistoryAsync(int employeeId, int? limit = null);
        Task<List<object>> GetDetailedTransactionHistoryAsync(int employeeId, int? limit = null);
        
        // UC 2.4.3: Đổi điểm sang tiền mặt
        Task<CashRedemption> RedeemPointsAsync(int employeeId, int points);
        Task<List<CashRedemption>> GetMyRedemptionsAsync(int employeeId);
        // Admin/HR: Lấy danh sách chờ duyệt
        Task<List<CashRedemption>> GetPendingRedemptionsAsync();
        // Admin/HR: Duyệt yêu cầu đổi điểm
        Task<CashRedemption> ApproveRedemptionAsync(int redemptionId, int processedBy);
        // Admin/HR: Từ chối yêu cầu đổi điểm và hoàn điểm
        Task<CashRedemption> RejectRedemptionAsync(int redemptionId, int processedBy, string? notes = null);
        
        // Admin/Manager functions
        Task AddPointsAsync(int employeeId, int points, string type, string description, int? createdBy = null);
        Task<PointBalance?> GetBalanceAsync(int employeeId);
    }
}