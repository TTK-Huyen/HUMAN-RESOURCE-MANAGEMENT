using HrmApi.Data;
using HrmApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HrmApi.Services
{
    /// <summary>
    /// UC 2.4.1: Hệ thống cộng điểm tự động hàng tháng (Automated Job)
    /// Mỗi tháng cộng 1000 point cho tất cả nhân viên đang hoạt động
    /// </summary>
    public class MonthlyPointAllocationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MonthlyPointAllocationService> _logger;
        private const int MONTHLY_POINTS = 1000;

        public MonthlyPointAllocationService(AppDbContext context, ILogger<MonthlyPointAllocationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<object> ExecuteMonthlyAllocationAsync(string? targetMonth = null)
        {
            // Nếu không truyền tháng, lấy tháng hiện tại
            var month = string.IsNullOrEmpty(targetMonth) 
                ? DateTime.Now.ToString("yyyy-MM") 
                : targetMonth;

            _logger.LogInformation($"Starting monthly point allocation for {month}");

            // Lấy tất cả nhân viên đang hoạt động
            var activeEmployees = await _context.Employees
                .Where(e => e.Status == "Đang làm việc" || e.Status == "ACTIVE")
                .ToListAsync();

            if (!activeEmployees.Any())
            {
                _logger.LogWarning("No active employees found");
                return new { Success = false, Message = "Không có nhân viên đang hoạt động" };
            }

            int successCount = 0;
            var errors = new List<string>();

            foreach (var employee in activeEmployees)
            {
                try
                {
                    // Kiểm tra xem đã cộng điểm cho tháng này chưa
                    var alreadyAllocated = await _context.PointTransactions
                        .AnyAsync(t => 
                            t.EmployeeId == employee.Id &&
                            t.TransactionType == "MONTHLY" &&
                            t.Description!.Contains(month));

                    if (alreadyAllocated)
                    {
                        _logger.LogInformation($"Employee {employee.EmployeeCode} already received points for {month}");
                        continue;
                    }

                    // Lấy hoặc tạo balance
                    var balance = await _context.PointBalances
                        .FirstOrDefaultAsync(b => b.EmployeeId == employee.Id);

                    if (balance == null)
                    {
                        balance = new PointBalance
                        {
                            EmployeeId = employee.Id,
                            CurrentBalance = 0,
                            TotalEarned = 0,
                            TotalSpent = 0,
                            LastUpdated = DateTime.Now
                        };
                        _context.PointBalances.Add(balance);
                    }

                    // Cộng điểm
                    balance.CurrentBalance += MONTHLY_POINTS;
                    balance.TotalEarned += MONTHLY_POINTS;
                    balance.LastUpdated = DateTime.Now;

                    // Tạo transaction
                    var transaction = new PointTransaction
                    {
                        EmployeeId = employee.Id,
                        TransactionType = "MONTHLY",
                        Points = MONTHLY_POINTS,
                        Description = $"Điểm thưởng tháng {month}",
                        CreatedAt = DateTime.Now
                    };
                    _context.PointTransactions.Add(transaction);

                    successCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error allocating points for employee {employee.EmployeeCode}");
                    errors.Add($"{employee.EmployeeCode}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Monthly point allocation completed. Success: {successCount}/{activeEmployees.Count}");

            return new
            {
                Success = true,
                Month = month,
                TotalEmployees = activeEmployees.Count,
                SuccessCount = successCount,
                PointsPerEmployee = MONTHLY_POINTS,
                TotalPointsAllocated = successCount * MONTHLY_POINTS,
                Errors = errors
            };
        }
    }
}
