using HrmApi.Services;
using HrmApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/rewards")]
    [Authorize]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;
        private readonly AppDbContext _context;
        private readonly ILogger<PointController> _logger;

        public PointController(IPointService pointService, AppDbContext context, ILogger<PointController> logger)
        {
            _pointService = pointService;
            _context = context;
            _logger = logger;
        }

        // Đọc điểm theo employee code (không cần xác thực)
        [AllowAnonymous]
        [HttpGet("balance/{employeeCode}")]
        public async Task<IActionResult> GetPointsByEmployeeCode(string employeeCode)
        {
            try
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Nhân viên không tìm thấy" });
                }

                var balance = await _pointService.GetBalanceAsync(employee.Id);
                if (balance == null)
                {
                    return NotFound(new { Message = "Chưa khởi tạo điểm cho nhân viên này" });
                }

                return Ok(new 
                { 
                    Success = true, 
                    Data = new 
                    {
                        EmployeeCode = employee.EmployeeCode,
                        FullName = employee.FullName,
                        CurrentBalance = balance.CurrentBalance,
                        TotalEarned = balance.TotalEarned,
                        TotalSpent = balance.TotalSpent,
                        LastUpdated = balance.LastUpdated
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting points by employee code");
                return StatusCode(500, new { Message = "Lỗi hệ thống" });
            }
        }

        // UC 2.4.5: Xem lịch sử giao dịch point
        [HttpGet("wallet/my-wallet")]
        public async Task<IActionResult> GetMyWallet()
        {
            try
            {
                var employeeCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(employeeCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Employee not found" });
                }

                var wallet = await _pointService.GetMyWalletAsync(employee.Id);
                // Audit: record view of wallet (who, when UTC, and source IP/user-agent)
                try
                {
                    var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                    var ua = Request.Headers["User-Agent"].ToString();
                    _logger.LogInformation($"Wallet viewed by {employee.EmployeeCode} at {DateTime.UtcNow:o} from {ip} | UA: {ua}");
                }
                catch { /* swallow logging errors */ }

                return Ok(new { Success = true, Data = wallet });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wallet");
                return StatusCode(500, new { Message = "Lỗi hệ thống" });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactionHistory([FromQuery] int? limit)
        {
            try
            {
                var employeeCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(employeeCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Employee not found" });
                }

                var transactions = await _pointService.GetTransactionHistoryAsync(employee.Id, limit);
                return Ok(new { Success = true, Data = transactions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions");
                return StatusCode(500, new { Message = "Lỗi hệ thống" });
            }
        }

        // Lấy lịch sử giao dịch chi tiết với thông tin người gửi/nhận
        [HttpGet("transactions/detailed")]
        public async Task<IActionResult> GetDetailedTransactionHistory([FromQuery] int? limit)
        {
            try
            {
                var employeeCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(employeeCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Employee not found" });
                }

                var transactions = await _pointService.GetDetailedTransactionHistoryAsync(employee.Id, limit);
                return Ok(new { Success = true, Data = transactions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting detailed transactions");
                return StatusCode(500, new { Message = "Lỗi hệ thống" });
            }
        }

        // UC 2.4.3: Đổi điểm sang tiền mặt
        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemPoints([FromBody] RedeemPointsRequest request)
        {
            try
            {
                var employeeCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(employeeCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Employee not found" });
                }

                var redemption = await _pointService.RedeemPointsAsync(employee.Id, request.Points);
                return Ok(new 
                { 
                    Success = true, 
                    Message = "Redeem request created successfully",
                    Data = redemption 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error redeeming points");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [HttpGet("redemptions")]
        public async Task<IActionResult> GetMyRedemptions()
        {
            try
            {
                var employeeCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(employeeCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    return NotFound(new { Message = "Employee not found" });
                }

                var redemptions = await _pointService.GetMyRedemptionsAsync(employee.Id);
                return Ok(new { Success = true, Data = redemptions });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting redemptions");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        // HR/Admin: Lấy danh sách yêu cầu đổi điểm đang chờ duyệt
        [HttpGet("redemptions/pending")]
        [Authorize(Roles = "HR,ADMIN")]
        public async Task<IActionResult> GetPendingRedemptions()
        {
            try
            {
                var list = await _pointService.GetPendingRedemptionsAsync();
                return Ok(new { Success = true, Data = list });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending redemptions");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        // HR/Admin: Duyệt yêu cầu
        [HttpPost("redemptions/{id}/approve")]
        [Authorize(Roles = "HR,ADMIN")]
        public async Task<IActionResult> ApproveRedemption(int id)
        {
            try
            {
                var hrCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(hrCode)) return Unauthorized(new { Message = "Invalid token" });

                var hr = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == hrCode);
                if (hr == null) return NotFound(new { Message = "HR user not found" });

                var updated = await _pointService.ApproveRedemptionAsync(id, hr.Id);
                return Ok(new { Success = true, Message = "Approval successful", Data = updated });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving redemption");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        // HR/Admin: Từ chối yêu cầu và hoàn điểm
        [HttpPost("redemptions/{id}/reject")]
        [Authorize(Roles = "HR,ADMIN")]
        public async Task<IActionResult> RejectRedemption(int id, [FromBody] RejectRedemptionRequest request)
        {
            try
            {
                var hrCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(hrCode)) return Unauthorized(new { Message = "Invalid token" });

                var hr = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == hrCode);
                if (hr == null) return NotFound(new { Message = "HR user not found" });

                var updated = await _pointService.RejectRedemptionAsync(id, hr.Id, request?.Notes);
                return Ok(new { Success = true, Message = "Rejection successful and points refunded", Data = updated });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting redemption");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        // Manager: Tặng điểm cho nhân viên
        [HttpPost("manager/give-points")]
        [Authorize(Roles = "MANAGER")]
        public async Task<IActionResult> GivePoints([FromBody] GivePointsRequest request)
        {
            try
            {
                var managerCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(managerCode))
                {
                    return Unauthorized(new { Message = "Invalid token" });
                }

                var manager = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == managerCode);
                if (manager == null)
                {
                    return NotFound(new { Message = "Manager not found" });
                }

                await _pointService.AddPointsAsync(
                    request.EmployeeId, 
                    request.Points, 
                    "BONUS", 
                    request.Reason ?? "Bonus from manager",
                    manager.Id
                );

                return Ok(new { Success = true, Message = "Points given successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error giving points");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
    }

    public class RedeemPointsRequest
    {
        public int Points { get; set; }
        public string? Method { get; set; } = "CASH";
    }

    public class GivePointsRequest
    {
        public int EmployeeId { get; set; }
        public int Points { get; set; }
        public string? Reason { get; set; }
    }

    public class RejectRedemptionRequest
    {
        public string? Notes { get; set; }
    }
}