using HrmApi.Dtos.Campaigns;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/employee")]
    public class CampaignListController : ControllerBase
    {
        private readonly ICampaignListService _service;

        public CampaignListController(ICampaignListService service)
        {
            _service = service;
        }

        [HttpGet("view-campaigns")]
        public async Task<IActionResult> ViewCampaigns([FromQuery] CampaignListFilterDto filter)
        {
            var result = await _service.GetCampaignsAsync(filter);
            return Ok(result);
        }
    }
}
