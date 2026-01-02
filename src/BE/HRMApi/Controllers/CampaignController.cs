using HrmApi.Dtos;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignService _service;

        public CampaignController(ICampaignService service)
        {
            _service = service;
        }

        // API 1: Add Campaign
        [HttpPost("api/v1/hr/add-campaigns")]
        public async Task<IActionResult> AddCampaign([FromBody] CampaignCreateDto request)
        {
            try
            {
                var result = await _service.CreateCampaignAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex) // Lỗi validate input
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // API 2: Delete Campaign
        [HttpPatch("api/v1/campaigns/{campaign_code}/delete")]
        public async Task<IActionResult> DeleteCampaign(string campaign_code)
        {
            try
            {
                var result = await _service.DeleteCampaignAsync(campaign_code);
                
                // Nếu service trả về mã lỗi nghiệp vụ
                if (!string.IsNullOrEmpty(result.ErrorCode))
                {
                    return Ok(result); // Trả về 200 kèm message lỗi như đề bài yêu cầu
                }

                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Campaign not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}