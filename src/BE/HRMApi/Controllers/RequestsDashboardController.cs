using System.Threading.Tasks;
using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/requests/dashboard")]
    public class RequestsDashboardController : ControllerBase
    {
        private readonly IRequestsDashboardService _requestsDashboardService;

        public RequestsDashboardController(IRequestsDashboardService requestsDashboardService)
        {
            _requestsDashboardService = requestsDashboardService;
        }

        // GET /api/v1/requests/dashboard/summary?departmentId=&keyword=
        [HttpGet("summary")]
        public async Task<ActionResult<RequestDashboardSummaryDto>> GetSummary(
            [FromQuery] RequestDashboardSummaryFilterDto filter)
        {
            var result = await _requestsDashboardService.GetSummaryAsync(filter);
            return Ok(result);
        }
    }
}
