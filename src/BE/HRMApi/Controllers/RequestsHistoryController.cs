using System.Threading.Tasks;
using HrmApi.Dtos.Requests;
using HrmApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HrmApi.Controllers
{
    [ApiController]
    [Route("api/v1/requests")]
    public class RequestsHistoryController : ControllerBase
    {
        private readonly IRequestHistoryService _service;

        public RequestsHistoryController(IRequestHistoryService service)
        {
            _service = service;
        }

        // GET /api/v1/requests/{requestId}/history
        [HttpGet("{requestId:int}/history")]
        public async Task<ActionResult<RequestApprovalHistoryResponseDto>> GetHistory(int requestId)
        {
            var result = await _service.GetApprovalHistoryAsync(requestId);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}
