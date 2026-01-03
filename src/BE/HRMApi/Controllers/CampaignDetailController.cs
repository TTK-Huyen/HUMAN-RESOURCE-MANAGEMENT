using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employee")]
    public class CampaignDetailController : ControllerBase
    {
        private readonly ICampaignDetailService _service;

        public CampaignDetailController(ICampaignDetailService service)
        {
            _service = service;
        }

        [HttpGet("view-campaigns-details")]
        public async Task<IActionResult> GetCampaignDetail([FromQuery] string campaign_code)
        {
            try
            {
                var result = await _service.GetDetailAsync(campaign_code);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
