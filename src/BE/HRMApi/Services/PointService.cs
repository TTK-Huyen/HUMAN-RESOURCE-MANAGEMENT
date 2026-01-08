using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Services
{
    public class PointService : IPointService
    {
        private readonly AppDbContext _context;
        private const decimal EXCHANGE_RATE = 1000m; // 1 point = 1000 VND

        public PointService(AppDbContext context)
        {
            _context = context;
        }

        // UC 2.4.5: Xem lịch sử giao dịch điểm
        public async Task<object> GetMyWalletAsync(int employeeId)
        {
            var balance = await GetOrCreateBalanceAsync(employeeId);
            var employee = await _context.Employees.FindAsync(employeeId);
            var transactions = await _context.PointTransactions
                .Where(t => t.EmployeeId == employeeId)
                .OrderByDescending(t => t.CreatedAt)
                .Take(50)
                .Select(t => new
                {
                    t.TransactionId,
                    t.TransactionType,
                    t.Points,
                    t.Description,
                    t.CreatedAt,
                    Type = t.Points > 0 ? "EARN" : "REDEEM",
                    Amount = t.Points
                })
                .ToListAsync();

            return new
            {
                Balance = balance.CurrentBalance,
                TotalEarned = balance.TotalEarned,
                TotalSpent = balance.TotalSpent,
                LastUpdated = balance.LastUpdated,
                EmployeeStatus = employee?.Status,
                EmployeeCode = employee?.EmployeeCode,
                EmployeeName = employee?.FullName,
                Transactions = transactions
            };
        }

        public async Task<List<PointTransaction>> GetTransactionHistoryAsync(int employeeId, int? limit = null)
        {
            var query = _context.PointTransactions
                .Where(t => t.EmployeeId == employeeId)
                .OrderByDescending(t => t.CreatedAt);

            if (limit.HasValue)
                return await query.Take(limit.Value).ToListAsync();

            return await query.ToListAsync();
        }

        // Lấy lịch sử giao dịch với thông tin chi tiết (người gửi, người nhận, số tiền, v.v.)
        public async Task<List<object>> GetDetailedTransactionHistoryAsync(int employeeId, int? limit = null)
        {
            IQueryable<PointTransaction> query = _context.PointTransactions
                .Where(t => t.EmployeeId == employeeId)
                .Include(t => t.Employee)
                .Include(t => t.Creator)
                .OrderByDescending(t => t.CreatedAt);

            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            var transactions = await query.ToListAsync();

            var result = transactions.Select(t => new
            {
                TransactionId = t.TransactionId,
                TransactionType = t.TransactionType,
                Points = t.Points,
                Amount = (decimal)t.Points * EXCHANGE_RATE,
                PointAmount = t.Points,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                TransactionStatus = t.Points > 0 ? "EARN" : "REDEEM",
                FromEmployee = t.Employee != null ? new
                {
                    EmployeeId = t.Employee.Id,
                    EmployeeCode = t.Employee.EmployeeCode,
                    FullName = t.Employee.FullName,
                    CompanyEmail = t.Employee.CompanyEmail
                } : null,
                ToEmployee = t.Employee != null ? new
                {
                    EmployeeId = t.Employee.Id,
                    EmployeeCode = t.Employee.EmployeeCode,
                    FullName = t.Employee.FullName,
                    CompanyEmail = t.Employee.CompanyEmail
                } : null,
                ProcessedBy = t.Creator != null ? new
                {
                    EmployeeId = t.Creator.Id,
                    EmployeeCode = t.Creator.EmployeeCode,
                    FullName = t.Creator.FullName
                } : null,
                RelatedId = t.RelatedId,
                ExchangeRate = EXCHANGE_RATE
            }).ToList<object>();

            return result;
        }

        // UC 2.4.3: Đổi điểm sang tiền mặt (1 point = 1000 VND)
        public async Task<CashRedemption> RedeemPointsAsync(int employeeId, int points)
        {
            if (points <= 0)
                throw new ArgumentException("Số điểm phải lớn hơn 0");

            var balance = await GetOrCreateBalanceAsync(employeeId);
            
            if (balance.CurrentBalance < points)
                throw new InvalidOperationException("Số điểm không đủ");

            // Trừ điểm
            balance.CurrentBalance -= points;
            balance.TotalSpent += points;
            balance.LastUpdated = DateTime.Now;

            // Tạo transaction trừ điểm
            var transaction = new PointTransaction
            {
                EmployeeId = employeeId,
                TransactionType = "REDEEM",
                Points = -points, // Số âm
                Description = $"Đổi {points} điểm sang tiền mặt",
                CreatedAt = DateTime.Now
            };
            _context.PointTransactions.Add(transaction);

            // Tạo yêu cầu đổi tiền
            var redemption = new CashRedemption
            {
                EmployeeId = employeeId,
                PointsRedeemed = points,
                ExchangeRate = EXCHANGE_RATE,
                CashAmount = points * EXCHANGE_RATE,
                Status = "PENDING",
                RequestedAt = DateTime.Now
            };
            _context.CashRedemptions.Add(redemption);

            await _context.SaveChangesAsync();
            return redemption;
        }

        public async Task<List<CashRedemption>> GetMyRedemptionsAsync(int employeeId)
        {
            return await _context.CashRedemptions
                .Where(r => r.EmployeeId == employeeId)
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();
        }

        // Admin/HR: Lấy danh sách yêu cầu chờ duyệt
        public async Task<List<CashRedemption>> GetPendingRedemptionsAsync()
        {
            return await _context.CashRedemptions
                .Where(r => r.Status == "PENDING")
                .Include(r => r.Employee)
                .OrderBy(r => r.RequestedAt)
                .ToListAsync();
        }

        // Admin/HR: Duyệt yêu cầu (chỉ cập nhật trạng thái, chuyển cho bước chi trả thủ công)
        public async Task<CashRedemption> ApproveRedemptionAsync(int redemptionId, int processedBy)
        {
            var redemption = await _context.CashRedemptions.FirstOrDefaultAsync(r => r.RedemptionId == redemptionId);
            if (redemption == null)
                throw new ArgumentException("Yêu cầu không tồn tại");

            if (redemption.Status != "PENDING")
                throw new InvalidOperationException("Yêu cầu đã được xử lý");

            redemption.Status = "APPROVED";
            redemption.ProcessedAt = DateTime.Now;
            redemption.ProcessedBy = processedBy;

            await _context.SaveChangesAsync();
            return redemption;
        }

        // Admin/HR: Từ chối yêu cầu và hoàn điểm về ví nhân viên
        public async Task<CashRedemption> RejectRedemptionAsync(int redemptionId, int processedBy, string? notes = null)
        {
            var redemption = await _context.CashRedemptions.FirstOrDefaultAsync(r => r.RedemptionId == redemptionId);
            if (redemption == null)
                throw new ArgumentException("Yêu cầu không tồn tại");

            if (redemption.Status != "PENDING")
                throw new InvalidOperationException("Yêu cầu đã được xử lý");

            // Hoàn điểm
            var balance = await GetOrCreateBalanceAsync(redemption.EmployeeId);
            balance.CurrentBalance += redemption.PointsRedeemed;
            balance.TotalSpent -= redemption.PointsRedeemed;
            balance.LastUpdated = DateTime.Now;

            // Ghi transaction hoàn điểm
            var refundTx = new PointTransaction
            {
                EmployeeId = redemption.EmployeeId,
                TransactionType = "REFUND",
                Points = redemption.PointsRedeemed,
                Description = $"Hoàn lại {redemption.PointsRedeemed} điểm do từ chối yêu cầu đổi điểm (#{redemption.RedemptionId})",
                CreatedAt = DateTime.Now,
                CreatedBy = processedBy,
                RelatedId = redemption.RedemptionId
            };
            _context.PointTransactions.Add(refundTx);

            redemption.Status = "REJECTED";
            redemption.ProcessedAt = DateTime.Now;
            redemption.ProcessedBy = processedBy;
            redemption.Notes = notes;

            await _context.SaveChangesAsync();
            return redemption;
        }

        // Manager/Admin: Tặng điểm
        public async Task AddPointsAsync(int employeeId, int points, string type, string description, int? createdBy = null)
        {
            if (points <= 0)
                throw new ArgumentException("Số điểm phải lớn hơn 0");

            var balance = await GetOrCreateBalanceAsync(employeeId);
            
            balance.CurrentBalance += points;
            balance.TotalEarned += points;
            balance.LastUpdated = DateTime.Now;

            var transaction = new PointTransaction
            {
                EmployeeId = employeeId,
                TransactionType = type,
                Points = points,
                Description = description,
                CreatedAt = DateTime.Now,
                CreatedBy = createdBy
            };
            _context.PointTransactions.Add(transaction);

            await _context.SaveChangesAsync();
        }

        public async Task<PointBalance?> GetBalanceAsync(int employeeId)
        {
            return await _context.PointBalances
                .FirstOrDefaultAsync(b => b.EmployeeId == employeeId);
        }

        // Helper: Tạo balance nếu chưa có
        private async Task<PointBalance> GetOrCreateBalanceAsync(int employeeId)
        {
            var balance = await _context.PointBalances
                .FirstOrDefaultAsync(b => b.EmployeeId == employeeId);

            if (balance == null)
            {
                balance = new PointBalance
                {
                    EmployeeId = employeeId,
                    CurrentBalance = 0,
                    TotalEarned = 0,
                    TotalSpent = 0,
                    LastUpdated = DateTime.Now
                };
                _context.PointBalances.Add(balance);
                await _context.SaveChangesAsync();
            }

            return balance;
        }
    }
}
