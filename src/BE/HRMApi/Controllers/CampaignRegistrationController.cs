using HrmApi.Dtos.Campaigns;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employee/campaigns")]
    public class CampaignRegistrationController : ControllerBase
    {
        private readonly ICampaignRegistrationService _service;

        public CampaignRegistrationController(ICampaignRegistrationService service)
        {
            _service = service;
        }

        [HttpPost("{campaignCode}/register")]
        public async Task<IActionResult> Register(
            [FromRoute] string campaignCode,
            [FromBody] CampaignRegisterRequestDto request)
        {
            try
            {
                var reg = await _service.RegisterByEmployeeCodeAsync(campaignCode, request.EmployeeCode);

                var response = new CampaignRegisterResponseDto
                {
                    RegistrationId = reg.RegistrationId,
                    CampaignCode = campaignCode,
                    EmployeeCode = request.EmployeeCode,
                    Status = "Registered",
                    RegistrationDate = reg.RegistrationDate
                };

                return StatusCode(201, response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
