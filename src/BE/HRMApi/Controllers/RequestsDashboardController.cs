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
        private readonly IRequestsDashboardListService _listService;

        public RequestsDashboardController(IRequestsDashboardService requestsDashboardService, IRequestsDashboardListService listService)
        {
            _requestsDashboardService = requestsDashboardService;
            _listService = listService;
        }

        // GET /api/v1/requests/dashboard/summary?departmentId=&keyword=
        [HttpGet("summary")]
        public async Task<ActionResult<RequestDashboardSummaryDto>> GetSummary(
            [FromQuery] RequestDashboardSummaryFilterDto filter)
        {
            var result = await _requestsDashboardService.GetSummaryAsync(filter);
            return Ok(result);
        }
        // GET /api/v1/requests/dashboard?departmentId=1&keyword=Nguyen
        [HttpGet]
        public async Task<ActionResult<DashboardRequestListResponseDto>> Get([FromQuery] DashboardRequestFilterDto filter)
        {
            var result = await _listService.GetListAsync(filter);
            return Ok(result);
        }
    }
}
