using HrmApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/admin/rewards")]
    [Authorize(Roles = "HR")]
    public class MonthlyPointAllocationController : ControllerBase
    {
        private readonly MonthlyPointAllocationService _allocationService;
        private readonly ILogger<MonthlyPointAllocationController> _logger;

        public MonthlyPointAllocationController(
            MonthlyPointAllocationService allocationService,
            ILogger<MonthlyPointAllocationController> logger)
        {
            _allocationService = allocationService;
            _logger = logger;
        }

        // UC 2.4.1: Trigger automated monthly point allocation
        [HttpPost("monthly-allocation")]
        public async Task<IActionResult> TriggerMonthlyAllocation([FromBody] MonthlyAllocationRequest? request)
        {
            try
            {
                var result = await _allocationService.ExecuteMonthlyAllocationAsync(request?.TargetMonth);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering monthly allocation");
                return StatusCode(500, new { Success = false, Message = "Lỗi hệ thống" });
            }
        }
    }

    public class MonthlyAllocationRequest
    {
        public string? TargetMonth { get; set; } // Format: YYYY-MM
    }
}
