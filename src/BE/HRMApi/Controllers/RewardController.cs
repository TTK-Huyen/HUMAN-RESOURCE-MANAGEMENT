using HrmApi.Dtos.Reward;
using HrmApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HrmApi.Controllers
{
    [Route("api/v1/rewards")]
    [ApiController]
    [Authorize]
    public class RewardController : ControllerBase
    {
        private readonly IRewardService _rewardService;

        public RewardController(IRewardService rewardService)
        {
            _rewardService = rewardService;
        }

        [HttpPost("manager/give-points")]
        [Authorize(Roles = "MANAGER,HR")] // Only Managers or HR can give points
        public async Task<IActionResult> GivePoints([FromBody] GivePointsRequestDto request)
        {
            try
            {
                // Get current user ID (Manager) from Token
                var managerId = User.FindFirst("EmployeeId")?.Value 
                                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(managerId))
                {
                    return Unauthorized(new { message = "User identity could not be determined." });
                }

                await _rewardService.GivePointsAsync(managerId, request);

                return Ok(new 
                { 
                    message = "Points awarded successfully!", 
                    details = new { 
                        recipient = request.TargetEmployeeId, 
                        points = request.Points 
                    } 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}